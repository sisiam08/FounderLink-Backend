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

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', nullable: true })
  passwordHash: string | null;

  @Column({ name: 'google_id', type: 'varchar', nullable: true, unique: true })
  googleId: string | null;

  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName: string;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => StartupIdea, (idea) => idea.owner)
  startupIdeas: StartupIdea[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
