import { User } from "../../../../src/user/entities/user.entity";
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResult } from './interfaces/auth.interface';
import { SessionMetaData } from './interfaces/session.interface';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from './session.service';
import { OTPService } from './otp.service';
import { MailService } from "../../../../src/mail/mail.service";
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserSession } from './entities/user-session.entity';
export declare class AuthService {
    private readonly userRepo;
    private readonly configService;
    private readonly jwtService;
    private readonly sessionService;
    private readonly otpService;
    private readonly mailService;
    constructor(userRepo: Repository<User>, configService: ConfigService, jwtService: JwtService, sessionService: SessionService, otpService: OTPService, mailService: MailService);
    private assertUserActive;
    private issueTokens;
    signup(payload: SignupDto): Promise<{
        message: string;
        expiresAt: Date;
    }>;
    verifySignupOTP(payload: VerifyOtpDto): Promise<Partial<User>>;
    login(payload: LoginDto, metadata: SessionMetaData): Promise<AuthResult>;
    rotateRefreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    logout(sessionId: string, refreshToken: string): Promise<boolean>;
    forgotPassword(payload: ForgotPasswordDto): Promise<{
        message: string;
        expiresAt: Date;
    }>;
    verifyForgotPasswordOTP(payload: VerifyOtpDto): Promise<{
        resetToken: string;
    }>;
    resetPassword(payload: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(userId: string, sessionId: string, payload: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getActiveSessions(userId: string): Promise<Partial<UserSession>[]>;
}
