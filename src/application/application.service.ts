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

    // FR-I2: cannot apply to own requirement
    if (requirement.startupIdea.owner.id === userId) {
      throw new BadRequestException('You cannot apply to your own requirement');
    }

    // FR-F1: duplicate blocked
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

    const application = new Application();
    application.requirement = requirement;
    application.candidate = { id: userId } as User;
    application.status = ApplicationStatus.PENDING;
    application.compatibilityScore = score;

    return this.applicationRepo.save(application);
  }

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
