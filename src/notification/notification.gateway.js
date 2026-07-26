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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const user_entity_1 = require("../../../../src/user/entities/user.entity");
const typeorm_2 = require("typeorm");
let NotificationGateway = class NotificationGateway {
    configService;
    jwtService;
    userRepo;
    server;
    constructor(configService, jwtService, userRepo) {
        this.configService = configService;
        this.jwtService = jwtService;
        this.userRepo = userRepo;
    }
    createRoom(userId) {
        return `user: ${userId}`;
    }
    async handleConnection(client) {
        try {
            const auth = client.handshake.auth;
            const accessToken = (typeof auth.accessToken === 'string') ? auth.accessToken : null;
            if (!accessToken) {
                throw new common_1.UnauthorizedException("Authorization token missing");
            }
            const payload = this.jwtService.verify(accessToken, {
                secret: this.configService.getOrThrow('JWT_ACCESS_SECRET')
            });
            const user = await this.userRepo.findOne({
                where: {
                    id: payload.userId
                },
                select: {
                    id: true,
                    status: true
                }
            });
            if (!user || user.status !== user_entity_1.UserStatus.ACTIVE) {
                throw new common_1.UnauthorizedException("User not found or account is not active");
            }
            client.data.userId = user.id;
            const room = this.createRoom(user.id);
            void client.join(room);
        }
        catch (error) {
            void client.disconnect();
            throw error;
        }
    }
    emitNotification(userId, notification) {
        const room = this.createRoom(userId);
        this.server.to(room).emit('new-notification', notification);
    }
    emitUnreadCount(userId, count) {
        const room = this.createRoom(userId);
        this.server.to(room).emit('unread-count', count);
    }
    emitPendingCount(userId, count) {
        const room = this.createRoom(userId);
        this.server.to(room).emit('pending-count', count);
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_d = typeof socket_io_1.Server !== "undefined" && socket_io_1.Server) === "function" ? _d : Object)
], NotificationGateway.prototype, "server", void 0);
exports.NotificationGateway = NotificationGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/notification'
    }),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object])
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map