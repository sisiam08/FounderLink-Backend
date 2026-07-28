import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { StartupStage } from '../entities/startup-idea.entity';

export class CreateStartupDto {
  @IsString()
  @MaxLength(160)
  title: string;

  @IsString()
  @MaxLength(255)
  shortDescription: string;

  @IsString()
  @MaxLength(5000)
  fullDescription: string;

  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  industries: string[];

  @IsOptional()
  @IsEnum(StartupStage)
  startupStage?: StartupStage;
}
