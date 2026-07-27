import { Profile, ProfileRole } from '../profile/entities/profile.entity';
import { CofounderRequirement } from './entities/cofounder-requirement.entity';
import { StartupIdea } from '../startup/entities/startup-idea.entity';
export declare function roleScore(candidateRole: ProfileRole, requiredRole: ProfileRole): number;
export declare function skillsScore(candidateSkills: string[], requiredSkills: string[]): number;
export declare function industryScore(candidateIndustries: string[], startupIndustries: string[]): number;
export declare function commitmentScore(candidateAvailableHours: number, requiredHours: number): number;
export declare function computeCompatibility(profile: Profile, requirement: CofounderRequirement, idea: StartupIdea): number;
export declare class CompatibilityService {
    compute(profile: Profile, requirement: CofounderRequirement, idea: StartupIdea): number;
}
