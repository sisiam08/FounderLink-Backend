import { User } from "../../../../src/user/entities/user.entity";
import { SessionMetaData } from './interfaces/session.interface';
import { UserSession } from './entities/user-session.entity';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
export declare class SessionService {
    private readonly configService;
    private readonly sessionRepo;
    constructor(configService: ConfigService, sessionRepo: Repository<UserSession>);
    createSession(user: User, metadata: SessionMetaData): Promise<{
        session: UserSession;
        refreshToken: string;
    }>;
    validateSession(refreshToken: string): Promise<UserSession>;
    revokeSession(sessionId: string): Promise<boolean>;
    revokeAllSessions(userId: string, sessionId?: string): Promise<void>;
    getActiveSessions(userId: string): Promise<UserSession[]>;
}
