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
exports.UpdateRequirementDto = void 0;
const class_validator_1 = require("class-validator");
const profile_entity_1 = require("../../profile/entities/profile.entity");
const cofounder_requirement_entity_1 = require("../entities/cofounder-requirement.entity");
class UpdateRequirementDto {
    requiredRole;
    requiredSkills;
    requiredWeeklyCommitment;
    equityOffered;
    status;
}
exports.UpdateRequirementDto = UpdateRequirementDto;
__decorate([
    (0, class_validator_1.IsEnum)(profile_entity_1.ProfileRole),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateRequirementDto.prototype, "requiredRole", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(15),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateRequirementDto.prototype, "requiredSkills", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateRequirementDto.prototype, "requiredWeeklyCommitment", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateRequirementDto.prototype, "equityOffered", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(cofounder_requirement_entity_1.RequirementStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateRequirementDto.prototype, "status", void 0);
//# sourceMappingURL=update-requirement.dto.js.map