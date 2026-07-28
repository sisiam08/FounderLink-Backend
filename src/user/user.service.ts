import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { SystemRole, User, UserStatus } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserSession } from "src/auth/entities/user-session.entity";
import { SessionService } from "src/auth/session.service";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(UserSession) private readonly userSessionRepo: Repository<UserSession>,
    private readonly sessionService: SessionService,
  ) { }

  private async findUserOrThrow(id: string): Promise<User> {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.suspendedReason')
      .where('user.id = :id', { id })
      .getOne();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getAllUserList(
    page: number,
    limit: number,
    status?: string,
    systemRole?: string,
    search?: string,
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    try {
      const query = this.userRepo.createQueryBuilder('user');

      if (status) {
        query.andWhere('user.status = :status', { status });
      }

      if (systemRole) {
        query.andWhere('user.systemRole = :systemRole', { systemRole });
      }

      if (search) {
        query.andWhere(
          '(user.full_name LIKE :search OR user.email LIKE :search)',
          { search: `%${search}%` },
        );
      }

      const skipPage = (page - 1) * limit;
      query.orderBy('user.createdAt', 'DESC').skip(skipPage).take(limit);

      const [users, total] = await query.getManyAndCount();

      return { users, total, page, limit }
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user list');
    }
  }

  async getUserDetail(id: string) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.suspendedReason')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.startupIdeas', 'startupIdeas')
      .leftJoinAndSelect('user.sessions', 'sessions')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let activeSessions: UserSession[] = [];
    if (user.sessions?.length > 0) {
      activeSessions = user.sessions.filter((s) => !s.revoked);
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      systemRole: user.systemRole,
      status: user.status,
      suspendedReason: user.suspendedReason,
      profile: user.profile,
      startupIdeas: user.startupIdeas,
      activeSessionsCount: activeSessions.length,
      createdAt: user.createdAt,
    };
  }

  async updateUserStatus(
    userId: string,
    status: UserStatus,
    reason?: string,
  ) {
    const user = await this.findUserOrThrow(userId);
    user.status = status;
    if (status === UserStatus.SUSPENDED) user.suspendedReason = reason ?? null;
    else user.suspendedReason = null;

    await this.userRepo.save(user);

    if (status === UserStatus.SUSPENDED || status === UserStatus.BANNED) {
      await this.sessionService.revokeAllSessions(userId);
    }

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      suspendedReason: user.suspendedReason,
    };
  }

  async changeUserRole(userId: string, newRole: SystemRole) {
    const user = await this.findUserOrThrow(userId);
    user.systemRole = newRole;
    await this.userRepo.save(user);

    return { id: user.id, systemRole: user.systemRole };
  }




}