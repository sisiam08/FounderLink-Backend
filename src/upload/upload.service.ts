import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { Profile } from '../profile/entities/profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(
    process.cwd(),
    'uploads',
    'profile-photos',
  );
  private readonly maxFileSize: number;

  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    private readonly configService: ConfigService,
  ) {
    this.maxFileSize =
      (this.configService.get<number>('UPLOAD_MAX_FILE_SIZE_MB') ?? 2) *
      1024 *
      1024;
  }


   async uploadPhoto(
    userId: string,
    file: Express.Multer.File,
  ): Promise<Profile> {
    const profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Delete previous photo if it exists
    if (profile.photoUrl) {
      const oldPath = path.join(process.cwd(), profile.photoUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const photoUrl = `/uploads/profile-photos/${file.filename}`;
    profile.photoUrl = photoUrl;
    return this.profileRepo.save(profile);
  }
}
