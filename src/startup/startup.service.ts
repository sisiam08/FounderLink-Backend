import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CofounderRequirement } from '../requirement/entities/cofounder-requirement.entity';
import { User } from '../user/entities/user.entity';
import { CreateRequirementDto } from '../requirement/dto/create-requirement.dto';
import { CreateStartupDto } from './dto/create-startup.dto';
import { UpdateStartupDto } from './dto/update-startup.dto';
import { StartupIdea, StartupStatus } from './entities/startup-idea.entity';

@Injectable()
export class StartupService {
  constructor(
    @InjectRepository(StartupIdea)
    private readonly startupRepo: Repository<StartupIdea>,

    @InjectRepository(CofounderRequirement)
    private readonly requirementRepo: Repository<CofounderRequirement>,
  ) {}

  async createStartup(
    userId: string,
    createStartupDto: CreateStartupDto,
  ): Promise<StartupIdea> {
    const startup = this.startupRepo.create({
      owner: {
        id: userId,
      } as User,
      title: createStartupDto.title,
      shortDescription: createStartupDto.shortDescription,
      fullDescription: createStartupDto.fullDescription,
      industries: createStartupDto.industries,
      startupStage: createStartupDto.startupStage,
      status: StartupStatus.OPEN,
    });

    return await this.startupRepo.save(startup);
  }


async getMyStartups(userId: string): Promise<StartupIdea[]> {
return await this.startupRepo.find({
      where:{
        owner: {
        id: userId,
        },
      },
       relations: {
    requirements: true,
      },
      order: {
    createdAt:'DESC',
      },
    });
  }



 async getStartupById(id: string): Promise<StartupIdea> {
    const startup = await this.startupRepo.findOne({
      where:{
        id: id,
      },
      relations: {
     owner: true,
    requirements: true,
      },
    });

    if (startup==null) {
      throw new NotFoundException(
    `Startup idea with id ${id} not found`,
      );
    }

    return startup;
  }


 private checkOwner(
    startup: StartupIdea,
    userId: string,
  ): void {
    if (startup.owner.id !== userId) {
      throw new ForbiddenException(
        'You can only modify your own startup idea',
      );
    }
  }



async updateStartup(
    id: string,
    userId: string,
    updateStartupDto: UpdateStartupDto,
  ): Promise<StartupIdea> {
    const startup = await this.getStartupById(id);

    this.checkOwner(startup, userId);

    Object.assign(startup, updateStartupDto);

    return await this.startupRepo.save(startup);
  }

 async closeStartup(
    id: string,
    userId: string,
  ): Promise<StartupIdea> {
    const startup = await this.getStartupById(id);

    this.checkOwner(startup, userId);

    startup.status = StartupStatus.CLOSED;

    return await this.startupRepo.save(startup);
  }

async deleteStartup(
    id: string,
    userId: string,
  ): Promise<{ message: string }> {
    const startup = await this.getStartupById(id);

    this.checkOwner(startup, userId);

    await this.startupRepo.remove(startup);

    return {
      message: 'Startup idea deleted successfully',
    };
  }

  async addRequirement(
    ideaId: string,
    userId: string,
    createRequirementDto: CreateRequirementDto,
  ): Promise<CofounderRequirement> {
    const startup = await this.getStartupById(ideaId);

    this.checkOwner(startup, userId);

    if (startup.status === StartupStatus.CLOSED) {
      throw new BadRequestException(
        'Cannot add a requirement to a closed startup idea',
      );
    }

    const requirement = this.requirementRepo.create({
      startupIdea: startup,
      requiredRole: createRequirementDto.requiredRole,
      requiredSkills: createRequirementDto.requiredSkills,
      requiredWeeklyCommitment:
        createRequirementDto.requiredWeeklyCommitment,
      equityOffered: createRequirementDto.equityOffered,
    });

    return await this.requirementRepo.save(requirement);
  }



// for admin

async listStartups(status?: string, search?: string, page = 1, limit = 20) {
    const qb = this.startupRepo
      .createQueryBuilder('idea')
      .leftJoinAndSelect('idea.owner', 'owner');
 
    if (status) {
      qb.andWhere('idea.status = :status', { status });
    }
    if (search) {
      qb.andWhere(
        '(idea.title ILIKE :search OR idea.shortDescription ILIKE :search)',
        { search: `%${search}%` },
      );
    }
 
    qb.orderBy('idea.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
 
    const [startups, total] = await qb.getManyAndCount();
    return { startups, total, page, limit };
  }





}

