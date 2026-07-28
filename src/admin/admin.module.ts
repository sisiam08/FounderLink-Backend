import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserSession } from '../auth/entities/user-session.entity';
import { StartupIdea } from '../startup/entities/startup-idea.entity';
import { CofounderRequirement } from '../requirement/entities/cofounder-requirement.entity';
import { Application } from '../application/entities/application.entity';
import { Message } from '../message/entities/message.entity';
import { AdminStatsService } from './stats/admin-stats.service';
import { AdminStatsController } from './stats/admin-stats.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserSession,
      StartupIdea,
      CofounderRequirement,
      Application,
      Message,
      Notification,
    ]),
  ],
  controllers: [
    AdminStatsController,
  ],
  providers: [AdminStatsService],
})
export class AdminModule {}
