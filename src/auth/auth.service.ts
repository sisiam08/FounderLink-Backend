import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResult } from './interfaces/auth.interface';
import { SessionMetaData } from './interfaces/session.interface';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { SessionService } from './session.service';
import { OTPService } from './otp.service';
import { OtpPurpose } from './entities/otp.entity';
import { MailService } from 'src/mail/mail.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { StringValue } from 'ms';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserSession } from './entities/user-session.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly otpService: OTPService,
    private readonly mailService: MailService,
  ) {}

  private assertUserActive(status: UserStatus): void {
    if (status === UserStatus.SUSPENDED)
      throw new ForbiddenException('Account is suspended');

    if (status === UserStatus.BANNED)
      throw new ForbiddenException('Account is banned');
  }

  private async issueTokens(
    user: User,
    metadata: SessionMetaData,
  ): Promise<AuthResult> {
    try {
      const { session, refreshToken } = await this.sessionService.createSession(
        user,
        metadata,
      );

      const accessToken = this.jwtService.sign({
        userId: user.id,
        sessionId: session.id,
      });

      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async signup(
    payload: SignupDto,
  ): Promise<{ message: string; expiresAt: Date }> {
    const { fullName, email, password } = payload;
    try {
      const existingUser = await this.userRepo.findOne({
        where: {
          email,
        },
      });

      if (existingUser) {
        throw new ConflictException('Email already registered!');
      }
      const saltRound = Number(
        this.configService.getOrThrow<number>('SALT_ROUND'),
      );

      const passwordHash = await bcrypt.hash(password, saltRound);

      const { code, expiresAt } = await this.otpService.createOTP(
        email,
        OtpPurpose.SIGNUP,
        { fullName, passwordHash },
      );

      await this.mailService.sendOTPMail(email, code, OtpPurpose.SIGNUP);

      return {
        message: 'OTP sent to your email. Verify to complete signup.',
        expiresAt,
      };
    } catch (error) {
      throw error;
    }
  }

  async verifySignupOTP(payload: VerifyOtpDto): Promise<Partial<User>> {
    const { email, code } = payload;
    try {
      const existingUser = await this.userRepo.findOneBy({
        email,
      });

      if (existingUser) {
        throw new ConflictException('Email already registered!');
      }

      const otp = await this.otpService.verifyOTP(
        email,
        code,
        OtpPurpose.SIGNUP,
      );
      if (!otp) {
        throw new UnauthorizedException('Invalid OTP!');
      }

      const { fullName, passwordHash } = otp.payload as {
        fullName: string;
        passwordHash: string;
      };

      const user = this.userRepo.create({
        fullName,
        email,
        password: passwordHash,
      });

      const data = await this.userRepo.save(user);

      const { password: _password, googleId, ...restUser } = data;

      return restUser;
    } catch (error) {
      throw error;
    }
  }

  async login(
    payload: LoginDto,
    metadata: SessionMetaData,
  ): Promise<AuthResult> {
    const { email, password } = payload;
    try {
      const user = await this.userRepo.findOne({
        where: {
          email,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          password: true,
          status: true,
        },
      });
      if (!user || !user.password) {
        throw new UnauthorizedException('Invalid Credentials!');
      }
      const isPasswordValid = await bcrypt.compare(password, user.password!);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid Credentials!');
      }

      this.assertUserActive(user.status);

      return await this.issueTokens(user, metadata);
    } catch (error) {
      throw error;
    }
  }

  async rotateRefreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    try {
      const session = await this.sessionService.validateSession(refreshToken);
      if (session.user) {
        this.assertUserActive(session.user.status);
      }

      const accessToken = this.jwtService.sign({
        userId: session.user.id,
        sessionId: session.id,
      });
      return { accessToken };
    } catch (error) {
      throw error;
    }
  }

  async logout(sessionId: string, refreshToken: string): Promise<boolean> {
    try {
      const session = await this.sessionService.validateSession(refreshToken);
      if (session.user) {
        this.assertUserActive(session.user.status);
      }

      return await this.sessionService.revokeSession(sessionId);
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(
    payload: ForgotPasswordDto,
  ): Promise<{ message: string; expiresAt: Date }> {
    try {
      const user = await this.userRepo.findOne({
        where: { email: payload.email },
        select: {
          id: true,
          fullName: true,
          email: true,
          password: true,
          status: true,
        },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new NotFoundException('User not found');
      }

      const { code, expiresAt } = await this.otpService.createOTP(
        user.email,
        OtpPurpose.PASSWORD_RESET,
        { userId: user.id },
      );

      await this.mailService.sendOTPMail(
        user.email,
        code,
        OtpPurpose.PASSWORD_RESET,
      );

      return {
        message:
          'If you have an active account, an OTP has been sent to your email. Verify to continue.',
        expiresAt,
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyForgotPasswordOTP(
    payload: VerifyOtpDto,
  ): Promise<{ resetToken: string }> {
    const { email, code } = payload;
    try {
      const otp = await this.otpService.verifyOTP(
        email,
        code,
        OtpPurpose.PASSWORD_RESET,
      );

      if (!otp) {
        throw new UnauthorizedException('Invalid OTP!');
      }

      const resetToken = this.jwtService.sign(
        {
          userId: otp.payload.userId,
          email,
          purpose: OtpPurpose.PASSWORD_RESET,
        },
        {
          secret: this.configService.getOrThrow<string>(
            'PASSWORD_RESET_TOKEN_SECRET',
          ),
          expiresIn: this.configService.getOrThrow<string>(
            'PASSWORD_RESET_TOKEN_EXPIRES_IN',
          ) as StringValue,
        },
      );

      return { resetToken };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(payload: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = payload;

    try {
      const decodeToken = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow<string>(
          'PASSWORD_RESET_TOKEN_SECRET',
        ),
      });

      const { userId, email, purpose } = decodeToken;

      if (purpose !== OtpPurpose.PASSWORD_RESET) {
        throw new UnauthorizedException('Invalid reset token!');
      }
      const user = await this.userRepo.findOne({
        where: { id: userId, email },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Invalid reset token!');
      }

      const saltRound = Number(
        this.configService.getOrThrow<string>('SALT_ROUND'),
      );

      const passwordHash = await bcrypt.hash(newPassword, saltRound);

      await this.userRepo.update(userId, { password: passwordHash });

      await this.sessionService.revokeAllSessions(userId);

      return { message: 'Password reset successful!' };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token Expired!');
      }
      throw error;
    }
  }

  async changePassword(
    userId: string,
    sessionId: string,
    payload: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = payload;
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        "New password can't be same as current password!",
      );
    }
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        select: {
          id: true,
          password: true,
        },
      });

      if (!user || !user.password) {
        throw new UnauthorizedException(
          'Password change not available for this account',
        );
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect!');
      }

      const saltRound = Number(
        this.configService.getOrThrow<string>('SALT_ROUND'),
      );

      const passwordHash = await bcrypt.hash(newPassword, saltRound);

      await this.userRepo.update(userId, { password: passwordHash });

      await this.sessionService.revokeAllSessions(userId, sessionId);

      return { message: 'Password changed successfully!' };
    } catch (error) {
      throw error;
    }
  }

  async getActiveSessions(userId: string):Promise<Partial<UserSession>[]>{
    const sessions = await this.sessionService.getActiveSessions(userId);

    if(sessions.length == 0){
      throw new NotFoundException("No active sessions found!")
    }
    return sessions.map((s)=>({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      expiresAt: s.expiresAt,
      lastActiveAt: s.lastActiveAt,
      createdAt: s.createdAt
    }));
  }
}
