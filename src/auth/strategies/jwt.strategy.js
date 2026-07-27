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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const typeorm_1 = require("@nestjs/typeorm");
const passport_jwt_1 = require("passport-jwt");
const typeorm_2 = require("typeorm");
const user_session_entity_1 = require("../entities/user-session.entity");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    configService;
    sessionRepo;
    constructor(configService, sessionRepo) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow('JWT_ACCESS_SECRET')
        });
        this.configService = configService;
        this.sessionRepo = sessionRepo;
    }
    async validate(payload) {
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
            throw new common_1.UnauthorizedException("Session Not Found");
        }
        if (session.revoked) {
            throw new common_1.UnauthorizedException("Session Revoked");
        }
        if (session.expiresAt <= new Date()) {
            throw new common_1.UnauthorizedException("Session Expired");
        }
        return {
            userId: payload.userId,
            sessionId: payload.sessionId,
            systemRole: session.user.systemRole,
            status: session.user.status
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_session_entity_1.UserSession)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map