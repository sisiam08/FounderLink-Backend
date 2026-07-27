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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer_1 = __importDefault(require("nodemailer"));
const otp_entity_1 = require("../auth/entities/otp.entity");
let MailService = class MailService {
    configService;
    transporter = null;
    constructor(configService) {
        this.configService = configService;
    }
    getTransporter() {
        if (this.transporter)
            return this.transporter;
        this.transporter = nodemailer_1.default.createTransport({
            host: this.configService.getOrThrow('SMTP_HOST'),
            port: Number(this.configService.getOrThrow('SMTP_PORT')),
            secure: Boolean(this.configService.getOrThrow('SMTP_SECURE')),
            auth: {
                user: this.configService.getOrThrow('SMTP_USER'),
                pass: this.configService.getOrThrow('SMTP_PASS'),
            },
        });
        return this.transporter;
    }
    async sendOTPMail(to, code, purpose) {
        const fromName = this.configService.getOrThrow('MAIL_FROM_NAME');
        const fromEmail = this.configService.getOrThrow('MAIL_FROM_EMAIL');
        const expiry = this.configService.getOrThrow('OTP_EXPIRES_IN');
        const expiryInMin = parseInt(expiry, 10);
        const subject = purpose === otp_entity_1.OtpPurpose.SIGNUP
            ? 'Verify your email - FounderLink'
            : 'Reset your password - FounderLink';
        const intro = purpose === otp_entity_1.OtpPurpose.SIGNUP
            ? 'Welcome to FounderLink! Use the code below to verify your email and complete your signup.'
            : 'We received a request to reset your password. Use the code below to continue.';
        const text = `${intro}\n\nYour verification code is: ${code}\nThis code expires in ${expiryInMin} minute(s).\n\nIf you did not request this, you can ignore this email.`;
        try {
            const transporter = this.getTransporter();
            await transporter.sendMail({
                from: `${fromName} <${fromEmail}>`,
                to,
                subject,
                text
            });
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to send OTP email');
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map