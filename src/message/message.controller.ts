import { Body, Controller, Param, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) { }

  @Post(':applicationId')
  async sendMessage(
    @Param('applicationId') applicationId: string,
    @Body() content: SendMessageDto,
    @CurrentUser("userId") userId: string
  ) {
    return await this.messageService.sendMessage(applicationId, userId, content);
  }
}
