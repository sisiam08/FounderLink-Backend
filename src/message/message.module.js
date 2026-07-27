"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModule = void 0;
const common_1 = require("@nestjs/common");
const message_service_1 = require("./message.service");
const typeorm_1 = require("@nestjs/typeorm");
const message_entity_1 = require("./entities/message.entity");
const application_entity_1 = require("../application/entities/application.entity");
const startup_idea_entity_1 = require("../startup/entities/startup-idea.entity");
const cofounder_requirement_entity_1 = require("../requirement/entities/cofounder-requirement.entity");
const user_entity_1 = require("../user/entities/user.entity");
const auth_module_1 = require("../auth/auth.module");
const profile_entity_1 = require("../profile/entities/profile.entity");
const notification_module_1 = require("../notification/notification.module");
const messate_gatewaye_1 = require("./messate.gatewaye");
const message_controller_1 = require("./message.controller");
let MessageModule = class MessageModule {
};
exports.MessageModule = MessageModule;
exports.MessageModule = MessageModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([message_entity_1.Message, application_entity_1.Application, startup_idea_entity_1.StartupIdea, cofounder_requirement_entity_1.CofounderRequirement, user_entity_1.User, profile_entity_1.Profile]),
            auth_module_1.AuthModule,
            notification_module_1.NotificationModule
        ],
        controllers: [message_controller_1.MessageController],
        providers: [message_service_1.MessageService, messate_gatewaye_1.MessageGateway],
    })
], MessageModule);
//# sourceMappingURL=message.module.js.map