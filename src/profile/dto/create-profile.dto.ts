import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ProfileRole } from '../entities/profile.entity';

export class CreateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsEnum(ProfileRole)
  role: ProfileRole;

  @IsArray()
  @ArrayMaxSize(15)
  @IsString({ each: true })
  skills: string[];

  @IsArray()
  @IsString({ each: true })
  interestedIndustries: string[];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(80)
  availableWeeklyCommitment: number;

  @IsOptional()
  @IsString()
  @IsUrl()
  portfolioUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  githubUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
