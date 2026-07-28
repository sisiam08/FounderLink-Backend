import { Injectable } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getAllUserList(
    page: number,
    limit: number,
    status?: string,
    systemRole?: string,
    search?: string,
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const query = this.userRepo.createQueryBuilder('user');

    if(status) {
      query.andWhere('user.status = :status', { status });
    }

    if(systemRole) {
      query.andWhere('user.systemRole = :systemRole', { systemRole });
    }

    if(search) {
      query.andWhere(
        '(user.full_name LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const skipPage = (page - 1) * limit;
    query.orderBy('user.createdAt', 'DESC').skip(skipPage).take(limit);

    const [users, total] = await query.getManyAndCount();

    return {users, total, page, limit}
  }




}