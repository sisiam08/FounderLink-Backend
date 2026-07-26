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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP = exports.OtpPurpose = void 0;
const typeorm_1 = require("typeorm");
var OtpPurpose;
(function (OtpPurpose) {
    OtpPurpose["SIGNUP"] = "signup";
    OtpPurpose["PASSWORD_RESET"] = "password_reset";
})(OtpPurpose || (exports.OtpPurpose = OtpPurpose = {}));
let OTP = class OTP {
    id;
    email;
    purpose;
    code;
    payload;
    attempts;
    expiresAt;
    consumedAt;
    createdAt;
};
exports.OTP = OTP;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OTP.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OTP.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: OtpPurpose }),
    __metadata("design:type", String)
], OTP.prototype, "purpose", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OTP.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], OTP.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], OTP.prototype, "attempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], OTP.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'consumed_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], OTP.prototype, "consumedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], OTP.prototype, "createdAt", void 0);
exports.OTP = OTP = __decorate([
    (0, typeorm_1.Entity)('otps')
], OTP);
//# sourceMappingURL=otp.entity.js.map