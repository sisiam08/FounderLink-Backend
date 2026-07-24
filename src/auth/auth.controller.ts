import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { User } from 'src/user/entities/user.entity';
import type {
  AuthenticatedUser,
  AuthResult,
} from './interfaces/auth.interface';
import { LoginDto } from './dto/login.dto';
import type { CookieOptions, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private getCookieOptions(): CookieOptions {
    const isProd =
      this.configService.getOrThrow<string>('NODE_ENV') === 'production';

    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: ms(
        this.configService.getOrThrow<string>(
          'JWT_REFRESH_EXPIRES_IN',
        ) as ms.StringValue,
      ),
    };
  }

  @Public()
  @Post('signup')
  async signup(
    @Body() payload: SignupDto,
  ): Promise<{message: string, expiresAt: Date}> {
    return this.authService.signup(payload);
  }

  @Public()
  @Post('signup/verify-otp')
  async verifySignupOTP(@Body() payload: VerifyOtpDto): Promise<Partial<User>>{
    return this.authService.verifySignupOTP(payload);
  }

  @Public()
  @Post('login')
  async login(
    @Body() payload: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Pick<AuthResult, 'user' | 'accessToken'>> {
    const result = await this.authService.login(payload, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.cookie('refreshToken', result.refreshToken, this.getCookieOptions());

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request): Promise<{ accessToken: string }> {
    const refreshToken = req.cookies.refreshToken as string;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh Token Missing');
    }
    return await this.authService.rotateRefreshToken(refreshToken);
  }

  @Post('logout')
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const refreshToken = req.cookies.refreshToken as string;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh Token Missing');
    }
    const result = await this.authService.logout(user.sessionId, refreshToken);
    if (!result) {
      throw new UnauthorizedException('Logout Failed');
    }

    return {
      message: 'Logout successful',
    };
  }

 @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() payload: ForgotPasswordDto) {
    return this.authService.forgotPassword(payload);
  }

  @Public()
  @Post('forgot-password/verify-otp')
  async verifyForgotPasswordOtp(@Body() payload: VerifyOtpDto) {
    return this.authService.verifyForgotPasswordOTP(payload);
  }

  @Public()
  @Post('forgot-password/reset')
  async resetPassword(@Body() payload: ResetPasswordDto) {
    return this.authService.resetPassword(payload);
  }

  @Patch('change-password')
  async changePassword(@CurrentUser() user: AuthenticatedUser, @Body() payload: ChangePasswordDto) {
    return this.authService.changePassword(user.userId, user.sessionId, payload);
  }

  @Get('active-sessions')
  async getActiveSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getActiveSessions(user.userId);
  }

}
