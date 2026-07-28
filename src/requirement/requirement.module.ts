import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CofounderRequirement } from './entities/cofounder-requirement.entity';
import { StartupIdea } from '../startup/entities/startup-idea.entity';
import { Profile } from '../profile/entities/profile.entity';
import { RequirementService } from './requirement.service';
import { RequirementController } from './requirement.controller';
import { CompatibilityService } from './compatibility.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CofounderRequirement, StartupIdea, Profile]),
  ],
  controllers: [RequirementController],
  providers: [RequirementService, CompatibilityService],
  exports: [CompatibilityService, RequirementService],
})
export class RequirementModule {}
