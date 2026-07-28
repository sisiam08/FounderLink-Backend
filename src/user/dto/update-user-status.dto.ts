import { IsEnum, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { UserStatus } from '../../user/entities/user.entity';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;

  @IsOptional()
  @IsNotEmpty()
  @MaxLength(500)
  reason?: string;
}
