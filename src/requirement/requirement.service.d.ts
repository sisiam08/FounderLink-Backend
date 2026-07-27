import { Repository } from 'typeorm';
import { CofounderRequirement } from './entities/cofounder-requirement.entity';
import { StartupIdea } from '../startup/entities/startup-idea.entity';
import { Profile } from '../profile/entities/profile.entity';
import { CompatibilityService } from './compatibility.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
export interface RequirementWithScore {
    requirement: CofounderRequirement;
    compatibilityScore: number;
}
export declare class RequirementService {
    private readonly requirementRepo;
    private readonly startupIdeaRepo;
    private readonly profileRepo;
    private readonly compatibilityService;
    constructor(requirementRepo: Repository<CofounderRequirement>, startupIdeaRepo: Repository<StartupIdea>, profileRepo: Repository<Profile>, compatibilityService: CompatibilityService);
    createRequirement(ideaId: string, userId: string, dto: CreateRequirementDto): Promise<CofounderRequirement>;
    updateRequirement(id: string, userId: string, dto: UpdateRequirementDto): Promise<CofounderRequirement>;
    closeRequirement(id: string, userId: string): Promise<CofounderRequirement>;
    deleteRequirement(id: string, userId: string): Promise<void>;
    browseRequirements(userId: string, cursor?: string, role?: string, industry?: string, stage?: string): Promise<RequirementWithScore[]>;
    getRequirementById(id: string, userId: string): Promise<RequirementWithScore>;
    getRequirementWithOwner(id: string): Promise<CofounderRequirement>;
    private assertOwnership;
}
