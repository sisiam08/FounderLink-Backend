import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CofounderRequirement } from '../requirement/entities/cofounder-requirement.entity';
import { StartupIdea } from './entities/startup-idea.entity';
import { StartupController } from './startup.controller';
import { StartupService } from './startup.service';

@Module({
  imports: [TypeOrmModule.forFeature([StartupIdea, CofounderRequirement])],
  controllers: [StartupController],
  providers: [StartupService],
  exports: [StartupService],
})
export class StartupModule {}
