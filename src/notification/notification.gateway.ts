import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { User, UserStatus } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { Notification } from "./entities/notification.entity";

@WebSocketGateway({
    namespace: '/notification'
})
export class NotificationGateway implements OnGatewayConnection {

    @WebSocketServer()
    server: Server
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) { }

    private createRoom(userId: string) {
        return `user: ${userId}`;
    }

    async handleConnection(client: Socket) {
        try {
            const auth = client.handshake.auth as Record<string, unknown>;
            const accessToken = (typeof auth.accessToken === 'string') ? auth.accessToken : null;

            if (!accessToken) {
                throw new UnauthorizedException("Authorization token missing");
            }

            const payload = this.jwtService.verify(accessToken, {
                secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET')
            })

            const user = await this.userRepo.findOne({
                where: {
                    id: payload.userId
                },
                select: {
                    id: true,
                    status: true
                }
            })

            if (!user || user.status !== UserStatus.ACTIVE) {
                throw new UnauthorizedException("User not found or account is not active");
            }

            client.data.userId = user.id;
            const room = this.createRoom(user.id);
            void client.join(room);

        } catch (error) {
            void client.disconnect();
            throw error
        }
    }

    emitNotification(userId: string, notification: Notification): void {
        const room = this.createRoom(userId);
        this.server.to(room).emit('new-notification', notification);
    }

    emitUnreadCount(userId: string, count: number): void {
        const room = this.createRoom(userId);
        this.server.to(room).emit('unread-count', count);
    }

    emitPendingCount(userId: string, count: number): void {
        const room = this.createRoom(userId);
        this.server.to(room).emit('pending-count', count);
    }
}