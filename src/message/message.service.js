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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const message_entity_1 = require("./entities/message.entity");
const typeorm_2 = require("typeorm");
const application_entity_1 = require("../../../../src/application/entities/application.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const notification_gateway_1 = require("../../../../src/notification/notification.gateway");
const notification_service_1 = require("../../../../src/notification/notification.service");
const notification_entity_1 = require("../../../../src/notification/entities/notification.entity");
let MessageService = class MessageService {
    messageRepo;
    applicationRepo;
    eventEmitter;
    notificationService;
    notificationGateway;
    constructor(messageRepo, applicationRepo, eventEmitter, notificationService, notificationGateway) {
        this.messageRepo = messageRepo;
        this.applicationRepo = applicationRepo;
        this.eventEmitter = eventEmitter;
        this.notificationService = notificationService;
        this.notificationGateway = notificationGateway;
    }
    async assertRoomAccess(applicationId, userId) {
        try {
            const application = await this.applicationRepo
                .createQueryBuilder('app')
                .leftJoin('app.candidate', 'candidate')
                .leftJoin('app.requirement', 'requirement')
                .leftJoin('requirement.startupIdea', 'startup')
                .leftJoin('startup.owner', 'owner')
                .select([
                'app.id',
                'app.status',
                'candidate.id',
                'requirement.id',
                'startup.id',
                'owner.id',
            ])
                .where('app.id = :id', { id: applicationId })
                .getOne();
            if (!application) {
                throw new common_1.NotAcceptableException('Application not found!');
            }
            if (application.status !== application_entity_1.ApplicationStatus.ACCEPTED) {
                throw new common_1.ForbiddenException('Messaging is only available for accepted applications');
            }
            const ownerId = application.requirement.startupIdea.owner.id;
            const candidateId = application.candidate.id;
            console.log(userId);
            console.log(ownerId);
            console.log(candidateId);
            if (userId !== ownerId && userId !== candidateId) {
                throw new common_1.ForbiddenException('You are not authorized to access this conversation');
            }
            return application;
        }
        catch (error) {
            throw error;
        }
    }
    async getAcceptedApplicationIds(userId) {
        const [mine, received] = await Promise.all([
            this.applicationRepo.find({
                where: {
                    candidate: { id: userId },
                    status: application_entity_1.ApplicationStatus.ACCEPTED,
                },
                select: { id: true },
            }),
            this.applicationRepo.find({
                where: {
                    requirement: { startupIdea: { owner: { id: userId } } },
                    status: application_entity_1.ApplicationStatus.ACCEPTED,
                },
                select: { id: true },
            }),
        ]);
        return [...mine, ...received].map((a) => a.id);
    }
    async sendMessage(userId, payload) {
        const { applicationId, content } = payload;
        try {
            const message = this.messageRepo.create({
                application: { id: applicationId },
                sender: { id: userId },
                content: content,
                isRead: false,
            });
            const savedMessage = await this.messageRepo.save(message);
            this.eventEmitter.emit('new.message', {
                applicationId,
                message: {
                    id: savedMessage.id,
                    content: savedMessage.content,
                    senderId: savedMessage.sender.id,
                    createdAt: savedMessage.createdAt,
                },
            });
            const application = await this.applicationRepo.findOne({
                where: { id: applicationId },
                relations: { requirement: { startupIdea: { owner: { profile: true } } }, candidate: { profile: true } },
            });
            if (!application) {
                throw new Error('Application not found');
            }
            const ownerId = application.requirement.startupIdea.owner.id;
            const candidateId = application.candidate.id;
            const recipientId = ownerId === userId ? candidateId : ownerId;
            const senderName = ownerId === userId ? application.requirement.startupIdea.owner.fullName : application.candidate.fullName;
            const senderImage = ownerId === userId ? application.requirement.startupIdea.owner.profile.photoUrl : application.candidate.profile.photoUrl;
            await this.notificationService.sendNotification(recipientId, notification_entity_1.NotificationType.NEW_MESSAGE, {
                applicationId: applicationId,
                messagePreview: content.slice(0, 100),
                senderId: userId,
                senderName: senderName,
                senderImage: senderImage
            });
            const unreadCountSender = await this.getUnreadCount(userId);
            this.notificationGateway.emitUnreadCount(userId, unreadCountSender);
            const unreadCountRecipient = await this.getUnreadCount(recipientId);
            this.notificationGateway.emitUnreadCount(recipientId, unreadCountRecipient);
            return savedMessage;
        }
        catch (error) {
            throw error;
        }
    }
    async getMessages(applicationId, userId) {
        await this.assertRoomAccess(applicationId, userId);
        return this.messageRepo.find({
            where: { application: { id: applicationId } },
            relations: { sender: true },
            order: { createdAt: 'ASC' },
        });
    }
    async markAsRead(applicationId, userId) {
        await this.messageRepo.update({
            application: { id: applicationId },
            sender: { id: (0, typeorm_2.Not)(userId) },
        }, { isRead: true });
    }
    async getUnreadCount(userId) {
        const acceptedIds = await this.getAcceptedApplicationIds(userId);
        if (acceptedIds.length === 0)
            return 0;
        const count = this.messageRepo
            .createQueryBuilder('m')
            .where('m.application_id IN (:...ids)', { ids: acceptedIds })
            .andWhere('m.sender_id != :userId', { userId })
            .andWhere('m.is_read = false')
            .getCount();
        return count;
    }
    async getUnreadEachApplication(userId) {
        const acceptedIds = await this.getAcceptedApplicationIds(userId);
        if (acceptedIds.length === 0)
            return {};
        const rows = await this.messageRepo
            .createQueryBuilder('m')
            .select('m.application_id', 'applicationId')
            .addSelect('COUNT(*)', 'count')
            .where('m.application_id IN (:...ids)', { ids: acceptedIds })
            .andWhere('m.sender_id != :userId', { userId })
            .andWhere('m.is_read = false')
            .groupBy('m.application_id')
            .getRawMany();
        const result = {};
        for (const { applicationId, count } of rows) {
            result[applicationId] = parseInt(count, 10);
        }
        return result;
    }
    async getConversations(userId) {
        const applications = await this.applicationRepo
            .createQueryBuilder('app')
            .leftJoinAndSelect('app.candidate', 'candidate')
            .leftJoinAndSelect('app.requirement', 'requirement')
            .leftJoinAndSelect('requirement.startupIdea', 'startup')
            .leftJoinAndSelect('startup.owner', 'owner')
            .where('app.status = :status', { status: application_entity_1.ApplicationStatus.ACCEPTED })
            .andWhere('(candidate.id = :userId OR owner.id = :userId)', { userId })
            .select([
            'app.id',
            'candidate.id',
            'candidate.fullName',
            'owner.id',
            'owner.fullName',
            'startup.id',
            'startup.title',
            'requirement.id',
        ])
            .getMany();
        if (applications.length === 0)
            return [];
        const applicationIds = applications.map((a) => a.id);
        const lastMessages = await this.messageRepo
            .createQueryBuilder('m')
            .select('DISTINCT ON (m.application_id) m.application_id', 'applicationId')
            .addSelect('m.id', 'id')
            .addSelect('m.content', 'content')
            .addSelect('m.sender_id', 'senderId')
            .addSelect('m.is_read', 'isRead')
            .addSelect('m.created_at', 'createdAt')
            .where('m.application_id IN (:...ids)', { ids: applicationIds })
            .orderBy('m.application_id')
            .addOrderBy('m.created_at', 'DESC')
            .getRawMany();
        const lastMessageMap = new Map();
        for (const msg of lastMessages) {
            lastMessageMap.set(msg.applicationId, msg);
        }
        const unreadMap = await this.getUnreadEachApplication(userId);
        const conversationList = applications.map((app) => {
            const isOwner = app.requirement.startupIdea.owner.id === userId;
            const otherUser = isOwner
                ? app.candidate
                : app.requirement.startupIdea.owner;
            const lastMsg = lastMessageMap.get(app.id);
            return {
                applicationId: app.id,
                startupTitle: app.requirement.startupIdea.title,
                otherUser: {
                    id: otherUser.id,
                    fullName: otherUser.fullName,
                    photo: otherUser.profile.photoUrl,
                },
                lastMessage: lastMsg
                    ? {
                        id: lastMsg.id,
                        content: lastMsg.content,
                        senderId: lastMsg.senderId,
                        isRead: lastMsg.isRead,
                        createdAt: lastMsg.createdAt,
                    }
                    : null,
                unreadCount: unreadMap[app.id] ?? 0,
            };
        });
        return conversationList.sort((a, b) => new Date(b.lastMessage?.createdAt ?? 0).getTime() -
            new Date(a.lastMessage?.createdAt ?? 0).getTime());
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _c : Object, typeof (_d = typeof notification_service_1.NotificationService !== "undefined" && notification_service_1.NotificationService) === "function" ? _d : Object, typeof (_e = typeof notification_gateway_1.NotificationGateway !== "undefined" && notification_gateway_1.NotificationGateway) === "function" ? _e : Object])
], MessageService);
//# sourceMappingURL=message.service.js.map