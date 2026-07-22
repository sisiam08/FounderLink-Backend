import { Injectable } from "@nestjs/common";
import { User } from "src/user/entities/user.entity";
import { SessionMetaData } from "./interfaces/session.interface";
import { UserSession } from "./entities/user-session.entity";
import { generateToken, hashToken } from "./token.utils";
import { ConfigService } from "@nestjs/config";
import { StringValue } from 'ms';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class SessionService {
    constructor(private readonly configService: ConfigService,
        @InjectRepository(UserSession)
        private readonly sessionRepo: Repository<UserSession>,
    ) { }

    async createSession(user: User, metadata: SessionMetaData): Promise<{ session: UserSession, refreshToken: string }> {
        try {
            const rawToken = generateToken();
            const secret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

            const expiresIn = (this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN') || '7d') as StringValue;

            const hashedRefreshToken = hashToken(rawToken, secret);

            const session = this.sessionRepo.create({
                user: user,
                refreshToken: hashedRefreshToken,
                deviceInfo: metadata.deviceInfo ?? null,
                ipAddress: metadata.ipAddress ?? null,
                userAgent: metadata.userAgent ?? null,
                expiresAt: new Date(Date.now() + expiresIn),
                lastActiveAt: new Date(),
                revoked: false
            })

            const data = await this.sessionRepo.save(session);

            const refreshToken = `${data.id}.${rawToken}`;

            return { session: data, refreshToken };
        } catch (error) {
            throw error;
        }
    }

}