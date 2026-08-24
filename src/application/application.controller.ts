import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SystemRole } from 'src/user/entities/user.entity';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Patch(':id/withdraw')
  async withdraw(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.applicationService.withdraw(id, userId);
  }

  @Patch(':id/accept')
  async accept(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.applicationService.accept(id, userId);
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.applicationService.reject(id, userId);
  }

  @Get('mine')
  async getMine(@CurrentUser('userId') userId: string) {
    return this.applicationService.getMyApplications(userId);
  }

  @Get('received')
  async getReceived(@CurrentUser('userId') userId: string) {
    return this.applicationService.getReceivedApplications(userId);
  }

  @Get('pending-count')
  async getPendingCount(@CurrentUser('userId') userId: string) {
    const count = await this.applicationService.getPendingCount(userId);
    return { count };
  }

  @Get('list')
  @Roles(SystemRole.ADMIN, SystemRole.SUPER_ADMIN)
  async listAll(
    @Query('status') status?: string,
    @Query('requirementId') requirementId?: string,
    @Query('candidateId') candidateId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.applicationService.listAll(
      status,
      requirementId,
      candidateId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
