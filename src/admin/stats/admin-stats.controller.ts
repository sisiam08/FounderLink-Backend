import { Controller, Get, Query, UseGuards } from '@nestjs/common'; // NestJS কন্ট্রোলার ও ডেকোরেটর
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; // JWT টোকেন ভেরিফাই করে
import { RolesGuard } from '../../common/guards/roles.guard'; // রোল চেক করে
import { Roles } from '../../common/decorators/roles.decorator'; // রোল অনুমতি রাখে
import { AdminStatsService } from './admin-stats.service'; // স্ট্যাটস ডেটা তৈরির সার্ভিস

@Controller('admin/stats') // '/admin/stats' রুট হ্যান্ডেল করে
@UseGuards(JwtAuthGuard, RolesGuard) // প্রথমে অ্যাক্সেস গার্ড চালায়
@Roles('ADMIN', 'SUPER_ADMIN') // শুধুমাত্র ADMIN বা SUPER_ADMIN এক্সেস
export class AdminStatsController {
  constructor(private readonly statsService: AdminStatsService) {} // সার্ভিস ইনজেকশনের মাধ্যমে ডেটা নেয়

  @Get('overview') // GET /admin/stats/overview
  async getOverview() {
    // অ্যাডমিন ড্যাশবোর্ডের সারসংক্ষেপ ডেটা নেয়
    return this.statsService.getOverview();
  }

  @Get('users') // GET /admin/stats/users
  async getUserSignups(@Query('from') from?: string, @Query('to') to?: string) {
    // শুরু ও শেষ তারিখ অনুযায়ী ইউজার সাইনআপ সংখ্যা নেয়
    return this.statsService.getUserSignups(from, to);
  }

  @Get('applications') // GET /admin/stats/applications
  async getApplicationStats() {
    // অ্যাপ্লিকেশনের স্ট্যাটাস ও গড় compatibility স্কোর দেয়
    return this.statsService.getApplicationStats();
  }

  @Get('requirements') // GET /admin/stats/requirements
  async getRequirementStats() {
    // রিকোয়ারমেন্টের খোলা/বন্ধ ও রোলভিত্তিক সংখ্যা দেয়
    return this.statsService.getRequirementStats();
  }
}
