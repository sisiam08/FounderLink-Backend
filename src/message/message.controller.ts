import { Controller, Get, Param, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) { }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser('userId') userId: string) {
    const count = await this.messageService.getUnreadCount(userId);
    return { count };
  }

   @Get('unread-each-application')
  async getUnreadByApplication(@CurrentUser('userId') userId: string) {
    return this.messageService.getUnreadEachApplication(userId);
  }

  @Get(':applicationId')
  async getMessages(
    @Param('applicationId') applicationId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.messageService.getMessages(applicationId, userId);
  }

}
