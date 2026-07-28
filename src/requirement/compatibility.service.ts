import { Injectable } from '@nestjs/common';
import { Profile, ProfileRole } from '../profile/entities/profile.entity';
import { CofounderRequirement } from './entities/cofounder-requirement.entity';
import { StartupIdea } from '../startup/entities/startup-idea.entity';

export function roleScore(
  candidateRole: ProfileRole,
  requiredRole: ProfileRole,
): number {
  return candidateRole === requiredRole ? 30 : 0;
}

export function skillsScore(
  candidateSkills: string[],
  requiredSkills: string[],
): number {
  const a = new Set(candidateSkills.map((s) => s.toLowerCase()));
  const b = new Set(requiredSkills.map((s) => s.toLowerCase()));
  const intersection = [...a].filter((skill) => b.has(skill)).length;
  const union = new Set([...a, ...b]).size;
  if (union === 0) return 0;
  return Math.round((intersection / union) * 45);
}

export function industryScore(
  candidateIndustries: string[],
  startupIndustries: string[],
): number {
  const a = new Set(candidateIndustries.map((s) => s.toLowerCase()));
  const b = new Set(startupIndustries.map((s) => s.toLowerCase()));
  const intersection = [...a].filter((i) => b.has(i)).length;
  const union = new Set([...a, ...b]).size;
  if (union === 0) return 0;
  return Math.round((intersection / union) * 10);
}

export function commitmentScore(
  candidateAvailableHours: number,
  requiredHours: number,
): number {
  if (candidateAvailableHours === 0 || requiredHours === 0) return 0;
  const ratio =
    Math.min(candidateAvailableHours, requiredHours) /
    Math.max(candidateAvailableHours, requiredHours);
  return Math.round(ratio * 15);
}

export function computeCompatibility(
  profile: Profile,
  requirement: CofounderRequirement,
  idea: StartupIdea,
): number {
  const total =
    roleScore(profile.role, requirement.requiredRole) +
    skillsScore(profile.skills, requirement.requiredSkills) +
    industryScore(profile.interestedIndustries, idea.industries) +
    commitmentScore(
      profile.availableWeeklyCommitment,
      requirement.requiredWeeklyCommitment,
    );

  return Math.min(100, Math.max(0, total));
}

@Injectable()
export class CompatibilityService {
  compute(
    profile: Profile,
    requirement: CofounderRequirement,
    idea: StartupIdea,
  ): number {
    return computeCompatibility(profile, requirement, idea);
  }
}
