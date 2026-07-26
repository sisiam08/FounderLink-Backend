import { Notification, NotificationType } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { NotificationGateway } from './notification.gateway';
export declare class NotificationService {
    private readonly notificationRepo;
    private readonly notificationGateway;
    constructor(notificationRepo: Repository<Notification>, notificationGateway: NotificationGateway);
    sendNotification(userId: string, type: NotificationType, payload: Record<string, unknown>): Promise<Notification>;
    getAllNotificationsByUser(userId: string): Promise<Notification[]>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
}
