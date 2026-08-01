import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { CofounderRequirement } from '../requirement/entities/cofounder-requirement.entity';
import { Profile } from '../profile/entities/profile.entity';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, CofounderRequirement, Profile]),
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
