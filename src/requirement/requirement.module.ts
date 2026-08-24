import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CofounderRequirement } from './entities/cofounder-requirement.entity';
import { StartupIdea } from '../startup/entities/startup-idea.entity';
import { Profile } from '../profile/entities/profile.entity';
import { RequirementService } from './requirement.service';
import { RequirementController } from './requirement.controller';
import { CompatibilityService } from './compatibility.service';
import { Application } from 'src/application/entities/application.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { ApplicationModule } from 'src/application/application.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CofounderRequirement,
      StartupIdea,
      Profile,
      Application,
    ]),
    NotificationModule,
    ApplicationModule,
  ],
  controllers: [RequirementController],
  providers: [RequirementService, CompatibilityService],
  exports: [CompatibilityService, RequirementService],
})
export class RequirementModule {}
