import { ProfileRole } from '../../profile/entities/profile.entity';
import { RequirementStatus } from '../entities/cofounder-requirement.entity';
export declare class UpdateRequirementDto {
    requiredRole?: ProfileRole;
    requiredSkills?: string[];
    requiredWeeklyCommitment?: number;
    equityOffered?: number;
    status?: RequirementStatus;
}
