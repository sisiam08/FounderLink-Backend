import { MessageService } from './message.service';
export declare class MessageController {
    private readonly messageService;
    constructor(messageService: MessageService);
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    getUnreadByApplication(userId: string): Promise<Record<string, number>>;
    getConversations(userId: string): Promise<any>;
    getMessages(applicationId: string, userId: string): Promise<import("./entities/message.entity").Message[]>;
}
