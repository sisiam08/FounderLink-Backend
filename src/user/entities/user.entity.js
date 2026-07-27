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
exports.User = exports.UserStatus = exports.SystemRole = void 0;
const user_session_entity_1 = require("../../auth/entities/user-session.entity");
const profile_entity_1 = require("../../profile/entities/profile.entity");
const startup_idea_entity_1 = require("../../startup/entities/startup-idea.entity");
const typeorm_1 = require("typeorm");
var SystemRole;
(function (SystemRole) {
    SystemRole["USER"] = "user";
    SystemRole["ADMIN"] = "admin";
    SystemRole["SUPER_ADMIN"] = "super_admin";
})(SystemRole || (exports.SystemRole = SystemRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["BANNED"] = "banned";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
let User = class User {
    id;
    fullName;
    email;
    password;
    googleId;
    systemRole;
    status;
    suspendedReason;
    sessions;
    profile;
    startupIdeas;
    createdAt;
    updatedAt;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'full_name', type: 'varchar' }),
    __metadata("design:type", String)
], User.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        nullable: true,
        select: false,
    }),
    __metadata("design:type", Object)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'google_id',
        type: 'varchar',
        nullable: true,
        unique: true,
        select: false,
    }),
    __metadata("design:type", Object)
], User.prototype, "googleId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'system_role',
        type: 'enum',
        enum: SystemRole,
        default: SystemRole.USER,
    }),
    __metadata("design:type", String)
], User.prototype, "systemRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'suspended_reason',
        type: 'varchar',
        nullable: true,
        select: false,
    }),
    __metadata("design:type", Object)
], User.prototype, "suspendedReason", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_session_entity_1.UserSession, (session) => session.user),
    __metadata("design:type", Array)
], User.prototype, "sessions", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => profile_entity_1.Profile, (profile) => profile.user),
    __metadata("design:type", profile_entity_1.Profile)
], User.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => startup_idea_entity_1.StartupIdea, (startupIdea) => (startupIdea.owner)),
    __metadata("design:type", Array)
], User.prototype, "startupIdeas", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map