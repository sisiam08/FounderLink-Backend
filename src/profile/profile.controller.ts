import { Body, Controller, Post,Get } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

@Post()
  createProfile(
     @CurrentUser('userId') userId: string,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.profileService.createProfile(
      userId,
    createProfileDto,
    );
  }


@Get('me')
getMyProfile(
  @CurrentUser('userId') userId: string,
) {
  return this.profileService.getMyProfile(userId);
}



}