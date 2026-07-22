import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { CookieOptions, Request, Response } from 'express';
import { AuthResult } from './interfaces/auth.interface';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) { }

  private getCookieOptions(): CookieOptions {
    const isProd = this.configService.getOrThrow<string>('NODE_ENV') === 'production';

    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: ms(this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN') as ms.StringValue)
    }

  }
  
   @Post('signup')
  async signup(@Body() payload: SignupDto): Promise<Pick<User, 'id' | 'fullName' | 'email' | 'status'>> {
    return this.authService.signup(payload);
  }

  @Post('login')
  async login(@Body() payload: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<Pick<AuthResult, 'user' | 'accessToken'>> {

    const result = await this.authService.login(payload, { ipAddress: req.ip, userAgent: req.get('User-Agent') });

    res.cookie('refreshToken', result.refreshToken, this.getCookieOptions());

    return {
      user: result.user,
      accessToken: result.accessToken
    }

 
}
