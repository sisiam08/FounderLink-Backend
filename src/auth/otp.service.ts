import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OTP, OtpPurpose } from "./entities/otp.entity";
import { IsNull, Repository } from "typeorm";
import { OtpResult } from "./interfaces/otp.interface";
import { randomInt } from "crypto";
import { ConfigService } from "@nestjs/config";
import ms from 'ms';
import { compareToken } from "./token.utils";

@Injectable()
export class OTPService{
    constructor(
        @InjectRepository(OTP)
        private readonly otpRepo: Repository<OTP>,
        private readonly configService: ConfigService
    ){}

    private generateCode(length: number): string{
        const min = Math.pow(10, length-1);
        const max = Math.pow(10, length);

        return String(randomInt(min, max));
    }

    async createOTP(email: string, purpose: OtpPurpose, payload: Record<string, string>):Promise<OtpResult>{
        try {
            const length = Number(this.configService.getOrThrow<string>('OTP_LENGTH'));
            const code = this.generateCode(length);

            const expiresIn = ms(this.configService.getOrThrow<string>('OTP_EXPIRES_IN') as ms.StringValue);
            const expiresAt = new Date(Date.now() + expiresIn);

            const otp = this.otpRepo.create({
                email,
                purpose,
                code,
                payload,
                attempts: 0,
                expiresAt,
                consumedAt: null,
            })

            await this.otpRepo.save(otp);

            return {code, expiresAt};
            
        } catch (error) {
            throw error;            
        }
    }

    async verifyOTP(email: string, purpose: OtpPurpose, code: string): Promise<OTP>{
        try {
            const otp = await this.otpRepo.findOne({
                where:{
                    email, purpose, consumedAt: IsNull()
                },
                order:{
                    createdAt: 'DESC'
                }
            });

            if (!otp) {
                throw new UnauthorizedException('OTP not found or already used');
            }

            if (otp.expiresAt < new Date()) {
                throw new UnauthorizedException('OTP has expired');
            }

            const maxAttempts = Number(
                this.configService.getOrThrow<string>('OTP_MAX_ATTEMPTS'),
            );
    
            if (otp.attempts >= maxAttempts) {
                otp.consumedAt = new Date();
                await this.otpRepo.save(otp);
                throw new UnauthorizedException(
                    'Too many invalid attempts. Please request a new OTP.',
                );
            }

            if (!compareToken(code, otp.code)) {
                otp.attempts += 1;
                await this.otpRepo.save(otp);
                throw new UnauthorizedException('Invalid OTP');
            }

            otp.consumedAt = new Date();
            await this.otpRepo.save(otp);
            return otp;
        
        } catch (error) {
            throw error;
        }
    }
}