import { User } from '../../user/entities/user.entity';
export declare enum ProfileRole {
    TECHNICAL = "technical",
    PRODUCT = "product",
    DESIGN = "design",
    MARKETING = "marketing",
    BUSINESS = "business"
}
export declare class Profile {
    id: string;
    user: User;
    bio: string | null;
    role: ProfileRole;
    skills: string[];
    interestedIndustries: string[];
    availableWeeklyCommitment: number;
    portfolioUrl: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    location: string | null;
    photoUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}
