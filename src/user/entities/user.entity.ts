import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

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

    @Column({
        type: 'varchar',
        nullable: true,
        select: false,
    })
    password: string | null;

    @Column({
        type: 'varchar',
        nullable: true,
        unique: true,
        select: false,
    })
    googleId: string | null;

    @Column({ type: 'varchar' })
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

    @Column({
        type: 'varchar',
        nullable: true,
        select: false,
    })
    suspendedReason: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
