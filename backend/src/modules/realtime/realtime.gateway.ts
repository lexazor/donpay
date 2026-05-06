import {
  ConnectedSocket,
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.query.userId as string | undefined;
    if (userId) void client.join(`user:${userId}`);
  }

  emitBalanceUpdated(userId: string, payload: unknown) {
    this.server.to(`user:${userId}`).emit('balance.updated', payload);
  }

  emitTransactionStatus(userId: string, payload: unknown) {
    this.server
      .to(`user:${userId}`)
      .emit('transaction.status_changed', payload);
  }

  emitDepositStatus(userId: string, payload: unknown) {
    this.server.to(`user:${userId}`).emit('deposit.status_changed', payload);
  }
}
