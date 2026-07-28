import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { RequirementService } from './requirement.service';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SystemRole } from 'src/user/entities/user.entity';
import { CreateRequirementDto } from './dto/create-requirement.dto';

@Controller('requirements')
export class RequirementController {
  constructor(private readonly requirementService: RequirementService) {}

  @Post('startup/:ideaId')
  async create(@Param('ideaId') ideaId: string,@Body() dto: CreateRequirementDto,@CurrentUser('userId') userId: string,) {
    return this.requirementService.createRequirement(ideaId, userId, dto);
  }
  @Patch(':id')
  async update(@Param('id') id: string,@Body() dto: UpdateRequirementDto,@CurrentUser('userId') userId: string,) {
    return this.requirementService.updateRequirement(id, userId, dto);
  }

  @Patch(':id/close')
  async close(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.requirementService.closeRequirement(id, userId);
  }

  

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    await this.requirementService.deleteRequirement(id, userId);
    return { message: 'Requirement deleted' };
  }

  @Get('browse')
  async browse(@CurrentUser('userId') userId: string,@Query('cursor') cursor?: { createdAt: string; id: string },@Query('role') role?: string,@Query('industry') industry?: string,@Query('stage') stage?: string,) {
    return this.requirementService.browseRequirements(
      userId,
      cursor,
      role,
      industry,
      stage,
    );
  }

  @Get(':id')
  async getById(@Param('id') id: string,@CurrentUser('userId') userId: string,) {
    return this.requirementService.getRequirementById(id, userId);
  }

  @Get('requirements')
  @Roles(SystemRole.ADMIN, SystemRole.SUPER_ADMIN)
  async listRequirements(@Query('status') status?: string,@Query('role') role?: string,@Query('page') page?: string,@Query('limit') limit?: string) {
    return this.requirementService.listRequirements(
      status,
      role,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Patch('requirements/:id/close')
  @Roles(SystemRole.ADMIN, SystemRole.SUPER_ADMIN)
  async forceCloseRequirement(@Param('id') id: string,@CurrentUser('userId') adminId: string) {
    return this.requirementService.forceCloseRequirement(id, adminId);
  }
}
