import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
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

    @Column({ name: 'full_name', type: 'varchar' })
    fullName: string;

    @Column({ unique: true })
    email: string;

    @Column({
        type: 'varchar',
        nullable: true,
        select: false,
    })
    password: string | null;

    @Column({
        name: 'google_id',
        type: 'varchar',
        nullable: true,
        unique: true,
        select: false,
    })
    googleId: string | null;

    @Column({
        name: 'system_role',
        type: 'enum',
        enum: SystemRole,
        default: SystemRole.USER,
    })
    systemRole: SystemRole;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
    status: UserStatus;

    @Column({
        name: 'suspended_reason',
        type: 'varchar',
        nullable: true,
        select: false,
    })
    suspendedReason: string | null;

    @OneToMany(() => UserSession, (session) => session.user)
    sessions: UserSession[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}