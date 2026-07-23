import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthenticatedRequest } from "src/auth/interfaces/auth.interface";
import { User } from "src/user/entities/user.entity";

export const CurrentUser = createParamDecorator((data: keyof User | undefined, context: ExecutionContext)=>{
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const user = request.user;
    if(!user) return undefined;

    return data ? user[data] : user;    
})