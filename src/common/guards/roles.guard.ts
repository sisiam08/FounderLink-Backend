import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { SystemRole } from "src/user/entities/user.entity";
import { ROLE_KEY } from "../decorators/roles.decorator";
import { AuthenticatedRequest } from "src/auth/interfaces/auth.interface";

@Injectable()
export class RolesGuard implements CanActivate{
    constructor(private readonly reflector: Reflector){}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const permittedRoles = this.reflector.getAllAndOverride<SystemRole[]>(ROLE_KEY, [context.getHandler(), context.getClass()]);
        if(!permittedRoles) return true;

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const user = request.user;

        if(!user || !permittedRoles.includes(user.systemRole)){
            throw new ForbiddenException("You are not authorized to access this resource")
        }   

        return true;
    }

}