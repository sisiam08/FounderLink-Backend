import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StartupIdea } from '../../startup/entities/startup-idea.entity';
import { ProfileRole } from '../../profile/entities/profile.entity';

export enum RequirementStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}
@Entity('cofounder_requirements')
export class CofounderRequirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @ManyToOne(() => StartupIdea, (idea) => idea.requirements, {
  //   onDelete: 'CASCADE',
  // })
  @JoinColumn({ name: 'startup_idea_id' })
  startupIdea: StartupIdea;

  @Column({ name: 'required_role', type: 'enum', enum: ProfileRole })
  requiredRole: ProfileRole;

  @Column({ name: 'required_skills', type: 'text', array: true, default: [] })
  requiredSkills: string[];

  @Column({ name: 'required_weekly_commitment', default: 10 })
  requiredWeeklyCommitment: number;

  @Column({
    name: 'equity_offered',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  equityOffered: number;

  @Column({
    type: 'enum',
    enum: RequirementStatus,
    default: RequirementStatus.OPEN,
  })
  status: RequirementStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
