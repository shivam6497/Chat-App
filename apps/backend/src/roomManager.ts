import { Server } from "socket.io";
import { redisClient } from "./redis.js";
import {
  RoomState,
  ServerToClientEvent,
  ClientToServerEvent,
  ChatMessage,
} from "@chat-app/types";

const ROOM_TTL = 15;
const MAX_HISTORY = 100;

type AppServer = Server<ClientToServerEvent, ServerToClientEvent>;

const keys = {
  roomUsers: (roomId: string) => `room:${roomId}:users`,
  roomMessages: (roomId: string) => `room:${roomId}:messages`,
};

export class RoomManager {
  constructor(private io: AppServer) {}


  private async broadcastUserList(roomId: string): Promise<void> {
    const users = await redisClient.hvals(keys.roomUsers(roomId));
    this.io.to(roomId).emit("user-list", users);
  }

  async joinRoom(
    socketId: string,
    roomId: string,
    name: string
  ): Promise<{ history: ChatMessage[] }> {
    await redisClient.persist(keys.roomMessages(roomId));
    await redisClient.persist(keys.roomUsers(roomId));

    await redisClient.hset(keys.roomUsers(roomId), socketId, name);
    await this.broadcastUserList(roomId);

    const rawMessages = await redisClient.lrange(
      keys.roomMessages(roomId),
      0,
      -1
    );
    const history = rawMessages.map((msg) => JSON.parse(msg) as ChatMessage);

    return { history };
  }

  async leaveRoom(
    socketId: string,
    roomId: string
  ): Promise<void> {
    await redisClient.hdel(keys.roomUsers(roomId), socketId);
    await this.broadcastUserList(roomId);

    const userCount = await redisClient.hlen(keys.roomUsers(roomId));
    
    if(userCount === 0) {
      await redisClient.expire(keys.roomUsers(roomId), ROOM_TTL);
      await redisClient.expire(keys.roomMessages(roomId), ROOM_TTL);
      console.log(`Room ${roomId} is now empty. Set TTL for users and messages.`);
    }
  }

   async addMessage(roomId: string, message: ChatMessage): Promise<void> {
    const key = keys.roomMessages(roomId);
    const serialized = JSON.stringify(message);

    await redisClient.lpush(key, serialized);
    await redisClient.ltrim(key, 0, MAX_HISTORY - 1);
  }

  async roomExists(roomId: string): Promise<boolean> {
    return await redisClient.exists(keys.roomUsers(roomId)) === 1;
  }
}
