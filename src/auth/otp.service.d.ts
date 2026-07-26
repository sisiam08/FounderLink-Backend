import { OTP, OtpPurpose } from "./entities/otp.entity";
import { Repository } from "typeorm";
import { OtpResult } from "./interfaces/otp.interface";
import { ConfigService } from "@nestjs/config";
export declare class OTPService {
    private readonly otpRepo;
    private readonly configService;
    constructor(otpRepo: Repository<OTP>, configService: ConfigService);
    private generateCode;
    createOTP(email: string, purpose: OtpPurpose, payload: Record<string, string>): Promise<OtpResult>;
    verifyOTP(email: string, code: string, purpose: OtpPurpose): Promise<OTP>;
}
