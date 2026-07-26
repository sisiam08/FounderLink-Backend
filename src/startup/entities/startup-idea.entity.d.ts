import { User } from '../../user/entities/user.entity';
import { CofounderRequirement } from '../../requirement/entities/cofounder-requirement.entity';
export declare enum StartupStage {
    IDEA = "idea",
    PROTOTYPE = "prototype",
    MVP = "mvp",
    LAUNCHED = "launched",
    SCALING = "scaling"
}
export declare enum StartupStatus {
    OPEN = "open",
    CLOSED = "closed"
}
export declare class StartupIdea {
    id: string;
    owner: User;
    title: string;
    shortDescription: string;
    fullDescription: string;
    industries: string[];
    startupStage: StartupStage;
    status: StartupStatus;
    requirements: CofounderRequirement[];
    createdAt: Date;
    updatedAt: Date;
}
