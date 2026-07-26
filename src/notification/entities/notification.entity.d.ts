import { User } from '../../user/entities/user.entity';
export declare enum NotificationType {
    NEW_APPLICATION = "new_application",
    APPLICATION_ACCEPTED = "application_accepted",
    APPLICATION_REJECTED = "application_rejected",
    NEW_MESSAGE = "new_message",
    SYSTEM_ANNOUNCEMENT = "system_announcement"
}
export declare class Notification {
    id: string;
    user: User;
    type: NotificationType;
    payload: Record<string, unknown>;
    isRead: boolean;
    createdAt: Date;
}
