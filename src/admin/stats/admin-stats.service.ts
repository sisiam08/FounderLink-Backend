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

@Injectable() // এই ক্লাসকে সার্ভিস হিসেবে ইনজেক্ট করা যাবে
export class AdminStatsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>, // ইউজার টেবিলের জন্য রেপোজিটরি
    @InjectRepository(StartupIdea)
    private readonly startupRepo: Repository<StartupIdea>, // স্টার্টআপ আইডিয়া টেবিলের জন্য রেপোজিটরি
    @InjectRepository(CofounderRequirement)
    private readonly requirementRepo: Repository<CofounderRequirement>, // রিকোয়ারমেন্ট টেবিলের জন্য রেপোজিটরি
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>, // অ্যাপ্লিকেশন টেবিলের জন্য রেপোজিটরি
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>, // মেসেজ টেবিলের জন্য রেপোজিটরি
    @InjectRepository(UserSession)
    private readonly sessionRepo: Repository<UserSession>, // সেশন টেবিলের জন্য রেপোজিটরি
  ) {}

  async getOverview() {
    // ড্যাশবোর্ডের মূল স্ট্যাটস বের করে
    const [
      users,
      startups,
      openRequirements,
      closedRequirements,
      messages,
      activeSessions,
    ] = await Promise.all([
      this.userRepo.count(), // মোট ইউজার সংখ্যা
      this.startupRepo.count(), // মোট স্টার্টআপ সংখ্যা
      this.requirementRepo.count({ where: { status: RequirementStatus.OPEN } }), // খোলা রিকোয়ারমেন্ট সংখ্যা
      this.requirementRepo.count({
        where: { status: RequirementStatus.CLOSED }, // বন্ধ রিকোয়ারমেন্ট সংখ্যা
      }),
      this.messageRepo.count(), // মোট মেসেজ সংখ্যা
      this.sessionRepo.count({ where: { revoked: false } }), // সক্রিয় সেশন সংখ্যা
    ]);

    // অ্যাপ্লিকেশন স্ট্যাটাস অনুযায়ী পরিমাণ বের করে
    const statusRows: RawCountRow[] = await this.applicationRepo
      .createQueryBuilder('app') // অ্যাপ্লিকেশন টেবিলের কুয়েরি শুরু
      .select('app.status', 'status') // প্রতিটি অ্যাপ্লিকেশনের স্ট্যাটাস নেয়
      .addSelect('COUNT(*)', 'count') // প্রতি স্ট্যাটাসের গননা নেয়
      .groupBy('app.status') // একই স্ট্যাটাস একসঙ্গে গ্রুপ করে
      .getRawMany(); // কাঁচা রো ফরম্যাটে ফলাফল নেয়

    const applications = statusRows.reduce(
      (acc, row) => {
        acc[row.status] = parseInt(row.count, 10); // স্ট্রিং কাউন্টকে সংখ্যা হিসাবে সেভ করে
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      users,
      startups,
      requirements: { open: openRequirements, closed: closedRequirements }, // খোলা ও বন্ধ রিকোয়ারমেন্ট সংখ্যা
      applications,
      messages,
      activeSessions,
    };
  }

  async getUserSignups(from?: string, to?: string) {
    // শুরু-শেষ তারিখের মধ্যে প্রতিদিনের সাইনআপ সংখ্যা বের করে
    const qb = this.userRepo
      .createQueryBuilder('user') // ইউজার টেবিলের কুয়েরি তৈরি করে
      .select('DATE(user.createdAt)', 'date') // সাইনআপের তারিখ আলাদা করে নেয়
      .addSelect('COUNT(*)', 'count') // ঐ দিনে মোট সাইনআপ সংখ্যা নেয়
      .groupBy('DATE(user.createdAt)') // একই তারিখের সাইনআপ একসঙ্গে গ্রুপ করে
      .orderBy('DATE(user.createdAt)', 'ASC'); // তারিখের ক্রমে সাজায়

    if (from) qb.andWhere('user.createdAt >= :from', { from }); // শুরু তারিখ থেকে ডেটা সীমাবদ্ধ করে
    if (to) qb.andWhere('user.createdAt <= :to', { to }); // শেষ তারিখ পর্যন্ত ডেটা সীমাবদ্ধ করে

    return qb.getRawMany(); // কাঁচা রো রিটার্ন করে
  }

  async getApplicationStats() {
    // অ্যাপ্লিকেশনের প্রতিটি স্ট্যাটাসের সংখ্যা এবং গড় compatibility স্কোর বের করে
    const statusRows: RawCountRow[] = await this.applicationRepo
      .createQueryBuilder('app') // অ্যাপ্লিকেশন টেবিলের কুয়েরি শুরু
      .select('app.status', 'status') // প্রতিটি অ্যাপ্লিকেশনের স্ট্যাটাস নেয়
      .addSelect('COUNT(*)', 'count') // স্ট্যাটাস অনুযায়ী সংখ্যা গননা করে
      .groupBy('app.status')
      .getRawMany();

    const avgRow: RawAvgRow | undefined = await this.applicationRepo
      .createQueryBuilder('app')
      .select('AVG(app.compatibilityScore)', 'avg') // compatibilityScore-এর গড় হিসাব করে
      .getRawOne();

    return {
      byStatus: statusRows.reduce(
        (acc, row) => {
          acc[row.status] = parseInt(row.count, 10); // স্ট্যাটাস অনুসারে সংখ্যা রাখে
          return acc;
        },
        {} as Record<string, number>,
      ),
      averageCompatibilityScore: avgRow?.avg
        ? Math.round(parseFloat(avgRow.avg)) // গড় স্কোর সংখ্যা হিসেবে রাখে
        : 0,
    };
  }

  async getRequirementStats() {
    // রিকোয়ারমেন্টের খোলা-বন্ধ সংখ্যা ও প্রতিটি রোলের সংখ্যা বের করে
    const openCount = await this.requirementRepo.count({
      where: { status: RequirementStatus.OPEN }, // খোলা রিকোয়ারমেন্ট গণনা
    });
    const closedCount = await this.requirementRepo.count({
      where: { status: RequirementStatus.CLOSED }, // বন্ধ রিকোয়ারমেন্ট গণনা
    });

    const roleRows: RawRoleRow[] = await this.requirementRepo
      .createQueryBuilder('req') // রিকোয়ারমেন্ট টেবিলের কুয়েরি
      .select('req.requiredRole', 'role') // প্রয়োজনীয় রোল নেয়
      .addSelect('COUNT(*)', 'count') // প্রতিটি রোলে গণনা করে
      .groupBy('req.requiredRole')
      .getRawMany();

    return {
      open: openCount,
      closed: closedCount,
      byRole: roleRows.reduce(
        (acc, row) => {
          acc[row.role] = parseInt(row.count, 10); // প্রতিটি রোলে সংখ্যা রাখে
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }
}
