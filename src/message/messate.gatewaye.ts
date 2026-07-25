import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { User, UserStatus } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import type { AuthenticatedSocket } from "./interfaces/socket.interface";

@WebSocketGateway({
    namespace: '/chat'
})
export class MessageGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    constructor(private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) { }

    async handleConnection(client: AuthenticatedSocket) {
        try {
            const auth = client.handshake.auth as Record<string, unknown>;
            const accessToken = (typeof auth.accessToken === 'string') ? auth.accessToken : null;

            if (!accessToken) {
                throw new UnauthorizedException("Authorization token missing")
            }

            const payload = await this.jwtService.verify(accessToken, {
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
            if(!user || user.status !== UserStatus.ACTIVE){
                throw new UnauthorizedException("User not found or account is not active")
            }

            client.data.userId= payload.userId;
            client.data.sessionId = payload.sessionId;

        } catch (error) {
            void client.disconnect();
            throw error;
        }
    }

    @SubscribeMessage('join-room')
    handleJoinRoom(@MessageBody() applicationId: string, @ConnectedSocket() client: AuthenticatedSocket){
        const room = `application: ${applicationId}`;
        void client.join(room);
    }

    @SubscribeMessage('leave-room')
    handleLeaveRoom(@MessageBody() applicationId: string, @ConnectedSocket() client: AuthenticatedSocket){
        const room = `application: ${applicationId}`;
        void client.leave(room);
    }
}
