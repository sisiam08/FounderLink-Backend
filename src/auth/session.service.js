"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const user_session_entity_1 = require("./entities/user-session.entity");
const token_utils_1 = require("./token.utils");
const config_1 = require("@nestjs/config");
const ms_1 = __importDefault(require("ms"));
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let SessionService = class SessionService {
    configService;
    sessionRepo;
    constructor(configService, sessionRepo) {
        this.configService = configService;
        this.sessionRepo = sessionRepo;
    }
    async createSession(user, metadata) {
        try {
            const rawToken = (0, token_utils_1.generateToken)();
            const secret = this.configService.getOrThrow('JWT_REFRESH_SECRET');
            const expiresIn = (0, ms_1.default)(this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN'));
            const hashedRefreshToken = (0, token_utils_1.hashToken)(rawToken, secret);
            const session = this.sessionRepo.create({
                user: user,
                refreshToken: hashedRefreshToken,
                ipAddress: metadata.ipAddress ?? null,
                userAgent: metadata.userAgent ?? null,
                expiresAt: new Date(Date.now() + expiresIn),
                lastActiveAt: new Date(),
                revoked: false,
            });
            const data = await this.sessionRepo.save(session);
            const refreshToken = `${data.id}.${rawToken}`;
            return { session: data, refreshToken };
        }
        catch (error) {
            throw error;
        }
    }
    async validateSession(refreshToken) {
        const [sessionId, rawToken] = refreshToken.split('.');
        if (!sessionId || !rawToken) {
            throw new common_1.UnauthorizedException('Invalid Refresh Token');
        }
        const session = await this.sessionRepo.findOne({
            where: {
                id: sessionId,
            },
            relations: {
                user: true,
            },
        });
        if (!session) {
            throw new common_1.UnauthorizedException('Invalid Refresh Token');
        }
        if (session.revoked) {
            throw new common_1.UnauthorizedException('Session Revoked');
        }
        if (session.expiresAt <= new Date()) {
            throw new common_1.UnauthorizedException('Session Expired');
        }
        const secret = this.configService.getOrThrow('JWT_REFRESH_SECRET');
        const isTokenValid = (0, token_utils_1.compareToken)(rawToken, session.refreshToken, secret);
        if (!isTokenValid) {
            throw new common_1.UnauthorizedException('Invalid Refresh Token');
        }
        session.lastActiveAt = new Date();
        await this.sessionRepo.save(session);
        return session;
    }
    async revokeSession(sessionId) {
        const result = await this.sessionRepo.update(sessionId, { revoked: true });
        if (result.affected === 0) {
            throw new common_1.UnauthorizedException('Session Not Found');
        }
        return true;
    }
    async revokeAllSessions(userId, sessionId) {
        await this.sessionRepo.update({
            userId,
            revoked: false,
            ...(sessionId ? { id: (0, typeorm_2.Not)(sessionId) } : {})
        }, { revoked: true });
    }
    async getActiveSessions(userId) {
        return await this.sessionRepo.find({
            where: {
                userId,
                revoked: false
            },
            order: {
                createdAt: 'DESC'
            }
        });
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_session_entity_1.UserSession)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], SessionService);
//# sourceMappingURL=session.service.js.map