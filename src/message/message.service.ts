import {
  ForbiddenException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Not, Repository } from 'typeorm';
import { SendMessageDto } from './dto/send-message.dto';
import {
  Application,
  ApplicationStatus,
} from 'src/application/entities/application.entity';
import { User } from 'src/user/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async assertRoomAccess(
    applicationId: string,
    userId: string,
  ): Promise<Application> {
    try {
      const application = await this.applicationRepo
        .createQueryBuilder('app')
        .leftJoin('app.candidate', 'candidate')
        .leftJoin('app.requirement', 'requirement')
        .leftJoin('requirement.startupIdea', 'startup')
        .leftJoin('startup.owner', 'owner')
        .select(['app.id', 'app.status', 'candidate.id', 'requirement.id', 'startup.id', 'owner.id'])
        .where('app.id = :id', { id: applicationId })
        .getOne();

      if (!application) {
        throw new NotAcceptableException('Application not found!');
      }
      if (application.status !== ApplicationStatus.ACCEPTED) {
        throw new ForbiddenException(
          'Messaging is only available for accepted applications',
        );
      }

      const ownerId = application.requirement.startupIdea.owner.id;
      const candidateId = application.candidate.id;

      console.log(userId);
      console.log(ownerId);
      console.log(candidateId);

      if (userId !== ownerId && userId !== candidateId) {
        throw new ForbiddenException(
          'You are not authorized to access this conversation',
        );
      }

      return application;
    } catch (error) {
      throw error;
    }
  }

  async sendMessage(
    userId: string,
    payload: SendMessageDto,
  ): Promise<Message> {
    const { applicationId, content } = payload;
    try {
      const message = this.messageRepo.create({
        application: { id: applicationId } as Application,
        sender: { id: userId } as User,
        content: content,
        isRead: false,
      });
      const savedMessage = await this.messageRepo.save(message);

      this.eventEmitter.emit('new.message', {
        applicationId,
        message: {
          id: savedMessage.id,
          content: savedMessage.content,
          senderId: savedMessage.sender.id,
          createdAt: savedMessage.createdAt,
        },
      });

      return savedMessage;
    } catch (error) {
      throw error;
    }
  }

  async getMessages(applicationId: string, userId: string): Promise<Message[]> {
    await this.assertRoomAccess(applicationId, userId);
    return this.messageRepo.find({
      where: { application: { id: applicationId } },
      relations: { sender: true },
      order: { createdAt: 'ASC' },
    });
  }

  async markAsRead(applicationId: string, userId: string): Promise<void> {
    await this.messageRepo.update(
      {
        application: { id: applicationId },
        sender: { id: Not(userId) },
      },
      { isRead: true },
    );
  }
}
