import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../profile/entities/profile.entity';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Profile])],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
