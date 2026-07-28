import { SetMetadata } from '@nestjs/common';
import { SystemRole } from 'src/user/entities/user.entity';

export const ROLE_KEY = 'roles';
export const Roles = (...roles: SystemRole[]) => SetMetadata(ROLE_KEY, roles);
