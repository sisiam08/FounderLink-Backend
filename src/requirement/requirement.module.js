"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirementModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cofounder_requirement_entity_1 = require("./entities/cofounder-requirement.entity");
const startup_idea_entity_1 = require("../startup/entities/startup-idea.entity");
const profile_entity_1 = require("../profile/entities/profile.entity");
const requirement_service_1 = require("./requirement.service");
const requirement_controller_1 = require("./requirement.controller");
const compatibility_service_1 = require("./compatibility.service");
let RequirementModule = class RequirementModule {
};
exports.RequirementModule = RequirementModule;
exports.RequirementModule = RequirementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([cofounder_requirement_entity_1.CofounderRequirement, startup_idea_entity_1.StartupIdea, profile_entity_1.Profile]),
        ],
        controllers: [requirement_controller_1.RequirementController],
        providers: [requirement_service_1.RequirementService, compatibility_service_1.CompatibilityService],
        exports: [compatibility_service_1.CompatibilityService, requirement_service_1.RequirementService],
    })
], RequirementModule);
//# sourceMappingURL=requirement.module.js.map