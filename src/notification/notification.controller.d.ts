import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getAllNotificationsByUser(userId: string): Promise<Notification[]>;
    markAsRead(notificationId: string, userId: string): Promise<{
        message: string;
    }>;
}
