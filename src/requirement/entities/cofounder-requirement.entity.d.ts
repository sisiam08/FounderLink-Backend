import { StartupIdea } from '../../startup/entities/startup-idea.entity';
import { ProfileRole } from '../../profile/entities/profile.entity';
export declare enum RequirementStatus {
    OPEN = "open",
    CLOSED = "closed"
}
export declare class CofounderRequirement {
    id: string;
    startupIdea: StartupIdea;
    requiredRole: ProfileRole;
    requiredSkills: string[];
    requiredWeeklyCommitment: number;
    equityOffered: number;
    status: RequirementStatus;
    createdAt: Date;
    updatedAt: Date;
}
