import { RequirementService } from './requirement.service';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
export declare class RequirementController {
    private readonly requirementService;
    constructor(requirementService: RequirementService);
    update(id: string, dto: UpdateRequirementDto, userId: string): Promise<import("./entities/cofounder-requirement.entity").CofounderRequirement>;
    close(id: string, userId: string): Promise<import("./entities/cofounder-requirement.entity").CofounderRequirement>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
    browse(userId: string, cursor?: string, role?: string, industry?: string, stage?: string): Promise<import("./requirement.service").RequirementWithScore[]>;
    getById(id: string, userId: string): Promise<import("./requirement.service").RequirementWithScore>;
}
