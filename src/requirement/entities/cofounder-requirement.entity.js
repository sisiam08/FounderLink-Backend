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
exports.CofounderRequirement = exports.RequirementStatus = void 0;
const typeorm_1 = require("typeorm");
const startup_idea_entity_1 = require("../../startup/entities/startup-idea.entity");
const profile_entity_1 = require("../../profile/entities/profile.entity");
var RequirementStatus;
(function (RequirementStatus) {
    RequirementStatus["OPEN"] = "open";
    RequirementStatus["CLOSED"] = "closed";
})(RequirementStatus || (exports.RequirementStatus = RequirementStatus = {}));
let CofounderRequirement = class CofounderRequirement {
    id;
    startupIdea;
    requiredRole;
    requiredSkills;
    requiredWeeklyCommitment;
    equityOffered;
    status;
    createdAt;
    updatedAt;
};
exports.CofounderRequirement = CofounderRequirement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CofounderRequirement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => startup_idea_entity_1.StartupIdea, (idea) => idea.requirements, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", startup_idea_entity_1.StartupIdea)
], CofounderRequirement.prototype, "startupIdea", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'required_role', type: 'enum', enum: profile_entity_1.ProfileRole }),
    __metadata("design:type", String)
], CofounderRequirement.prototype, "requiredRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'required_skills', type: 'text', array: true, default: [] }),
    __metadata("design:type", Array)
], CofounderRequirement.prototype, "requiredSkills", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'required_weekly_commitment', default: 10 }),
    __metadata("design:type", Number)
], CofounderRequirement.prototype, "requiredWeeklyCommitment", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'equity_offered',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], CofounderRequirement.prototype, "equityOffered", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RequirementStatus,
        default: RequirementStatus.OPEN,
    }),
    __metadata("design:type", String)
], CofounderRequirement.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CofounderRequirement.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CofounderRequirement.prototype, "updatedAt", void 0);
exports.CofounderRequirement = CofounderRequirement = __decorate([
    (0, typeorm_1.Entity)('cofounder_requirements')
], CofounderRequirement);
//# sourceMappingURL=cofounder-requirement.entity.js.map