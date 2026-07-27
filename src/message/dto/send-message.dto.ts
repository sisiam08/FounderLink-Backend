import { IsNotEmpty, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}
