import {
  IsEnum,
  IsArray,
  ArrayMaxSize,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';
import { ProfileRole } from '../../profile/entities/profile.entity';
import { RequirementStatus } from '../entities/cofounder-requirement.entity';

export class UpdateRequirementDto {
  @IsEnum(ProfileRole)
  @IsOptional()
  requiredRole?: ProfileRole;

  @IsArray()
  @ArrayMaxSize(15)
  @IsString({ each: true })
  @IsOptional()
  requiredSkills?: string[];

  @IsInt()
  @Min(1)
  @IsOptional()
  requiredWeeklyCommitment?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  equityOffered?: number;

  @IsEnum(RequirementStatus)
  @IsOptional()
  status?: RequirementStatus;
}
