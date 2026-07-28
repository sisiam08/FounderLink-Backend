import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { StartupIdea } from '../../startup/entities/startup-idea.entity';
import {
  CofounderRequirement,
  RequirementStatus,
} from '../../requirement/entities/cofounder-requirement.entity';
import { Application } from '../../application/entities/application.entity';
import { Message } from '../../message/entities/message.entity';
import { UserSession } from '../../auth/entities/user-session.entity';

interface RawCountRow {
  status: string;
  count: string;
}

interface RawRoleRow {
  role: string;
  count: string;
}

interface RawAvgRow {
  avg: string | null;
}

@Injectable()
export class AdminStatsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(StartupIdea)
    private readonly startupRepo: Repository<StartupIdea>,
    @InjectRepository(CofounderRequirement)
    private readonly requirementRepo: Repository<CofounderRequirement>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(UserSession)
    private readonly sessionRepo: Repository<UserSession>,
  ) {}
  async getOverview() {
    const [
      users,
      startups,
      openRequirements,
      closedRequirements,
      messages,
      activeSessions,
    ] = await Promise.all([
      this.userRepo.count(),
      this.startupRepo.count(),
      this.requirementRepo.count({ where: { status: RequirementStatus.OPEN } }),
      this.requirementRepo.count({
        where: { status: RequirementStatus.CLOSED },
      }),
      this.messageRepo.count(),
      this.sessionRepo.count({ where: { revoked: false } }),
    ]);

    const statusRows: RawCountRow[] = await this.applicationRepo
      .createQueryBuilder('app')
      .select('app.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('app.status')
      .getRawMany();

    const applications = statusRows.reduce(
      (acc, row) => {
        acc[row.status] = parseInt(row.count, 10);
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      users,
      startups,
      requirements: { open: openRequirements, closed: closedRequirements },
      applications,
      messages,
      activeSessions,
    };
  }

  async getUserSignups(from?: string, to?: string) {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .select('DATE(user.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy('DATE(user.createdAt)')
      .orderBy('DATE(user.createdAt)', 'ASC');

    if (from) qb.andWhere('user.createdAt >= :from', { from });
    if (to) qb.andWhere('user.createdAt <= :to', { to });

    return qb.getRawMany();
  }
  
  async getApplicationStats() {
    const statusRows: RawCountRow[] = await this.applicationRepo
      .createQueryBuilder('app')
      .select('app.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('app.status')
      .getRawMany();

    const avgRow: RawAvgRow | undefined = await this.applicationRepo
      .createQueryBuilder('app')
      .select('AVG(app.compatibilityScore)', 'avg')
      .getRawOne();

    return {
      byStatus: statusRows.reduce(
        (acc, row) => {
          acc[row.status] = parseInt(row.count, 10);
          return acc;
        },
        {} as Record<string, number>,
      ),
      averageCompatibilityScore: avgRow?.avg
        ? Math.round(parseFloat(avgRow.avg))
        : 0,
    };
  }

  async getRequirementStats() {
    const openCount = await this.requirementRepo.count({
      where: { status: RequirementStatus.OPEN },
    });
    const closedCount = await this.requirementRepo.count({
      where: { status: RequirementStatus.CLOSED },
    });

    const roleRows: RawRoleRow[] = await this.requirementRepo
      .createQueryBuilder('req')
      .select('req.requiredRole', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('req.requiredRole')
      .getRawMany();

    return {
      open: openCount,
      closed: closedCount,
      byRole: roleRows.reduce(
        (acc, row) => {
          acc[row.role] = parseInt(row.count, 10);
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }
}
