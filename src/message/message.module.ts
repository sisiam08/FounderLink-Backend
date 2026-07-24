import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Application } from 'src/application/entities/application.entity';
import { StartupIdea } from 'src/startup/entities/startup-idea.entity';
import { CofounderRequirement } from 'src/requirement/entities/cofounder-requirement.entity';
import { Profile } from 'src/profile/entities/profile.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Message, Application, StartupIdea, CofounderRequirement, Profile])],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
