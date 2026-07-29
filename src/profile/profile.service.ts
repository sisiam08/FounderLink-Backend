import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { Profile } from './entities/profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
  ) {}

  async createProfile(
    userId: string,
    createProfileDto: CreateProfileDto,
  ): Promise<Profile> {
    const existingProfile = await this.profileRepo.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (existingProfile) {
      throw new ConflictException('Profile already exists for this user');
    }

    const profile = this.profileRepo.create({
      user: {
        id: userId,
      } as User,
      bio: createProfileDto.bio ?? null,
      role: createProfileDto.role,
      skills: createProfileDto.skills,
      interestedIndustries: createProfileDto.interestedIndustries,
      availableWeeklyCommitment: createProfileDto.availableWeeklyCommitment,
      portfolioUrl: createProfileDto.portfolioUrl ?? null,
      githubUrl: createProfileDto.githubUrl ?? null,
      linkedinUrl: createProfileDto.linkedinUrl ?? null,
      location: createProfileDto.location ?? null,
      photoUrl: null,
    });

    return await this.profileRepo.save(profile);
  }

  async getMyProfile(userId: string): Promise<Profile> {
    const profile = await this.profileRepo.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        user: true,
      },
    });

    if (profile == null) {
      throw new NotFoundException('Profile not found for this user');
    }

    return profile;
  }

  async updateMyProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    const profile = await this.getMyProfile(userId);

    Object.assign(profile, updateProfileDto);

    return await this.profileRepo.save(profile);
  }

  async getProfileByUserId(userId: string): Promise<Profile> {
    const profile = await this.profileRepo.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: { user: true },
    });

    if (profile == null) {
      throw new NotFoundException(
        `Profile for user with id ${userId} not found`,
      );
    }

    return profile;
  }

  async uploadProfilePhoto(
    userId: string,
    file: Express.Multer.File,
  ): Promise<Profile> {
    if (!file) {
      throw new BadRequestException('Profile photo file is required');
    }

    const profile = await this.getMyProfile(userId);

    profile.photoUrl = file.path.replace(/\\/g, '/');

    return await this.profileRepo.save(profile);
  }
}
