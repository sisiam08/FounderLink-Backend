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

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(CofounderRequirement)
    private readonly requirementRepo: Repository<CofounderRequirement>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
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
    return this.applicationRepo.save(application);
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
    return this.applicationRepo.save(application);
  }

  async getMyApplications(userId: string): Promise<Application[]> {
    return this.applicationRepo.find({
      where: { candidate: { id: userId } },
      relations: { requirement: { startupIdea: true } },
      order: { createdAt: 'DESC' },
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
