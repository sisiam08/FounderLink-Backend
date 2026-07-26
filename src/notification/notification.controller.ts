import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Notification } from './entities/notification.entity';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getAllNotificationsByUser(@CurrentUser('userId') userId: string): Promise<Notification[]>{
    return await this.notificationService.getAllNotificationsByUser(userId);
  }
}
