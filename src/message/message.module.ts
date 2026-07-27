import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Application } from 'src/application/entities/application.entity';
import { StartupIdea } from 'src/startup/entities/startup-idea.entity';
import { CofounderRequirement } from 'src/requirement/entities/cofounder-requirement.entity';
import { User } from 'src/user/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Profile } from 'src/profile/entities/profile.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { MessageGateway } from './messate.gatewaye';
import { MessageController } from './message.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Application, StartupIdea, CofounderRequirement, User, Profile]),
    AuthModule,
    NotificationModule
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway],
})
export class MessageModule { }
