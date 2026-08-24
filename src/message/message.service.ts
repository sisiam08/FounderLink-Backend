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
import { EventEmitter2 } from '@nestjs/event-emitter';
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
    private readonly notificationGateway: NotificationGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async assertRoomAccess(
    applicationId: string,
    userId: string,
  ): Promise<Application> {
    const application = await this.applicationRepo.findOne({
      where: { id: applicationId },
      relations: {
        candidate: true,
        requirement: { startupIdea: { owner: true } },
      },
    });

    if (!application) {
      throw new NotAcceptableException('Application not found!');
    }

    const ownerId = application.requirement.startupIdea.owner.id;
    const candidateId = application.candidate.id;

    if (userId !== ownerId && userId !== candidateId) {
      throw new ForbiddenException(
        'You are not authorized to access this conversation',
      );
    }

    return application;
  }

  async getAcceptedApplicationIds(userId: string): Promise<string[]> {
    const applications = await this.applicationRepo
      .createQueryBuilder('app')
      .leftJoin('app.requirement', 'requirement')
      .leftJoin('requirement.startupIdea', 'startup')
      .leftJoin('startup.owner', 'owner')
      .leftJoin('app.candidate', 'candidate')
      .select(['app.id'])
      .where('(candidate.id = :userId OR owner.id = :userId)', { userId })
      .getMany();

    return applications.map((a) => a.id);
  }

  async sendMessage(userId: string, payload: SendMessageDto): Promise<Message> {
    const { applicationId, content } = payload;
    await this.assertRoomAccess(applicationId, userId);

    const message = this.messageRepo.create({
      application: { id: applicationId } as Application,
      sender: { id: userId } as User,
      content: content,
      isRead: false,
    });
    const savedMessage = await this.messageRepo.save(message);

    this.eventEmitter.emit('new.message', applicationId, {
      id: savedMessage.id,
      content: savedMessage.content,
      senderId: userId,
      createdAt: savedMessage.createdAt,
    });

    const application = await this.applicationRepo.findOne({
      where: { id: applicationId },
      relations: {
        requirement: { startupIdea: { owner: { profile: true } } },
        candidate: { profile: true },
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const ownerId = application.requirement.startupIdea.owner.id;
    const candidateId = application.candidate.id;

    const recipientId = ownerId === userId ? candidateId : ownerId;
    const senderName =
      ownerId === userId
        ? application.requirement.startupIdea.owner.fullName
        : application.candidate.fullName;
    const senderImage =
      ownerId === userId
        ? application.requirement.startupIdea.owner.profile?.photoUrl ?? null
        : application.candidate.profile?.photoUrl ?? null;

    await this.notificationService.sendNotification(
      recipientId,
      NotificationType.NEW_MESSAGE,
      {
        applicationId: applicationId,
        messagePreview: content.slice(0, 100),
        senderId: userId,
        senderName: senderName,
        senderImage: senderImage,
      },
    );

    const unreadCountSender = await this.getUnreadCount(userId);
    this.notificationGateway.emitUnreadCount(userId, unreadCountSender);

    const unreadCountRecipient = await this.getUnreadCount(recipientId);
    this.notificationGateway.emitUnreadCount(
      recipientId,
      unreadCountRecipient,
    );

    return savedMessage;
  }

  async getMessages(applicationId: string, userId: string): Promise<Message[]> {
    await this.assertRoomAccess(applicationId, userId);
    await this.markAsRead(applicationId, userId);
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
    const unreadCount = await this.getUnreadCount(userId);
    this.notificationGateway.emitUnreadCount(userId, unreadCount);
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
    // No .select() — leftJoinAndSelect must fully hydrate all relations
    const applications = await this.applicationRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.candidate', 'candidate')
      .leftJoinAndSelect('candidate.profile', 'candidateProfile')
      .leftJoinAndSelect('app.requirement', 'requirement')
      .leftJoinAndSelect('requirement.startupIdea', 'startup')
      .leftJoinAndSelect('startup.owner', 'owner')
      .leftJoinAndSelect('owner.profile', 'ownerProfile')
      .where('(candidate.id = :userId OR owner.id = :userId)', { userId })
      .getMany();

    if (applications.length === 0) {
      return [];
    }

    const applicationIds = applications.map((a) => a.id);

    const lastMessages = await this.messageRepo.query(
      `SELECT DISTINCT ON (m.application_id)
         m.application_id AS "applicationId",
         m.id AS "id",
         m.content AS "content",
         m.sender_id AS "senderId",
         m.is_read AS "isRead",
         m.created_at AS "createdAt"
       FROM messages m
       WHERE m.application_id = ANY($1)
       ORDER BY m.application_id, m.created_at DESC`,
      [applicationIds],
    );

    const lastMessageMap = new Map<string, any>();
    for (const msg of lastMessages) {
      lastMessageMap.set(msg.applicationId, msg);
    }

    const unreadMap = await this.getUnreadEachApplication(userId);

    const conversationList = applications.map((app) => {
      const isOwner = app.requirement?.startupIdea?.owner?.id === userId;
      const otherUser = isOwner
        ? app.candidate
        : app.requirement?.startupIdea?.owner;
      const lastMsg = lastMessageMap.get(app.id);

      const rawCreatedAt = lastMsg?.createdAt ?? lastMsg?.createdat ?? lastMsg?.created_at ?? null;
      const rawSenderId = lastMsg?.senderId ?? lastMsg?.senderid ?? lastMsg?.sender_id ?? '';
      const rawIsRead = lastMsg?.isRead ?? lastMsg?.isread ?? lastMsg?.is_read ?? false;

      return {
        applicationId: app.id,
        startupTitle: app.requirement?.startupIdea?.title ?? '',
        otherUser: {
          id: otherUser?.id ?? '',
          fullName: otherUser?.fullName ?? 'Unknown',
          photo: otherUser?.profile?.photoUrl ?? null,
        },
        lastMessage: lastMsg
          ? {
              id: lastMsg.id,
              content: lastMsg.content,
              senderId: rawSenderId,
              isRead: Boolean(rawIsRead),
              createdAt: rawCreatedAt ? new Date(rawCreatedAt).toISOString() : null,
            }
          : null,
        unreadCount: unreadMap[app.id] ?? 0,
      };
    });

    const sortedList = conversationList.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return sortedList;
  }
}
