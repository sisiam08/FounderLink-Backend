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
exports.RequirementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cofounder_requirement_entity_1 = require("./entities/cofounder-requirement.entity");
const startup_idea_entity_1 = require("../startup/entities/startup-idea.entity");
const profile_entity_1 = require("../profile/entities/profile.entity");
const compatibility_service_1 = require("./compatibility.service");
let RequirementService = class RequirementService {
    requirementRepo;
    startupIdeaRepo;
    profileRepo;
    compatibilityService;
    constructor(requirementRepo, startupIdeaRepo, profileRepo, compatibilityService) {
        this.requirementRepo = requirementRepo;
        this.startupIdeaRepo = startupIdeaRepo;
        this.profileRepo = profileRepo;
        this.compatibilityService = compatibilityService;
    }
    async createRequirement(ideaId, userId, dto) {
        const idea = await this.startupIdeaRepo.findOne({
            where: { id: ideaId },
            relations: { owner: true },
        });
        if (!idea) {
            throw new common_1.NotFoundException('Startup idea not found');
        }
        if (idea.owner.id !== userId) {
            throw new common_1.ForbiddenException('You do not own this startup idea');
        }
        const requirement = new cofounder_requirement_entity_1.CofounderRequirement();
        requirement.startupIdea = idea;
        requirement.requiredRole = dto.requiredRole;
        requirement.requiredSkills = dto.requiredSkills;
        requirement.requiredWeeklyCommitment = dto.requiredWeeklyCommitment;
        requirement.equityOffered = dto.equityOffered;
        requirement.status = cofounder_requirement_entity_1.RequirementStatus.OPEN;
        return this.requirementRepo.save(requirement);
    }
    async updateRequirement(id, userId, dto) {
        const requirement = await this.getRequirementWithOwner(id);
        this.assertOwnership(requirement, userId);
        if (dto.requiredRole !== undefined)
            requirement.requiredRole = dto.requiredRole;
        if (dto.requiredSkills !== undefined)
            requirement.requiredSkills = dto.requiredSkills;
        if (dto.requiredWeeklyCommitment !== undefined)
            requirement.requiredWeeklyCommitment = dto.requiredWeeklyCommitment;
        if (dto.equityOffered !== undefined)
            requirement.equityOffered = dto.equityOffered;
        if (dto.status !== undefined)
            requirement.status = dto.status;
        return this.requirementRepo.save(requirement);
    }
    async closeRequirement(id, userId) {
        const requirement = await this.getRequirementWithOwner(id);
        this.assertOwnership(requirement, userId);
        requirement.status = cofounder_requirement_entity_1.RequirementStatus.CLOSED;
        return this.requirementRepo.save(requirement);
    }
    async deleteRequirement(id, userId) {
        const requirement = await this.getRequirementWithOwner(id);
        this.assertOwnership(requirement, userId);
        await this.requirementRepo.remove(requirement);
    }
    async browseRequirements(userId, cursor, role, industry, stage) {
        const profile = await this.profileRepo.findOne({
            where: { user: { id: userId } },
        });
        const qb = this.requirementRepo
            .createQueryBuilder('req')
            .leftJoinAndSelect('req.startupIdea', 'idea')
            .leftJoinAndSelect('idea.owner', 'owner')
            .where('req.status = :status', { status: cofounder_requirement_entity_1.RequirementStatus.OPEN })
            .andWhere('idea.status = :ideaStatus', { ideaStatus: 'open' });
        if (cursor) {
            qb.andWhere('req.createdAt < :cursor', {
                cursor: new Date(parseInt(cursor, 10)),
            });
        }
        if (role) {
            qb.andWhere('req.requiredRole = :role', { role });
        }
        if (industry) {
            qb.andWhere(':industry = ANY(idea.industries)', { industry });
        }
        if (stage) {
            qb.andWhere('idea.startupStage = :stage', { stage });
        }
        qb.orderBy('req.createdAt', 'DESC').take(20);
        const requirements = await qb.getMany();
        return requirements.map((requirement) => ({
            requirement,
            compatibilityScore: profile
                ? this.compatibilityService.compute(profile, requirement, requirement.startupIdea)
                : 0,
        }));
    }
    async getRequirementById(id, userId) {
        const requirement = await this.requirementRepo.findOne({
            where: { id },
            relations: { startupIdea: { owner: true } },
        });
        if (!requirement) {
            throw new common_1.NotFoundException('Requirement not found');
        }
        const profile = await this.profileRepo.findOne({
            where: { user: { id: userId } },
        });
        return {
            requirement,
            compatibilityScore: profile
                ? this.compatibilityService.compute(profile, requirement, requirement.startupIdea)
                : 0,
        };
    }
    async getRequirementWithOwner(id) {
        const requirement = await this.requirementRepo.findOne({
            where: { id },
            relations: { startupIdea: { owner: true } },
        });
        if (!requirement) {
            throw new common_1.NotFoundException('Requirement not found');
        }
        return requirement;
    }
    assertOwnership(requirement, userId) {
        if (requirement.startupIdea.owner.id !== userId) {
            throw new common_1.ForbiddenException('You do not own the startup idea this requirement belongs to');
        }
    }
};
exports.RequirementService = RequirementService;
exports.RequirementService = RequirementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cofounder_requirement_entity_1.CofounderRequirement)),
    __param(1, (0, typeorm_1.InjectRepository)(startup_idea_entity_1.StartupIdea)),
    __param(2, (0, typeorm_1.InjectRepository)(profile_entity_1.Profile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        compatibility_service_1.CompatibilityService])
], RequirementService);
//# sourceMappingURL=requirement.service.js.map