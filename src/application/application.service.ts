import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './entities/application.entity';
import {
  CofounderRequirement,
  RequirementStatus,
} from '../requirement/entities/cofounder-requirement.entity';
import { Profile } from '../profile/entities/profile.entity';
import { User } from '../user/entities/user.entity';
import { computeCompatibility } from '../requirement/compatibility.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationType } from '../notification/entities/notification.entity';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(CofounderRequirement)
    private readonly requirementRepo: Repository<CofounderRequirement>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}


  async withdraw(applicationId: string, userId: string): Promise<Application> {
    const application = await this.getApplicationWithRelations(applicationId);

    if (application.candidate.id !== userId) {
      throw new ForbiddenException(
        'You can only withdraw your own application',
      );
    }
    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException(
        'Only pending applications can be withdrawn',
      );
    }

    application.status = ApplicationStatus.WITHDRAWN;
    return this.applicationRepo.save(application);
  }

  async accept(applicationId: string, userId: string): Promise<Application> {
    const application = await this.getApplicationWithRelations(applicationId);

    const ownerId = application.requirement.startupIdea.owner.id;
    if (ownerId !== userId) {
      throw new ForbiddenException(
        'Only the requirement owner can accept applications',
      );
    }
    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException(
        'Only pending applications can be accepted',
      );
    }
    application.status = ApplicationStatus.ACCEPTED;
    const saved = await this.applicationRepo.save(application);

    await this.notificationService.sendNotification(
      application.candidate.id,
      NotificationType.APPLICATION_ACCEPTED,
      {
        applicationId: saved.id,
        requirementId: application.requirement.id,
        startupTitle: application.requirement.startupIdea.title,
      },
    );

    const pendingCount = await this.getPendingCount(ownerId);
    this.notificationGateway.emitPendingCount(ownerId, pendingCount);

    return saved;
  }

  async reject(applicationId: string, userId: string): Promise<Application> {
    const application = await this.getApplicationWithRelations(applicationId);

    const ownerId = application.requirement.startupIdea.owner.id;
    if (ownerId !== userId) {
      throw new ForbiddenException(
        'Only the requirement owner can reject applications',
      );
    }
    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException(
        'Only pending applications can be rejected',
      );
    }

    application.status = ApplicationStatus.REJECTED;
    const saved = await this.applicationRepo.save(application);

    await this.notificationService.sendNotification(
      application.candidate.id,
      NotificationType.APPLICATION_REJECTED,
      {
        applicationId: saved.id,
        requirementId: application.requirement.id,
        startupTitle: application.requirement.startupIdea.title,
      },
    );

    const pendingCount = await this.getPendingCount(ownerId);
    this.notificationGateway.emitPendingCount(ownerId, pendingCount);

    return saved;
  }

  async getReceivedApplications(userId: string): Promise<Application[]> {
    return this.applicationRepo.find({
      where: { requirement: { startupIdea: { owner: { id: userId } } } },
      relations: {
        candidate: true,
        requirement: { startupIdea: true },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingCount(userId: string): Promise<number> {
    return this.applicationRepo.count({
      where: {
        requirement: { startupIdea: { owner: { id: userId } } },
        status: ApplicationStatus.PENDING,
      },
    });
  }

  async getMyApplications(userId: string): Promise<Application[]> {
    return this.applicationRepo.find({
      where: { candidate: { id: userId } },
      relations: { requirement: { startupIdea: true } },
      order: { createdAt: 'DESC' },//নতুন ডাটাটি সবার আগে/উপরে থাকবে, এবং পুরোনো ডাটাগুলো নিচে থাকবে
    });
  }
  async getApplicationsForRequirement(
    requirementId: string,
    userId: string,
  ): Promise<Application[]> {
    const requirement = await this.requirementRepo.findOne({
      where: { id: requirementId },
      relations: { startupIdea: { owner: true } },
    });
    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }
    if (requirement.startupIdea.owner.id !== userId) {
      throw new ForbiddenException(
        'Only the requirement owner can view applications',
      );
    }

    return this.applicationRepo.find({
      where: { requirement: { id: requirementId } },
      relations: { candidate: true },
      order: { createdAt: 'DESC' },
    });
  }

  async listAll(
    status?: string,
    requirementId?: string,
    candidateId?: string,
    page = 1,
    limit = 20,
  ) {
    const qb = this.applicationRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.candidate', 'candidate')
      .leftJoinAndSelect('app.requirement', 'requirement')
      .leftJoinAndSelect('requirement.startupIdea', 'startup');

    if (status) {
      qb.andWhere('app.status = :status', { status });
    }
    if (requirementId) {
      qb.andWhere('requirement.id = :requirementId', { requirementId });
    }
    if (candidateId) {
      qb.andWhere('candidate.id = :candidateId', { candidateId });
    }

    qb.orderBy('app.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [applications, total] = await qb.getManyAndCount();
    return { applications, total, page, limit };
  }

  private async getApplicationWithRelations(
    applicationId: string,
  ): Promise<Application> {
    const application = await this.applicationRepo.findOne({
      where: { id: applicationId },
      relations: {
        candidate: true,
        requirement: {
          startupIdea: { owner: true },
        },
      },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }
}
