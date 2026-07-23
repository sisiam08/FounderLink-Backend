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
