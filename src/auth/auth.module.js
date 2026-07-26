"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../../../../src/user/entities/user.entity");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const session_service_1 = require("./session.service");
const user_session_entity_1 = require("./entities/user-session.entity");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const jwt_auth_guard_1 = require("../../../../src/common/guards/jwt-auth.guard");
const core_1 = require("@nestjs/core");
const active_user_guard_1 = require("../../../../src/common/guards/active-user.guard");
const otp_entity_1 = require("./entities/otp.entity");
const mail_module_1 = require("../../../../src/mail/mail.module");
const otp_service_1 = require("./otp.service");
const roles_guard_1 = require("../../../../src/common/guards/roles.guard");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, user_session_entity_1.UserSession, otp_entity_1.OTP]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    global: true,
                    secret: configService.getOrThrow('JWT_ACCESS_SECRET'),
                    signOptions: {
                        expiresIn: configService.getOrThrow('JWT_ACCESS_EXPIRES_IN'),
                    }
                })
            }),
            mail_module_1.MailModule
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            session_service_1.SessionService,
            otp_service_1.OTPService,
            jwt_strategy_1.JwtStrategy,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: active_user_guard_1.ActiveUserGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            }
        ],
        exports: [jwt_1.JwtModule]
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map