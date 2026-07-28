import { Body, Controller, Post,Get,Patch ,Param, ParseUUIDPipe,
UseInterceptors,
  BadRequestException,
UploadedFile
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';





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


@Post('photo')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './src/uploads/profile',
      filename: (req, file, cb) => {
        const fileName = Date.now() + '-' + file.originalname;
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.originalname.match(/^.*\.(jpg|jpeg|png)$/i)) {
        cb(null, true);
      } else {
        cb(
         new BadRequestException(
             'Only .jpg, .jpeg and .png files are allowed',
           ),
          false,
        );
    }
    },
    limits: {
    fileSize: 3*1024*1024,
    },
  }),
)
uploadProfilePhoto(
   @CurrentUser('userId') userId: string,
  @UploadedFile() file: Express.Multer.File,
) {
  return this.profileService.uploadProfilePhoto(userId, file);
}





}