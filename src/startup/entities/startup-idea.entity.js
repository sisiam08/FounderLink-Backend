"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartupIdea = exports.StartupStatus = exports.StartupStage = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
const cofounder_requirement_entity_1 = require("../../requirement/entities/cofounder-requirement.entity");
var StartupStage;
(function (StartupStage) {
    StartupStage["IDEA"] = "idea";
    StartupStage["PROTOTYPE"] = "prototype";
    StartupStage["MVP"] = "mvp";
    StartupStage["LAUNCHED"] = "launched";
    StartupStage["SCALING"] = "scaling";
})(StartupStage || (exports.StartupStage = StartupStage = {}));
var StartupStatus;
(function (StartupStatus) {
    StartupStatus["OPEN"] = "open";
    StartupStatus["CLOSED"] = "closed";
})(StartupStatus || (exports.StartupStatus = StartupStatus = {}));
let StartupIdea = class StartupIdea {
    id;
    owner;
    title;
    shortDescription;
    fullDescription;
    industries;
    startupStage;
    status;
    requirements;
    createdAt;
    updatedAt;
};
exports.StartupIdea = StartupIdea;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StartupIdea.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.startupIdeas, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'owner_id' }),
    __metadata("design:type", user_entity_1.User)
], StartupIdea.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 160 }),
    __metadata("design:type", String)
], StartupIdea.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'short_description', length: 255 }),
    __metadata("design:type", String)
], StartupIdea.prototype, "shortDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'full_description', type: 'text' }),
    __metadata("design:type", String)
], StartupIdea.prototype, "fullDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: [] }),
    __metadata("design:type", Array)
], StartupIdea.prototype, "industries", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'startup_stage',
        type: 'enum',
        enum: StartupStage,
        default: StartupStage.IDEA,
    }),
    __metadata("design:type", String)
], StartupIdea.prototype, "startupStage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StartupStatus, default: StartupStatus.OPEN }),
    __metadata("design:type", String)
], StartupIdea.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => cofounder_requirement_entity_1.CofounderRequirement, (req) => req.startupIdea),
    __metadata("design:type", Array)
], StartupIdea.prototype, "requirements", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StartupIdea.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], StartupIdea.prototype, "updatedAt", void 0);
exports.StartupIdea = StartupIdea = __decorate([
    (0, typeorm_1.Entity)('startup_ideas')
], StartupIdea);
//# sourceMappingURL=startup-idea.entity.js.map