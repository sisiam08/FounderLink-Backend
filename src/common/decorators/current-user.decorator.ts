import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthenticatedRequest, AuthenticatedUser } from "src/auth/entities/interfaces/auth.interface";

export const CurrentUser = createParamDecorator((data: keyof AuthenticatedUser | undefined, context: ExecutionContext)=>{
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const user = request.user;
    if(!user) return undefined;

    return data ? user[data] : user;    
})