import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResult } from './interfaces/auth.interface';
import { SessionMetaData } from './interfaces/session.interface';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from './session.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly sessionService: SessionService
    ) { }

    private asserUserActive(status: UserStatus): void {
        if (status === UserStatus.SUSPENDED) throw new ForbiddenException("Account is suspended");

        if (status === UserStatus.BANNED) throw new ForbiddenException("Account is banned");
    }

    private async issueTokens(user: User, metadata: SessionMetaData): Promise<AuthResult> {
        try {
            const { session, refreshToken } = await this.sessionService.createSession(user, metadata);

            const accessToken = this.jwtService.sign({
                userId: user.id,
                sessionId: session.id
            });

            return {
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email
                },
                accessToken,
                refreshToken
            };
        } catch (error) {
            throw new InternalServerErrorException("Failed to issue tokens")
        }
    }

    async signup(payload: SignupDto): Promise<Pick<User, 'id' | 'fullName' | 'email' | 'status'>> {
        const { fullName, email, password } = payload;
        try {
            const existingUser = await this.userRepo.findOne({
                where: {
                    email
                }
            })

            if (existingUser) {
                throw new ConflictException("Email already registered!")
            }
            const saltRound = Number(this.configService.getOrThrow<number>('SALT_ROUND'));

            const passwordHash = await bcrypt.hash(password, saltRound);

            const newUser = this.userRepo.create({
                fullName,
                email,
                password: passwordHash
            });

            const data = await this.userRepo.save(newUser);

            const { password: _password, googleId, ...restUser } = data;
            return restUser;
        } catch (error) {
            throw error
        }
    }

    async login(payload: LoginDto, metadata: SessionMetaData): Promise<AuthResult> {
        const { email, password } = payload;

        try {
            const user = await this.userRepo.findOne({
                where: {
                    email
                },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    password: true,
                    status: true
                }
            })
            if (!user || !user.password) {
                throw new UnauthorizedException("Invalid Credentials!")
            }
            const isPasswordValid = await bcrypt.compare(password, user.password!);

            if (!isPasswordValid) {
                throw new UnauthorizedException("Invalid Credentials!");
            }

            this.asserUserActive(user.status);

            return await this.issueTokens(user, metadata);

        } catch (error) {
            throw new InternalServerErrorException("Internal Server Error");
        }
    }
}
