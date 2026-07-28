import { IsEnum } from 'class-validator';
import { SystemRole } from '../../user/entities/user.entity';

export class ChangeUserRoleDto {
  @IsEnum(SystemRole)
  systemRole: SystemRole;
}
