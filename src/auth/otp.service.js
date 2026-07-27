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
exports.OTPService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const otp_entity_1 = require("./entities/otp.entity");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const config_1 = require("@nestjs/config");
const ms_1 = __importDefault(require("ms"));
const token_utils_1 = require("./token.utils");
let OTPService = class OTPService {
    otpRepo;
    configService;
    constructor(otpRepo, configService) {
        this.otpRepo = otpRepo;
        this.configService = configService;
    }
    generateCode(length) {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length);
        return String((0, crypto_1.randomInt)(min, max));
    }
    async createOTP(email, purpose, payload) {
        try {
            const length = Number(this.configService.getOrThrow('OTP_LENGTH'));
            const code = this.generateCode(length);
            const expiresIn = (0, ms_1.default)(this.configService.getOrThrow('OTP_EXPIRES_IN'));
            const expiresAt = new Date(Date.now() + expiresIn);
            const otp = this.otpRepo.create({
                email,
                purpose,
                code,
                payload,
                attempts: 0,
                expiresAt,
                consumedAt: null,
            });
            await this.otpRepo.save(otp);
            return { code, expiresAt };
        }
        catch (error) {
            throw error;
        }
    }
    async verifyOTP(email, code, purpose) {
        try {
            const otp = await this.otpRepo.findOne({
                where: {
                    email, purpose, consumedAt: (0, typeorm_2.IsNull)()
                },
                order: {
                    createdAt: 'DESC'
                }
            });
            if (!otp) {
                throw new common_1.UnauthorizedException('OTP not found or already used');
            }
            if (otp.expiresAt < new Date()) {
                throw new common_1.UnauthorizedException('OTP has expired');
            }
            const maxAttempts = Number(this.configService.getOrThrow('OTP_MAX_ATTEMPTS'));
            if (otp.attempts >= maxAttempts) {
                otp.consumedAt = new Date();
                await this.otpRepo.save(otp);
                throw new common_1.UnauthorizedException('Too many invalid attempts. Please request a new OTP.');
            }
            if (!(0, token_utils_1.compareToken)(code, otp.code)) {
                otp.attempts += 1;
                await this.otpRepo.save(otp);
                throw new common_1.UnauthorizedException('Invalid OTP');
            }
            otp.consumedAt = new Date();
            await this.otpRepo.save(otp);
            return otp;
        }
        catch (error) {
            throw error;
        }
    }
};
exports.OTPService = OTPService;
exports.OTPService = OTPService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(otp_entity_1.OTP)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], OTPService);
//# sourceMappingURL=otp.service.js.map