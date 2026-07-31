import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { User, UserStatus } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import type { AuthenticatedSocket } from './interfaces/socket.interface';
import { MessageService } from './message.service';
import { OnEvent } from '@nestjs/event-emitter';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class MessageGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly messageService: MessageService,
  ) {}

  private createRoom(applicationId: string) {
    return `application: ${applicationId}`;
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const auth = client.handshake.auth as Record<string, unknown>;
      const accessToken =
        typeof auth.accessToken === 'string' ? auth.accessToken : null;

      if (!accessToken) {
        throw new UnauthorizedException('Authorization token missing');
      }

      const payload = await this.jwtService.verify(accessToken, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });

      const user = await this.userRepo.findOne({
        where: {
          id: payload.userId,
        },
        select: {
          id: true,
          status: true,
        },
      });
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException(
          'User not found or account is not active',
        );
      }

      client.data.userId = payload.userId;
      client.data.sessionId = payload.sessionId;
      client.data.joinedApplications = new Set<string>();
    } catch {
      client.emit('error', {
        message: 'Authentication failed',
      });
      client.disconnect();
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() payload: string | { applicationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<{ success: boolean }> {
    const applicationId = typeof payload === 'object' && payload ? payload.applicationId : payload;
    if (!client.data.joinedApplications) {
      client.data.joinedApplications = new Set<string>();
    }
    if (!client.data.joinedApplications.has(applicationId)) {
      await this.messageService.assertRoomAccess(
        applicationId,
        client.data.userId,
      );
      client.data.joinedApplications.add(applicationId);
    }
    const room = this.createRoom(applicationId);
    await client.join(room);
    await this.messageService.markAsRead(applicationId, client.data.userId);
    return { success: true };
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @MessageBody() payload: string | { applicationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const applicationId = typeof payload === 'object' && payload ? payload.applicationId : payload;
    const room = this.createRoom(applicationId);
    await client.leave(room);
    client.data.joinedApplications?.delete(applicationId);
  }

  @SubscribeMessage('mark-as-read')
  async handleMarkAsRead(
    @MessageBody() payload: string | { applicationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<{ success: boolean }> {
    const applicationId = typeof payload === 'object' && payload ? payload.applicationId : payload;
    if (!applicationId || !client.data.userId) return { success: false };
    await this.messageService.markAsRead(applicationId, client.data.userId);
    return { success: true };
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() payload: SendMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<{
    success: boolean;
    message?: Record<string, unknown>;
    error?: string;
  }> {
    const userId = client.data.userId;

    if (!userId) {
      throw new WsException('User not authenticated');
    }

    const { applicationId, content } = payload;

    if (!applicationId || !content?.trim()) {
      return {
        success: false,
        error: 'applicationId and content are required',
      };
    }

    // Auto-join room if not joined yet
    if (!client.data.joinedApplications) {
      client.data.joinedApplications = new Set<string>();
    }
    if (!client.data.joinedApplications.has(applicationId)) {
      await this.messageService.assertRoomAccess(applicationId, userId);
      client.data.joinedApplications.add(applicationId);
      const room = this.createRoom(applicationId);
      await client.join(room);
    }

    try {
      const message = await this.messageService.sendMessage(userId, payload);

      return {
        success: true,
        message: {
          id: message.id,
          applicationId,
          content: message.content,
          senderId: userId,
          createdAt: message.createdAt ? new Date(message.createdAt).toISOString() : new Date().toISOString(),
        },
      };
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }

  @OnEvent('new.message')
  emitNewMessage(
    applicationId: string,
    message: {
      id: string;
      content: string;
      senderId: string;
      createdAt: Date;
    },
  ) {
    if (!this.server) return;
    const room = this.createRoom(applicationId);
    const payload = {
      id: message.id,
      applicationId,
      content: message.content,
      senderId: message.senderId,
      createdAt: message.createdAt ? new Date(message.createdAt).toISOString() : new Date().toISOString(),
    };
    this.server.to(room).emit('new-message', payload);
  }
}
