import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../../user/entities/user.entity';
import { AdminStatsService } from './admin-stats.service';

@Controller('admin/stats')
@Roles(SystemRole.ADMIN, SystemRole.SUPER_ADMIN)
export class AdminStatsController {
  constructor(private readonly statsService: AdminStatsService) {} 

  @Get('overview') 
  async getOverview() {
    
    return this.statsService.getOverview();
  }

  @Get('users') 
  async getUserSignups(@Query('from') from?: string, @Query('to') to?: string) {
    
    return this.statsService.getUserSignups(from, to);
  }

  @Get('applications') 
  async getApplicationStats() {
    
    return this.statsService.getApplicationStats();
  }

  @Get('requirements') 
  async getRequirementStats() {
    
    return this.statsService.getRequirementStats();
  }
}
