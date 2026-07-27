import { Controller, Get, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Notification } from './entities/notification.entity';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Get()
  async getAllNotificationsByUser(@CurrentUser('userId') userId: string): Promise<Notification[]> {
    return await this.notificationService.getAllNotificationsByUser(userId);
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') notificationId: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.notificationService.markAsRead(notificationId, userId);
    return { message: 'Notification marked as read' };
  }
}
