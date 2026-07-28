import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ProfileRole } from '../../profile/entities/profile.entity';

export class CreateRequirementDto {
  @IsEnum(ProfileRole)
  requiredRole: ProfileRole;

  @IsArray()
  @ArrayMaxSize(15)
  @IsString({ each: true })
  requiredSkills: string[];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(80)
  requiredWeeklyCommitment: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  equityOffered: number;
}
