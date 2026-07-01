import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvent, ServerToClientEvent } from './types';

const SERVER_URL = 'http://localhost:8080';

export const socket: Socket<ServerToClientEvent, ClientToServerEvent> = io(
  SERVER_URL,
  {
    autoConnect: true,
  }
);
