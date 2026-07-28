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











}

