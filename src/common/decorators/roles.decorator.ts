import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
// Accept role names as strings to avoid relying on an exported SystemRole type
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
