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
} from '../application/entities/application.entity';
import { User } from '../user/entities/user.entity';
import { EventEmitter } from 'events';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/entities/notification.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway
  ) { }

  private readonly eventEmitter = new EventEmitter();

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
        .select([
          'app.id',
          'app.status',
          'candidate.id',
          'requirement.id',
          'startup.id',
          'owner.id',
        ])
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

  async getAcceptedApplicationIds(userId: string): Promise<string[]> {
    const [mine, received] = await Promise.all([
      this.applicationRepo.find({
        where: {
          candidate: { id: userId },
          status: ApplicationStatus.ACCEPTED,
        },
        select: { id: true },
      }),
      this.applicationRepo.find({
        where: {
          requirement: { startupIdea: { owner: { id: userId } } },
          status: ApplicationStatus.ACCEPTED,
        },
        select: { id: true },
      }),
    ]);

    return [...mine, ...received].map((a) => a.id);
  }

  async sendMessage(userId: string, payload: SendMessageDto): Promise<Message> {
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

      const application = await this.applicationRepo.findOne({
        where: { id: applicationId },
        relations: { requirement: { startupIdea: { owner: { profile: true } } }, candidate: { profile: true } },
      });

      if (!application) {
        throw new Error('Application not found');
      }

      const ownerId = application.requirement.startupIdea.owner.id;
      const candidateId = application.candidate.id;

      const recipientId = ownerId === userId ? candidateId : ownerId;
      const senderName = ownerId === userId ? application.requirement.startupIdea.owner.fullName : application.candidate.fullName;
      const senderImage = ownerId === userId ? application.requirement.startupIdea.owner.profile.photoUrl : application.candidate.profile.photoUrl;

      await this.notificationService.sendNotification(recipientId, NotificationType.NEW_MESSAGE, {
        applicationId: applicationId,
        messagePreview: content.slice(0, 100),
        senderId: userId,
        senderName: senderName,
        senderImage: senderImage
      })

      const unreadCountSender = await this.getUnreadCount(userId);
      this.notificationGateway.emitUnreadCount(userId, unreadCountSender);

      const unreadCountRecipient = await this.getUnreadCount(recipientId);
      this.notificationGateway.emitUnreadCount(recipientId, unreadCountRecipient);

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

  async getUnreadCount(userId: string): Promise<number> {
    const acceptedIds = await this.getAcceptedApplicationIds(userId);
    if (acceptedIds.length === 0) return 0;

    const count = this.messageRepo
      .createQueryBuilder('m')
      .where('m.application_id IN (:...ids)', { ids: acceptedIds })
      .andWhere('m.sender_id != :userId', { userId })
      .andWhere('m.is_read = false')
      .getCount();

    return count;
  }

  async getUnreadEachApplication(
    userId: string,
  ): Promise<Record<string, number>> {
    const acceptedIds = await this.getAcceptedApplicationIds(userId);
    if (acceptedIds.length === 0) return {};

    const rows = await this.messageRepo
      .createQueryBuilder('m')
      .select('m.application_id', 'applicationId')
      .addSelect('COUNT(*)', 'count')
      .where('m.application_id IN (:...ids)', { ids: acceptedIds })
      .andWhere('m.sender_id != :userId', { userId })
      .andWhere('m.is_read = false')
      .groupBy('m.application_id')
      .getRawMany();

    const result: Record<string, number> = {};
    for (const { applicationId, count } of rows) {
      result[applicationId] = parseInt(count, 10);
    }
    return result;
  }

  async getConversations(userId: string) {
    const applications = await this.applicationRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.candidate', 'candidate')
      .leftJoinAndSelect('app.requirement', 'requirement')
      .leftJoinAndSelect('requirement.startupIdea', 'startup')
      .leftJoinAndSelect('startup.owner', 'owner')
      .where('app.status = :status', { status: ApplicationStatus.ACCEPTED })
      .andWhere('(candidate.id = :userId OR owner.id = :userId)', { userId })
      .select([
        'app.id',
        'candidate.id',
        'candidate.fullName',
        'owner.id',
        'owner.fullName',
        'startup.id',
        'startup.title',
        'requirement.id',
      ])
      .getMany();

    if (applications.length === 0) return [];

    const applicationIds = applications.map((a) => a.id);

    const lastMessages = await this.messageRepo
      .createQueryBuilder('m')
      .select(
        'DISTINCT ON (m.application_id) m.application_id',
        'applicationId',
      )
      .addSelect('m.id', 'id')
      .addSelect('m.content', 'content')
      .addSelect('m.sender_id', 'senderId')
      .addSelect('m.is_read', 'isRead')
      .addSelect('m.created_at', 'createdAt')
      .where('m.application_id IN (:...ids)', { ids: applicationIds })
      .orderBy('m.application_id')
      .addOrderBy('m.created_at', 'DESC')
      .getRawMany();

    const lastMessageMap = new Map<string, (typeof lastMessages)[0]>();
    for (const msg of lastMessages) {
      lastMessageMap.set(msg.applicationId, msg);
    }

    const unreadMap = await this.getUnreadEachApplication(userId);

    const conversationList = applications.map((app) => {
      const isOwner = app.requirement.startupIdea.owner.id === userId;
      const otherUser = isOwner
        ? app.candidate
        : app.requirement.startupIdea.owner;
      const lastMsg = lastMessageMap.get(app.id);

      return {
        applicationId: app.id,
        startupTitle: app.requirement.startupIdea.title,
        otherUser: {
          id: otherUser.id,
          fullName: otherUser.fullName,
          photo: otherUser.profile.photoUrl,
        },
        lastMessage: lastMsg
          ? {
              id: lastMsg.id,
              content: lastMsg.content,
              senderId: lastMsg.senderId,
              isRead: lastMsg.isRead,
              createdAt: lastMsg.createdAt,
            }
          : null,
        unreadCount: unreadMap[app.id] ?? 0,
      };
    });

    return conversationList.sort(
      (a, b) =>
        new Date(b.lastMessage?.createdAt ?? 0).getTime() -
        new Date(a.lastMessage?.createdAt ?? 0).getTime(),
    );
  }
}
