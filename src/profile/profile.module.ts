import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Profile } from './entities/profile.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, User])],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
