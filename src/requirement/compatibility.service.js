"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompatibilityService = void 0;
exports.roleScore = roleScore;
exports.skillsScore = skillsScore;
exports.industryScore = industryScore;
exports.commitmentScore = commitmentScore;
exports.computeCompatibility = computeCompatibility;
const common_1 = require("@nestjs/common");
function roleScore(candidateRole, requiredRole) {
    return candidateRole === requiredRole ? 30 : 0;
}
function skillsScore(candidateSkills, requiredSkills) {
    const a = new Set(candidateSkills.map((s) => s.toLowerCase()));
    const b = new Set(requiredSkills.map((s) => s.toLowerCase()));
    const intersection = [...a].filter((skill) => b.has(skill)).length;
    const union = new Set([...a, ...b]).size;
    if (union === 0)
        return 0;
    return Math.round((intersection / union) * 45);
}
function industryScore(candidateIndustries, startupIndustries) {
    const a = new Set(candidateIndustries.map((s) => s.toLowerCase()));
    const b = new Set(startupIndustries.map((s) => s.toLowerCase()));
    const intersection = [...a].filter((i) => b.has(i)).length;
    const union = new Set([...a, ...b]).size;
    if (union === 0)
        return 0;
    return Math.round((intersection / union) * 10);
}
function commitmentScore(candidateAvailableHours, requiredHours) {
    if (candidateAvailableHours === 0 || requiredHours === 0)
        return 0;
    const ratio = Math.min(candidateAvailableHours, requiredHours) /
        Math.max(candidateAvailableHours, requiredHours);
    return Math.round(ratio * 15);
}
function computeCompatibility(profile, requirement, idea) {
    const total = roleScore(profile.role, requirement.requiredRole) +
        skillsScore(profile.skills, requirement.requiredSkills) +
        industryScore(profile.interestedIndustries, idea.industries) +
        commitmentScore(profile.availableWeeklyCommitment, requirement.requiredWeeklyCommitment);
    return Math.min(100, Math.max(0, total));
}
let CompatibilityService = class CompatibilityService {
    compute(profile, requirement, idea) {
        return computeCompatibility(profile, requirement, idea);
    }
};
exports.CompatibilityService = CompatibilityService;
exports.CompatibilityService = CompatibilityService = __decorate([
    (0, common_1.Injectable)()
], CompatibilityService);
//# sourceMappingURL=compatibility.service.js.map