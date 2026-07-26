import { User } from '../../user/entities/user.entity';
export declare class UserSession {
    id: string;
    user: User;
    userId: string;
    refreshToken: string;
    ipAddress: string | null;
    userAgent: string | null;
    expiresAt: Date;
    lastActiveAt: Date | null;
    revoked: boolean;
    createdAt: Date;
}
