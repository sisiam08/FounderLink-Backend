import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestUser } from '../decorators/current-user.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface RequestWithUser {
  user?: RequestUser;
}

@Injectable()
export class ActiveUserGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    // If user entity enum is not exported, compare against the string value
    if (!user || user.status !== 'ACTIVE') {
      throw new ForbiddenException('Account is suspended or banned');
    }
    return true;
  }
}
