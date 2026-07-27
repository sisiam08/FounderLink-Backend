import { Body, Controller, Post,Get,Patch ,Param, ParseUUIDPipe} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

@Patch('me')
updateMyProfile(
    @CurrentUser('userId') userId: string,
  @Body() updateProfileDto: UpdateProfileDto,
) {
     return this.profileService.updateMyProfile(
    userId,
    updateProfileDto,
  );
}


@Get(':userId')
getProfileByUserId(
   @Param('userId', new ParseUUIDPipe({ version: '4' }))
  userId: string,
) {
  return this.profileService.getProfileByUserId(userId);
}


}