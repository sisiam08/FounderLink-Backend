import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    fullName: string;

    @Column({ unique: true })
    email: string;

    @Column({ type: 'varchar', nullable: true, select: false })
    password: string | null;

    @Column({ type: 'varchar', nullable: true, unique: true, select: false })
    googleId: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}