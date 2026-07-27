import { MessageService } from './message.service';
export declare class MessageController {
    private readonly messageService;
    constructor(messageService: MessageService);
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    getUnreadByApplication(userId: string): Promise<Record<string, number>>;
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
    getMessages(applicationId: string, userId: string): Promise<import("./entities/message.entity").Message[]>;
}
