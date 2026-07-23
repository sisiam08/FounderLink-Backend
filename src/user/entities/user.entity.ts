import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from '../../profile/entities/profile.entity';
import { StartupIdea } from '../../startup/entities/startup-idea.entity';
import { UserSession } from '../../auth/entities/user-session.entity';

export enum SystemRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', nullable: true, select: false })
  passwordHash: string | null;

  @Column({ name: 'google_id', type: 'varchar', nullable: true, unique: true, select: false })
  googleId: string | null;

  @Column({ name: 'full_name', length: 120 })
  fullName: string;

  @Column({
    name: 'system_role',
    type: 'enum',
    enum: SystemRole,
    default: SystemRole.USER,
  })
  systemRole: SystemRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ name: 'suspended_reason', type: 'varchar', nullable: true, select: false })
  suspendedReason: string | null;

  // @OneToOne(() => Profile, (profile) => profile.user)
  // profile: Profile;

  // @OneToMany(() => StartupIdea, (idea) => idea.owner)
  // startupIdeas: StartupIdea[];

  // @OneToMany(() => UserSession, (session) => session.user)
  // sessions: UserSession[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
