import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { OnGatewayConnection } from "@nestjs/websockets";
import { Server } from "socket.io";
import { User } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import type { AuthenticatedSocket } from "./interfaces/socket.interface";
import { MessageService } from "./message.service";
import { SendMessageDto } from "./dto/send-message.dto";
export declare class MessageGateway implements OnGatewayConnection {
    private readonly jwtService;
    private readonly configService;
    private readonly userRepo;
    private readonly messageService;
    server: Server;
    constructor(jwtService: JwtService, configService: ConfigService, userRepo: Repository<User>, messageService: MessageService);
    private createRoom;
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleJoinRoom(applicationId: string, client: AuthenticatedSocket): Promise<void>;
    handleLeaveRoom(applicationId: string, client: AuthenticatedSocket): void;
    handleSendMessage(payload: SendMessageDto, client: AuthenticatedSocket): Promise<{
        success: boolean;
        message?: Record<string, unknown>;
        error?: string;
    }>;
    emitNewMessage(applicationId: string, messages: {
        id: string;
        content: string;
        senderId: string;
        createdAt: Date;
    }): void;
}
