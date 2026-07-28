import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateRequirementDto } from '../requirement/dto/create-requirement.dto';
import { CreateStartupDto } from './dto/create-startup.dto';
import { UpdateStartupDto } from './dto/update-startup.dto';
import { StartupService } from './startup.service';

@Controller('startups')
export class StartupController {
  constructor(private readonly startupService: StartupService) {}

  @Post()
  createStartup(
    @CurrentUser('userId') userId: string,
    @Body() createStartupDto: CreateStartupDto,
  ) {
    return this.startupService.createStartup(userId, createStartupDto);
  }
}
