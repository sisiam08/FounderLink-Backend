import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { SendMessageDto } from './dto/send-message.dto';
import { Application } from '../application/entities/application.entity';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationService } from '../notification/notification.service';
export declare class MessageService {
    private readonly messageRepo;
    private readonly applicationRepo;
    private readonly notificationService;
    private readonly notificationGateway;
    constructor(messageRepo: Repository<Message>, applicationRepo: Repository<Application>, notificationService: NotificationService, notificationGateway: NotificationGateway);
    private readonly eventEmitter;
    assertRoomAccess(applicationId: string, userId: string): Promise<Application>;
    getAcceptedApplicationIds(userId: string): Promise<string[]>;
    sendMessage(userId: string, payload: SendMessageDto): Promise<Message>;
    getMessages(applicationId: string, userId: string): Promise<Message[]>;
    markAsRead(applicationId: string, userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
    getUnreadEachApplication(userId: string): Promise<Record<string, number>>;
    getConversations(userId: string): Promise<{
        applicationId: string;
        startupTitle: string;
        otherUser: {
            id: string;
            fullName: string;
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
