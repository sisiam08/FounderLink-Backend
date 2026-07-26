import { CofounderRequirement } from '../../requirement/entities/cofounder-requirement.entity';
import { User } from '../../user/entities/user.entity';
export declare enum ApplicationStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    WITHDRAWN = "withdrawn"
}
export declare class Application {
    id: string;
    requirement: CofounderRequirement;
    candidate: User;
    candidateId: string;
    status: ApplicationStatus;
    compatibilityScore: number;
    createdAt: Date;
    updatedAt: Date;
}
