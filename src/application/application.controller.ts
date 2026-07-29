import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

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
}
