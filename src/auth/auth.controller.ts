import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { User } from 'src/user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  async signup(@Body() payload: SignupDto): Promise<Pick<User, 'id' | 'fullName' | 'email' | 'status'>> {
    return this.authService.signup(payload);
  }

}
