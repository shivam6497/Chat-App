import { Server } from "socket.io";
import {
  RoomState,
  ServerToClientEvent,
  ClientToServerEvent,
  ChatMessage,
} from "./types";

const ROOM_PERIOD = 15_000;
const MAX_HISTORY = 100;

type AppServer = Server<ClientToServerEvent, ServerToClientEvent>;

export class RoomManager {
  private rooms = new Map<string, RoomState>();

  constructor(private io: AppServer) {}

  private getOrCreateRoom(roomId: string): RoomState {
    let room = this.rooms.get(roomId);

    if (!room) {
      room = { users: new Map(), messages: [], emptyTimer: null };
      this.rooms.set(roomId, room);
    }
    return room;
  }

  private broadcastUserList(roomId: string): void {
    const room = this.rooms.get(roomId);

    if (!room) return;

    this.io.to(roomId).emit("user-list", Array.from(room.users.values()));
  }

  private scheduleCleanUp(roomId: string): void {
    const room = this.rooms.get(roomId);

    if(!room) return;

    if(room.emptyTimer) clearTimeout(room.emptyTimer);

    room.emptyTimer = setTimeout(() => {
      const r = this.rooms.get(roomId);
      if(r && r.users.size === 0) {
        this.rooms.delete(roomId);
        console.log(`Room ${roomId} is empty, removing it`);
      }
    }, ROOM_PERIOD);
  }

  joinRoom(socketId: string,roomId: string, name: string): {
    history: ChatMessage[];
  } {
    const room = this.getOrCreateRoom(roomId);

    if(room.emptyTimer) {
      clearTimeout(room.emptyTimer);
      room.emptyTimer = null;
    }

    room.users.set(socketId, name);
    this.broadcastUserList(roomId);

    return { history: room.messages };
  }

  leaveRoom(socketId: string, roomId: string, name: string): void {
    const room = this.rooms.get(roomId);
    
    if(!room) return;

    room.users.delete(socketId);
    this.broadcastUserList(roomId);

    if(room.users.size === 0) {
      this.scheduleCleanUp(roomId);
    }
  }

  addMessage(roomId: string, message: ChatMessage): void {
    const room = this.rooms.get(roomId);
    if(!room) return;

    room.messages.push(message);
    if(room.messages.length > MAX_HISTORY) {
      room.messages.shift();
    }
  }

  roomExists(roomId: string): boolean {
    return this.rooms.has(roomId);
  }
}
