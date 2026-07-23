import { SystemRole, User, UserStatus } from "src/user/entities/user.entity";

export interface AuthResult {
    user: Pick<User, 'id' | 'fullName' | 'email'>;
    accessToken: string;
    refreshToken: string;
}

export interface JwtPayload {
    userId: string,
    sessionId: string
}

export interface AuthenticatedUser {
    userId: string;
    sessionId: string;
    systemRole: SystemRole,
    status: UserStatus
}