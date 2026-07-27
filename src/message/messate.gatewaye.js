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
exports.MessageGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const user_entity_1 = require("../../../../src/user/entities/user.entity");
const typeorm_2 = require("typeorm");
const message_service_1 = require("./message.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const send_message_dto_1 = require("./dto/send-message.dto");
let MessageGateway = class MessageGateway {
    jwtService;
    configService;
    userRepo;
    messageService;
    server;
    constructor(jwtService, configService, userRepo, messageService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.userRepo = userRepo;
        this.messageService = messageService;
    }
    createRoom(applicationId) {
        return `application: ${applicationId}`;
    }
    async handleConnection(client) {
        try {
            const auth = client.handshake.auth;
            const accessToken = (typeof auth.accessToken === 'string') ? auth.accessToken : null;
            if (!accessToken) {
                throw new common_1.UnauthorizedException("Authorization token missing");
            }
            const payload = await this.jwtService.verify(accessToken, {
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
            client.data.userId = payload.userId;
            client.data.sessionId = payload.sessionId;
            client.data.joinedApplications = new Set;
        }
        catch (error) {
            void client.disconnect();
            throw error;
        }
    }
    async handleJoinRoom(applicationId, client) {
        if (!client.data.joinedApplications.has(applicationId)) {
            void await this.messageService.assertRoomAccess(applicationId, client.data.userId);
            client.data.joinedApplications.add(applicationId);
        }
        const room = this.createRoom(applicationId);
        void client.join(room);
        await this.messageService.markAsRead(applicationId, client.data.userId);
    }
    handleLeaveRoom(applicationId, client) {
        const room = this.createRoom(applicationId);
        void client.leave(room);
    }
    async handleSendMessage(payload, client) {
        const userId = client.data.userId;
        if (!userId) {
            throw new websockets_1.WsException("User not authenticated");
        }
        const { applicationId, content } = payload;
        if (!applicationId || !content?.trim()) {
            return { success: false, error: 'applicationId and content are required' };
        }
        if (!client.data.joinedApplications.has(applicationId)) {
            throw new websockets_1.WsException("You are not in the room");
        }
        try {
            const message = await this.messageService.sendMessage(userId, payload);
            return {
                success: true,
                message: {
                    id: message.id,
                    content: message.content,
                    senderId: userId,
                    createdAt: message.createdAt,
                },
            };
        }
        catch (error) {
            if (error instanceof websockets_1.WsException) {
                throw error;
            }
            throw new websockets_1.WsException("Failed to send message");
        }
    }
    emitNewMessage(applicationId, messages) {
        const room = this.createRoom(applicationId);
        this.server.to(room).emit('new-message', messages);
    }
};
exports.MessageGateway = MessageGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessageGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessageGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MessageGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send-message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_message_dto_1.SendMessageDto, Object]),
    __metadata("design:returntype", Promise)
], MessageGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, event_emitter_1.OnEvent)('new.message'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MessageGateway.prototype, "emitNewMessage", null);
exports.MessageGateway = MessageGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/chat'
    }),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        typeorm_2.Repository,
        message_service_1.MessageService])
], MessageGateway);
//# sourceMappingURL=messate.gatewaye.js.map