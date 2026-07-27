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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirementController = void 0;
const common_1 = require("@nestjs/common");
const requirement_service_1 = require("./requirement.service");
const update_requirement_dto_1 = require("./dto/update-requirement.dto");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let RequirementController = class RequirementController {
    requirementService;
    constructor(requirementService) {
        this.requirementService = requirementService;
    }
    async update(id, dto, userId) {
        return this.requirementService.updateRequirement(id, userId, dto);
    }
    async close(id, userId) {
        return this.requirementService.closeRequirement(id, userId);
    }
    async delete(id, userId) {
        await this.requirementService.deleteRequirement(id, userId);
        return { message: 'Requirement deleted' };
    }
    async browse(userId, cursor, role, industry, stage) {
        return this.requirementService.browseRequirements(userId, cursor, role, industry, stage);
    }
    async getById(id, userId) {
        return this.requirementService.getRequirementById(id, userId);
    }
};
exports.RequirementController = RequirementController;
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_requirement_dto_1.UpdateRequirementDto, String]),
    __metadata("design:returntype", Promise)
], RequirementController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/close'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RequirementController.prototype, "close", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RequirementController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('browse'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)('cursor')),
    __param(2, (0, common_1.Query)('role')),
    __param(3, (0, common_1.Query)('industry')),
    __param(4, (0, common_1.Query)('stage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], RequirementController.prototype, "browse", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RequirementController.prototype, "getById", null);
exports.RequirementController = RequirementController = __decorate([
    (0, common_1.Controller)('requirements'),
    __metadata("design:paramtypes", [requirement_service_1.RequirementService])
], RequirementController);
//# sourceMappingURL=requirement.controller.js.map