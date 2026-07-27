import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { AuthenticatedRequest } from "../../auth/interfaces/auth.interface";
import { UserStatus } from "../../user/entities/user.entity";

@Injectable()
export class ActiveUserGuard implements CanActivate{
    constructor(private readonly reflector: Reflector){}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

        if (isPublic) return true;

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        const user = request.user;

        if(!user || user.status !== UserStatus.ACTIVE){
            throw new ForbiddenException("Account is suspended or banned");
        }

        return true;        
    }
}