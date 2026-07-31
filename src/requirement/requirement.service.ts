import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CofounderRequirement,
  RequirementStatus,
} from './entities/cofounder-requirement.entity';
import { StartupIdea } from '../startup/entities/startup-idea.entity';
import { Profile } from '../profile/entities/profile.entity';
import { CompatibilityService, computeCompatibility } from './compatibility.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
import { BrowseRequirementsResult, RequirementWithScore } from './Interface/requirement.interface';
import { Application, ApplicationStatus } from 'src/application/entities/application.entity';
import { ApplicationService } from 'src/application/application.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { User } from 'src/user/entities/user.entity';
import { NotificationType } from 'src/notification/entities/notification.entity';



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
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
    private readonly applicationService: ApplicationService,
  ) {}


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

  private async getPendingCount(userId: string): Promise<number> {
    return this.applicationRepo.count({
      where: {
        requirement: { startupIdea: { owner: { id: userId } } },
        status: ApplicationStatus.PENDING,
      },
    });
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
  cursor?: { createdAt: string; id: string },
  role?: string,
  industry?: string,
  stage?: string,
): Promise<BrowseRequirementsResult> {
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
    qb.andWhere(
      '(req.createdAt < :createdAt OR (req.createdAt = :createdAt AND req.id < :id))',
      { createdAt: cursor.createdAt, id: cursor.id },
    );
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

  qb
    .orderBy('req.createdAt', 'DESC')
    .addOrderBy('req.id', 'DESC')
    .take(21);

  const rows = await qb.getMany();

  const hasNextPage = rows.length > 20;
  const items = hasNextPage ? rows.slice(0, 20) : rows;
  const last = items.at(-1);

  return {
    data: items.map((requirement) => ({
      requirement,
      compatibilityScore: profile
        ? this.compatibilityService.compute(
            profile,
            requirement,
            requirement.startupIdea,
          )
        : 0,
    })),
    nextCursor: hasNextPage && last
      ? { createdAt: last.createdAt.toISOString(), id: last.id }
      : null,
  };
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

  async getApplicationsForRequirement(
    requirementId: string,
    userId: string,
  ): Promise<Application[]> {
    return this.applicationService.getApplicationsForRequirement(
      requirementId,
      userId,
    );
  }

   async apply(requirementId: string, userId: string): Promise<Application> {
    const requirement = await this.requirementRepo.findOne({
      where: { id: requirementId },
      relations: { startupIdea: { owner: true } },
    });
    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }
    if (requirement.status !== RequirementStatus.OPEN) {
      throw new BadRequestException('This requirement is closed');
    }

    if (requirement.startupIdea.owner.id === userId) {
      throw new BadRequestException('You cannot apply to your own requirement');
    }

    const existing = await this.applicationRepo.findOne({
      where: { requirement: { id: requirementId }, candidate: { id: userId } },
    });
    if (existing) {
      throw new ConflictException(
        'You have already applied to this requirement',
      );
    }

    const profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
    });

    const score = profile
      ? computeCompatibility(profile, requirement, requirement.startupIdea)
      : 0;

    const application = this.applicationRepo.create({
      requirement: requirement,
      candidate: { id: userId } as User,
      compatibilityScore: score,
    });

    const saved = await this.applicationRepo.save(application);

    await this.notificationService.sendNotification(
      requirement.startupIdea.owner.id,
      NotificationType.NEW_APPLICATION,
      {
        applicationId: saved.id,
        requirementId,
        candidateId: userId,
      },
    );

    const pendingCount = await this.getPendingCount(
      requirement.startupIdea.owner.id,
    );
    this.notificationGateway.emitPendingCount(
      requirement.startupIdea.owner.id,
      pendingCount,
    );

    return saved;
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
