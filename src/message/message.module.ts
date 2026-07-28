import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Application } from '../application/entities/application.entity';
import { StartupIdea } from '../startup/entities/startup-idea.entity';
import { CofounderRequirement } from '../requirement/entities/cofounder-requirement.entity';
import { User } from '../user/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { Profile } from '../profile/entities/profile.entity';
import { NotificationModule } from '../notification/notification.module';
import { MessageGateway } from './messate.gatewaye';
import { MessageController } from './message.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      Application,
      StartupIdea,
      CofounderRequirement,
      User,
      Profile,
    ]),
    AuthModule,
    NotificationModule,
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway],
})
export class MessageModule {}
