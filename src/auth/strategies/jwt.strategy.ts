import { Injectable, Session, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt"
import { Repository } from "typeorm";
import { AuthenticatedUser, JwtPayload } from "../interfaces/auth.interface";
import { UserSession } from "../entities/user-session.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(UserSession)
        private readonly sessionRepo: Repository<UserSession>
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET')
        })
    }

    async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
        const session = await this.sessionRepo
            .createQueryBuilder('session')
            .leftJoinAndSelect('session.user', 'user')
            .select([
                'session.id',
                'session.revoked',
                'session.expiresAt',
                'user.id',
                'user.systemRole',
                'user.status'
            ]).where('session.id = :id', {
                id: payload.sessionId
            }).getOne();

        if (!session || !session.user) {
            throw new UnauthorizedException("Session Not Found");
        }
        if (session.revoked) {
            throw new UnauthorizedException("Session Revoked")
        }
        if (session.expiresAt <= new Date()) {
            throw new UnauthorizedException("Session Expired")
        }

        return {
            userId: payload.userId,
            sessionId: payload.sessionId,
            systemRole: session.user.systemRole,
            status: session.user.status
        }
    }

}