import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { SendMessageDto } from './dto/send-message.dto';
import { Application } from "../../../../src/application/entities/application.entity";
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationGateway } from "../../../../src/notification/notification.gateway";
import { NotificationService } from "../../../../src/notification/notification.service";
export declare class MessageService {
    private readonly messageRepo;
    private readonly applicationRepo;
    private readonly eventEmitter;
    private readonly notificationService;
    private readonly notificationGateway;
    constructor(messageRepo: Repository<Message>, applicationRepo: Repository<Application>, eventEmitter: EventEmitter2, notificationService: NotificationService, notificationGateway: NotificationGateway);
    assertRoomAccess(applicationId: string, userId: string): Promise<Application>;
    getAcceptedApplicationIds(userId: string): Promise<string[]>;
    sendMessage(userId: string, payload: SendMessageDto): Promise<Message>;
    getMessages(applicationId: string, userId: string): Promise<Message[]>;
    markAsRead(applicationId: string, userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
    getUnreadEachApplication(userId: string): Promise<Record<string, number>>;
    getConversations(userId: string): Promise<{
        applicationId: any;
        startupTitle: any;
        otherUser: {
            id: any;
            fullName: any;
            photo: any;
        };
        lastMessage: {
            id: any;
            content: any;
            senderId: any;
            isRead: any;
            createdAt: any;
        } | null;
        unreadCount: number;
    }[]>;
}
