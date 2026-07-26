import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}


}