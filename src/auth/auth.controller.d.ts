import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { User } from "../../../../src/user/entities/user.entity";
import type { AuthenticatedUser, AuthResult } from './interfaces/auth.interface';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    constructor(authService: AuthService, configService: ConfigService);
    private getCookieOptions;
    signup(payload: SignupDto): Promise<{
        message: string;
        expiresAt: Date;
    }>;
    verifySignupOTP(payload: VerifyOtpDto): Promise<Partial<User>>;
    login(payload: LoginDto, req: Request, res: Response): Promise<Pick<AuthResult, 'user' | 'accessToken'>>;
    refresh(req: Request): Promise<{
        accessToken: string;
    }>;
    logout(user: AuthenticatedUser, req: Request): Promise<{
        message: string;
    }>;
    forgotPassword(payload: ForgotPasswordDto): Promise<{
        message: string;
        expiresAt: Date;
    }>;
    verifyForgotPasswordOtp(payload: VerifyOtpDto): Promise<{
        resetToken: string;
    }>;
    resetPassword(payload: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(user: AuthenticatedUser, payload: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getActiveSessions(user: AuthenticatedUser): Promise<Partial<import("./entities/user-session.entity").UserSession>[]>;
}
