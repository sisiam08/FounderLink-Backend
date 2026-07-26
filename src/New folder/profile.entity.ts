import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum ProfileRole {
  TECHNICAL = 'technical',
  PRODUCT = 'product',
  DESIGN = 'design',
  MARKETING = 'marketing',
  BUSINESS = 'business',
}

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'enum', enum: ProfileRole })
  role: ProfileRole;

  @Column({ type: 'text', array: true, default: [] })
  skills: string[];

  @Column({
    name: 'interested_industries',
    type: 'text',
    array: true,
    default: [],
  })
  interestedIndustries: string[];

  @Column({ name: 'available_weekly_commitment', default: 10 })
  availableWeeklyCommitment: number;

  @Column({ name: 'portfolio_url', type: 'varchar', nullable: true })
  portfolioUrl: string | null;

  @Column({ name: 'github_url', type: 'varchar', nullable: true })
  githubUrl: string | null;

  @Column({ name: 'linkedin_url', type: 'varchar', nullable: true })
  linkedinUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ name: 'photo_url', type: 'varchar', nullable: true })
  photoUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
