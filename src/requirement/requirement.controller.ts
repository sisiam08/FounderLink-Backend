import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { RequirementService } from './requirement.service';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('requirements')
export class RequirementController {
  constructor(private readonly requirementService: RequirementService) {}

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRequirementDto,
    @CurrentUser('userId') userId: string,
  ) {
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
  async browse(
    @CurrentUser('userId') userId: string,
    @Query('cursor') cursor?: string,
    @Query('role') role?: string,
    @Query('industry') industry?: string,
    @Query('stage') stage?: string,
  ) {
    return this.requirementService.browseRequirements(
      userId,
      cursor,
      role,
      industry,
      stage,
    );
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.requirementService.getRequirementById(id, userId);
  }
}
