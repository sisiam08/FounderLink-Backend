import { Application } from '../../application/entities/application.entity';
import { User } from '../../user/entities/user.entity';
export declare class Message {
    id: string;
    application: Application;
    sender: User;
    content: string;
    isRead: boolean;
    createdAt: Date;
}
