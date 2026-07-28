import { CofounderRequirement } from "../entities/cofounder-requirement.entity";

export interface RequirementWithScore {
  requirement: CofounderRequirement;
  compatibilityScore: number;
}


export interface BrowseRequirementsResult {
  data: RequirementWithScore[];
  nextCursor: { createdAt: string; id: string } | null;
}

