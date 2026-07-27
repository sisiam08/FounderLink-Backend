import { UserSession } from '../../auth/entities/user-session.entity';
import { Profile } from '../../profile/entities/profile.entity';
import { StartupIdea } from '../../startup/entities/startup-idea.entity';
export declare enum SystemRole {
    USER = "user",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin"
}
export declare enum UserStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    BANNED = "banned"
}
export declare class User {
    id: string;
    fullName: string;
    email: string;
    password: string | null;
    googleId: string | null;
    systemRole: SystemRole;
    status: UserStatus;
    suspendedReason: string | null;
    sessions: UserSession[];
    profile: Profile;
    startupIdeas: StartupIdea[];
    createdAt: Date;
    updatedAt: Date;
}
