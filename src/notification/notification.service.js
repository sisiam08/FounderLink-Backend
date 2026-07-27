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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notification_entity_1 = require("./entities/notification.entity");
const typeorm_2 = require("typeorm");
const notification_gateway_1 = require("./notification.gateway");
let NotificationService = class NotificationService {
    notificationRepo;
    notificationGateway;
    constructor(notificationRepo, notificationGateway) {
        this.notificationRepo = notificationRepo;
        this.notificationGateway = notificationGateway;
    }
    async sendNotification(userId, type, payload) {
        const notification = this.notificationRepo.create({
            user: { id: userId },
            type,
            payload,
            isRead: false
        });
        const savedNotification = await this.notificationRepo.save(notification);
        this.notificationGateway.emitNotification(userId, savedNotification);
        return savedNotification;
    }
    async getAllNotificationsByUser(userId) {
        const notifications = await this.notificationRepo.find({
            where: {
                user: { id: userId }
            },
            order: {
                createdAt: 'DESC'
            }
        });
        return notifications;
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.notificationRepo.findOne({
            where: { id: notificationId, user: { id: userId } },
        });
        if (!notification) {
            return;
        }
        notification.isRead = true;
        await this.notificationRepo.save(notification);
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notification_gateway_1.NotificationGateway])
], NotificationService);
//# sourceMappingURL=notification.service.js.map