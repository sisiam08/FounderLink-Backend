import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CofounderRequirement } from '../../requirement/entities/cofounder-requirement.entity';

export enum StartupStage {
  IDEA = 'idea',
  PROTOTYPE = 'prototype',
  MVP = 'mvp',
  LAUNCHED = 'launched',
  SCALING = 'scaling',
}

export enum StartupStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

@Entity('startup_ideas')
export class StartupIdea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.startupIdeas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ length: 160 })
  title: string;

  @Column({ name: 'short_description', length: 255 })
  shortDescription: string;

  @Column({ name: 'full_description', type: 'text' })
  fullDescription: string;

  @Column({ type: 'text', array: true, default: [] })
  industries: string[];

  @Column({
    name: 'startup_stage',
    type: 'enum',
    enum: StartupStage,
    default: StartupStage.IDEA,
  })
  startupStage: StartupStage;

  @Column({ type: 'enum', enum: StartupStatus, default: StartupStatus.OPEN })
  status: StartupStatus;

  @OneToMany(() => CofounderRequirement, (req) => req.startupIdea)
  requirements: CofounderRequirement[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
