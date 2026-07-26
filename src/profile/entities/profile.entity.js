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
exports.Profile = exports.ProfileRole = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
var ProfileRole;
(function (ProfileRole) {
    ProfileRole["TECHNICAL"] = "technical";
    ProfileRole["PRODUCT"] = "product";
    ProfileRole["DESIGN"] = "design";
    ProfileRole["MARKETING"] = "marketing";
    ProfileRole["BUSINESS"] = "business";
})(ProfileRole || (exports.ProfileRole = ProfileRole = {}));
let Profile = class Profile {
    id;
    user;
    bio;
    role;
    skills;
    interestedIndustries;
    availableWeeklyCommitment;
    portfolioUrl;
    githubUrl;
    linkedinUrl;
    location;
    photoUrl;
    createdAt;
    updatedAt;
};
exports.Profile = Profile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Profile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.profile, { onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], Profile.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Profile.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ProfileRole }),
    __metadata("design:type", String)
], Profile.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: [] }),
    __metadata("design:type", Array)
], Profile.prototype, "skills", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'interested_industries',
        type: 'text',
        array: true,
        default: [],
    }),
    __metadata("design:type", Array)
], Profile.prototype, "interestedIndustries", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'available_weekly_commitment', default: 10 }),
    __metadata("design:type", Number)
], Profile.prototype, "availableWeeklyCommitment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'portfolio_url', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Profile.prototype, "portfolioUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'github_url', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Profile.prototype, "githubUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'linkedin_url', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Profile.prototype, "linkedinUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Profile.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'photo_url', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Profile.prototype, "photoUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Profile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Profile.prototype, "updatedAt", void 0);
exports.Profile = Profile = __decorate([
    (0, typeorm_1.Entity)('profiles')
], Profile);
//# sourceMappingURL=profile.entity.js.map