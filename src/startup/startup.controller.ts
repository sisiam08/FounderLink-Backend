import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateRequirementDto } from '../requirement/dto/create-requirement.dto';
import { CreateStartupDto } from './dto/create-startup.dto';
import { UpdateStartupDto } from './dto/update-startup.dto';
import { StartupService } from './startup.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SystemRole } from 'src/user/entities/user.entity';

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


@Get('mine')
  getMyStartups(
    @CurrentUser('userId') userId:string,
  ) {
    return this.startupService.getMyStartups(userId);
  }

 @Get(':id')
  getStartupById(
    @Param('id', new ParseUUIDPipe(
      { version:'4'}))
    id: string,
  ) {
    return this.startupService.getStartupById(id);
  }


 @Patch(':id')
  updateStartup(
    @Param('id', new ParseUUIDPipe(
      { version: '4' }))
    id: string,
    @CurrentUser('userId') userId: string,
    @Body() updateStartupDto: UpdateStartupDto,
  ) {
    return this.startupService.updateStartup(
      id,
      userId,
      updateStartupDto,
    );
  }


   @Patch(':id/close')
  closeStartup(
    @Param('id', new ParseUUIDPipe(
      { version:'4'}))
    id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.startupService.closeStartup(id, userId);
  }

@Delete(':id')
  deleteStartup(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.startupService.deleteStartup(id, userId);
  }

  @Post(':ideaId/requirements')
  addRequirement(
    @Param('ideaId', new ParseUUIDPipe({ version: '4' }))
    ideaId: string,
    @CurrentUser('userId') userId: string,
    @Body() createRequirementDto: CreateRequirementDto,
  ) {
    return this.startupService.addRequirement(
      ideaId,
      userId,
      createRequirementDto,
    );
  }

  
@Roles(SystemRole.SUPER_ADMIN,SystemRole.ADMIN)
@Get('all')
  async listStartups(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.startupService.listStartups(
      status,
      search,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }






}
