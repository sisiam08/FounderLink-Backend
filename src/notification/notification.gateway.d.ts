import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { OnGatewayConnection } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { User } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import { Notification } from "./entities/notification.entity";
export declare class NotificationGateway implements OnGatewayConnection {
    private readonly configService;
    private readonly jwtService;
    private readonly userRepo;
    server: Server;
    constructor(configService: ConfigService, jwtService: JwtService, userRepo: Repository<User>);
    private createRoom;
    handleConnection(client: Socket): Promise<void>;
    emitNotification(userId: string, notification: Notification): void;
    emitUnreadCount(userId: string, count: number): void;
    emitPendingCount(userId: string, count: number): void;
}
