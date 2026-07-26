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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../../../../src/user/entities/user.entity");
const typeorm_2 = require("typeorm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const session_service_1 = require("./session.service");
const otp_service_1 = require("./otp.service");
const otp_entity_1 = require("./entities/otp.entity");
const mail_service_1 = require("../../../../src/mail/mail.service");
let AuthService = class AuthService {
    userRepo;
    configService;
    jwtService;
    sessionService;
    otpService;
    mailService;
    constructor(userRepo, configService, jwtService, sessionService, otpService, mailService) {
        this.userRepo = userRepo;
        this.configService = configService;
        this.jwtService = jwtService;
        this.sessionService = sessionService;
        this.otpService = otpService;
        this.mailService = mailService;
    }
    assertUserActive(status) {
        if (status === user_entity_1.UserStatus.SUSPENDED)
            throw new common_1.ForbiddenException('Account is suspended');
        if (status === user_entity_1.UserStatus.BANNED)
            throw new common_1.ForbiddenException('Account is banned');
    }
    async issueTokens(user, metadata) {
        try {
            const { session, refreshToken } = await this.sessionService.createSession(user, metadata);
            const accessToken = this.jwtService.sign({
                userId: user.id,
                sessionId: session.id,
            });
            return {
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                },
                accessToken,
                refreshToken,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async signup(payload) {
        const { fullName, email, password } = payload;
        try {
            const existingUser = await this.userRepo.findOne({
                where: {
                    email,
                },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Email already registered!');
            }
            const saltRound = Number(this.configService.getOrThrow('SALT_ROUND'));
            const passwordHash = await bcrypt_1.default.hash(password, saltRound);
            const { code, expiresAt } = await this.otpService.createOTP(email, otp_entity_1.OtpPurpose.SIGNUP, { fullName, passwordHash });
            await this.mailService.sendOTPMail(email, code, otp_entity_1.OtpPurpose.SIGNUP);
            return {
                message: 'OTP sent to your email. Verify to complete signup.',
                expiresAt,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async verifySignupOTP(payload) {
        const { email, code } = payload;
        try {
            const existingUser = await this.userRepo.findOneBy({
                email,
            });
            if (existingUser) {
                throw new common_1.ConflictException('Email already registered!');
            }
            const otp = await this.otpService.verifyOTP(email, code, otp_entity_1.OtpPurpose.SIGNUP);
            if (!otp) {
                throw new common_1.UnauthorizedException('Invalid OTP!');
            }
            const { fullName, passwordHash } = otp.payload;
            const user = this.userRepo.create({
                fullName,
                email,
                password: passwordHash,
            });
            const data = await this.userRepo.save(user);
            const { password: _password, googleId, ...restUser } = data;
            return restUser;
        }
        catch (error) {
            throw error;
        }
    }
    async login(payload, metadata) {
        const { email, password } = payload;
        try {
            const user = await this.userRepo.findOne({
                where: {
                    email,
                },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    password: true,
                    status: true,
                },
            });
            if (!user || !user.password) {
                throw new common_1.UnauthorizedException('Invalid Credentials!');
            }
            const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid Credentials!');
            }
            this.assertUserActive(user.status);
            return await this.issueTokens(user, metadata);
        }
        catch (error) {
            throw error;
        }
    }
    async rotateRefreshToken(refreshToken) {
        try {
            const session = await this.sessionService.validateSession(refreshToken);
            if (session.user) {
                this.assertUserActive(session.user.status);
            }
            const accessToken = this.jwtService.sign({
                userId: session.user.id,
                sessionId: session.id,
            });
            return { accessToken };
        }
        catch (error) {
            throw error;
        }
    }
    async logout(sessionId, refreshToken) {
        try {
            const session = await this.sessionService.validateSession(refreshToken);
            if (session.user) {
                this.assertUserActive(session.user.status);
            }
            return await this.sessionService.revokeSession(sessionId);
        }
        catch (error) {
            throw error;
        }
    }
    async forgotPassword(payload) {
        try {
            const user = await this.userRepo.findOne({
                where: { email: payload.email },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    password: true,
                    status: true,
                },
            });
            if (!user || user.status !== user_entity_1.UserStatus.ACTIVE) {
                throw new common_1.NotFoundException('User not found');
            }
            const { code, expiresAt } = await this.otpService.createOTP(user.email, otp_entity_1.OtpPurpose.PASSWORD_RESET, { userId: user.id });
            await this.mailService.sendOTPMail(user.email, code, otp_entity_1.OtpPurpose.PASSWORD_RESET);
            return {
                message: 'If you have an active account, an OTP has been sent to your email. Verify to continue.',
                expiresAt,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async verifyForgotPasswordOTP(payload) {
        const { email, code } = payload;
        try {
            const otp = await this.otpService.verifyOTP(email, code, otp_entity_1.OtpPurpose.PASSWORD_RESET);
            if (!otp) {
                throw new common_1.UnauthorizedException('Invalid OTP!');
            }
            const resetToken = this.jwtService.sign({
                userId: otp.payload.userId,
                email,
                purpose: otp_entity_1.OtpPurpose.PASSWORD_RESET,
            }, {
                secret: this.configService.getOrThrow('PASSWORD_RESET_TOKEN_SECRET'),
                expiresIn: this.configService.getOrThrow('PASSWORD_RESET_TOKEN_EXPIRES_IN'),
            });
            return { resetToken };
        }
        catch (error) {
            throw error;
        }
    }
    async resetPassword(payload) {
        const { token, newPassword } = payload;
        try {
            const decodeToken = this.jwtService.verify(token, {
                secret: this.configService.getOrThrow('PASSWORD_RESET_TOKEN_SECRET'),
            });
            const { userId, email, purpose } = decodeToken;
            if (purpose !== otp_entity_1.OtpPurpose.PASSWORD_RESET) {
                throw new common_1.UnauthorizedException('Invalid reset token!');
            }
            const user = await this.userRepo.findOne({
                where: { id: userId, email },
            });
            if (!user || user.status !== user_entity_1.UserStatus.ACTIVE) {
                throw new common_1.UnauthorizedException('Invalid reset token!');
            }
            const saltRound = Number(this.configService.getOrThrow('SALT_ROUND'));
            const passwordHash = await bcrypt_1.default.hash(newPassword, saltRound);
            await this.userRepo.update(userId, { password: passwordHash });
            await this.sessionService.revokeAllSessions(userId);
            return { message: 'Password reset successful!' };
        }
        catch (error) {
            if (error instanceof jwt_1.TokenExpiredError) {
                throw new common_1.UnauthorizedException('Token Expired!');
            }
            throw error;
        }
    }
    async changePassword(userId, sessionId, payload) {
        const { currentPassword, newPassword } = payload;
        if (currentPassword === newPassword) {
            throw new common_1.BadRequestException("New password can't be same as current password!");
        }
        try {
            const user = await this.userRepo.findOne({
                where: { id: userId },
                select: {
                    id: true,
                    password: true,
                },
            });
            if (!user || !user.password) {
                throw new common_1.UnauthorizedException('Password change not available for this account');
            }
            const isCurrentPasswordValid = await bcrypt_1.default.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new common_1.UnauthorizedException('Current password is incorrect!');
            }
            const saltRound = Number(this.configService.getOrThrow('SALT_ROUND'));
            const passwordHash = await bcrypt_1.default.hash(newPassword, saltRound);
            await this.userRepo.update(userId, { password: passwordHash });
            await this.sessionService.revokeAllSessions(userId, sessionId);
            return { message: 'Password changed successfully!' };
        }
        catch (error) {
            throw error;
        }
    }
    async getActiveSessions(userId) {
        const sessions = await this.sessionService.getActiveSessions(userId);
        if (sessions.length == 0) {
            throw new common_1.NotFoundException("No active sessions found!");
        }
        return sessions.map((s) => ({
            id: s.id,
            ipAddress: s.ipAddress,
            userAgent: s.userAgent,
            expiresAt: s.expiresAt,
            lastActiveAt: s.lastActiveAt,
            createdAt: s.createdAt
        }));
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object, typeof (_c = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _c : Object, session_service_1.SessionService,
        otp_service_1.OTPService, typeof (_d = typeof mail_service_1.MailService !== "undefined" && mail_service_1.MailService) === "function" ? _d : Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map