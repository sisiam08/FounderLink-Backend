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
}
