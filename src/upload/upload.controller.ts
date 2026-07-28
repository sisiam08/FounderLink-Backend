import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { UploadService } from './upload.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Controller('profile')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: path.join(process.cwd(), 'uploads', 'profile-photos'),
        filename: (req, file, cb) => {
          const user = (req as unknown as { user?: { userId: string } }).user;
          const userId = user?.userId ?? 'unknown';
          const ext = file.originalname.split('.').pop();
          cb(null, `${userId}-${Date.now()}.${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.uploadService.uploadPhoto(userId, file);
  }
}
