import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    sessionId: string;
    joinedApplications: Set<string>;
  };
}
