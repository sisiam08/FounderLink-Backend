import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepo: Repository<Notification>,
        private readonly notificationGateway: NotificationGateway,
    ) { }

    async sendNotification(userId: string, type: NotificationType, payload: Record<string, unknown>): Promise<Notification> {
        const notification = this.notificationRepo.create({
            user: { id: userId },
            type,
            payload,
            isRead: false
        });

        const savedNotification = await this.notificationRepo.save(notification);

        this.notificationGateway.emitNotification(userId, savedNotification);

        return savedNotification;
    }

    async getAllNotificationsByUser(userId: string): Promise<Notification[]> {
        const notifications = await this.notificationRepo.find({
            where: {
                user: { id: userId }
            },
            order: {
                createdAt: 'DESC'
            }
        })

        return notifications;
    }

    async markAsRead(notificationId: string, userId: string): Promise<void> {
        const notification = await this.notificationRepo.findOne({
            where: { id: notificationId, user: { id: userId } },
        });
        if (!notification) {
            return;
        }
        notification.isRead = true;
        await this.notificationRepo.save(notification);
    }

}
