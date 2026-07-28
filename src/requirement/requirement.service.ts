import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CofounderRequirement,
  RequirementStatus,
} from './entities/cofounder-requirement.entity';
import { StartupIdea } from '../startup/entities/startup-idea.entity';
import { Profile } from '../profile/entities/profile.entity';
import { CompatibilityService } from './compatibility.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';

export interface RequirementWithScore {
  requirement: CofounderRequirement;
  compatibilityScore: number;
}

@Injectable()
export class RequirementService {
  constructor(
    @InjectRepository(CofounderRequirement)
    private readonly requirementRepo: Repository<CofounderRequirement>,
    @InjectRepository(StartupIdea)
    private readonly startupIdeaRepo: Repository<StartupIdea>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    private readonly compatibilityService: CompatibilityService,
  ) {}

  async createRequirement(
    ideaId: string,
    userId: string,
    dto: CreateRequirementDto,
  ): Promise<CofounderRequirement> {
    const idea = await this.startupIdeaRepo.findOne({
      where: { id: ideaId },
      relations: { owner: true },
    });
    if (!idea) {
      throw new NotFoundException('Startup idea not found');
    }
    if (idea.owner.id !== userId) {
      throw new ForbiddenException('You do not own this startup idea');
    }

    const requirement = new CofounderRequirement();
    requirement.startupIdea = idea;
    requirement.requiredRole = dto.requiredRole;
    requirement.requiredSkills = dto.requiredSkills;
    requirement.requiredWeeklyCommitment = dto.requiredWeeklyCommitment;
    requirement.equityOffered = dto.equityOffered;
    requirement.status = RequirementStatus.OPEN;

    return this.requirementRepo.save(requirement);
  }

  async updateRequirement(
    id: string,
    userId: string,
    dto: UpdateRequirementDto,
  ): Promise<CofounderRequirement> {
    const requirement = await this.getRequirementWithOwner(id);
    this.assertOwnership(requirement, userId);

    if (dto.requiredRole !== undefined)
      requirement.requiredRole = dto.requiredRole;
    if (dto.requiredSkills !== undefined)
      requirement.requiredSkills = dto.requiredSkills;
    if (dto.requiredWeeklyCommitment !== undefined)
      requirement.requiredWeeklyCommitment = dto.requiredWeeklyCommitment;
    if (dto.equityOffered !== undefined)
      requirement.equityOffered = dto.equityOffered;
    if (dto.status !== undefined) requirement.status = dto.status;

    return this.requirementRepo.save(requirement);
  }

  async closeRequirement(
    id: string,
    userId: string,
  ): Promise<CofounderRequirement> {
    const requirement = await this.getRequirementWithOwner(id);
    this.assertOwnership(requirement, userId);
    requirement.status = RequirementStatus.CLOSED;
    return this.requirementRepo.save(requirement);
  }

  async deleteRequirement(id: string, userId: string): Promise<void> {
    const requirement = await this.getRequirementWithOwner(id);
    this.assertOwnership(requirement, userId);
    await this.requirementRepo.remove(requirement);
  }

  async browseRequirements(
    userId: string,
    cursor?: string,
    role?: string,
    industry?: string,
    stage?: string,
  ): Promise<RequirementWithScore[]> {
    const profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
    });

    const qb = this.requirementRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.startupIdea', 'idea')
      .leftJoinAndSelect('idea.owner', 'owner')
      .where('req.status = :status', { status: RequirementStatus.OPEN })
      .andWhere('idea.status = :ideaStatus', { ideaStatus: 'open' });

    if (cursor) {
      qb.andWhere('req.createdAt < :cursor', {
        cursor: new Date(parseInt(cursor, 10)),
      });
    }
    if (role) {
      qb.andWhere('req.requiredRole = :role', { role });
    }
    if (industry) {
      qb.andWhere(':industry = ANY(idea.industries)', { industry });
    }
    if (stage) {
      qb.andWhere('idea.startupStage = :stage', { stage });
    }

    qb.orderBy('req.createdAt', 'DESC').take(20);

    const requirements = await qb.getMany();

    return requirements.map((requirement) => ({
      requirement,
      compatibilityScore: profile
        ? this.compatibilityService.compute(
            profile,
            requirement,
            requirement.startupIdea,
          )
        : 0,
    }));
  }

  async getRequirementById(
    id: string,
    userId: string,
  ): Promise<RequirementWithScore> {
    const requirement = await this.requirementRepo.findOne({
      where: { id },
      relations: { startupIdea: { owner: true } },
    });
    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    const profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
    });

    return {
      requirement,
      compatibilityScore: profile
        ? this.compatibilityService.compute(
            profile,
            requirement,
            requirement.startupIdea,
          )
        : 0,
    };
  }

  async getRequirementWithOwner(id: string): Promise<CofounderRequirement> {
    const requirement = await this.requirementRepo.findOne({
      where: { id },
      relations: { startupIdea: { owner: true } },
    });
    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }
    return requirement;
  }

  private assertOwnership(
    requirement: CofounderRequirement,
    userId: string,
  ): void {
    if (requirement.startupIdea.owner.id !== userId) {
      throw new ForbiddenException(
        'You do not own the startup idea this requirement belongs to',
      );
    }
  }


  async listRequirements(status?: string, role?: string, page = 1, limit = 20) {
    const qb = this.requirementRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.startupIdea', 'idea')
      .leftJoinAndSelect('idea.owner', 'owner');

    if (status) {
      qb.andWhere('req.status = :status', { status });
    }
    if (role) {
      qb.andWhere('req.requiredRole = :role', { role });
    }

    qb.orderBy('req.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [requirements, total] = await qb.getManyAndCount();
    return { requirements, total, page, limit };
  }

  async forceCloseRequirement(id: string, adminId: string) {
    const requirement = await this.requirementRepo.findOne({ where: { id } });
    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    requirement.status = RequirementStatus.CLOSED;
    await this.requirementRepo.save(requirement);

    return { id: requirement.id, status: requirement.status };
  }

}
