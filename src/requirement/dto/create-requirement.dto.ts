import {
  IsEnum,
  IsArray,
  ArrayMaxSize,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsString,
} from 'class-validator';
import { ProfileRole } from '../../profile/entities/profile.entity';

export class CreateRequirementDto {
  @IsEnum(ProfileRole)
  requiredRole: ProfileRole;

  @IsArray()
  @ArrayMaxSize(15)
  @IsString({ each: true })
  requiredSkills: string[];

  @IsInt()
  @Min(1)
  requiredWeeklyCommitment: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  equityOffered: number;
}
