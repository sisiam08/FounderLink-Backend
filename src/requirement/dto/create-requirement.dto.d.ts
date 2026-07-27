import { ProfileRole } from '../../profile/entities/profile.entity';
export declare class CreateRequirementDto {
    requiredRole: ProfileRole;
    requiredSkills: string[];
    requiredWeeklyCommitment: number;
    equityOffered: number;
}
