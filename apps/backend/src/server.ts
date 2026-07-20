import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { ServerToClientEvent, ClientToServerEvent, ChatMessage } from "@chat-app/types";
import { RoomManager } from "./roomManager.js";
import { createAdapter } from "@socket.io/redis-adapter";
import { redisClient, redisAdapter } from "./redis.js";

const app = express();
const httpServer = createServer(app);

const io = new Server<ClientToServerEvent, ServerToClientEvent>(httpServer, {
  cors: {
    origin: ["https://chat-app-phi-beige-20.vercel.app"],
  },
});

io.adapter(createAdapter(redisClient, redisAdapter));

const PORT = 8080;
const roomManager = new RoomManager(io);

app.get("/health", (req, res) => {
  res.json({ status: true });
});

io.on("connection", (socket) => {
  console.log(`Socket Connected ${socket.id}`);

  let currentRoom: string | null = null;
  let username: string | null = null;

  socket.on("join-room", async ({ roomId, name }) => {
    if (!roomId?.trim() || !name?.trim()) {
      socket.emit("error-message", "Invalid roomId or name");
      return;
    }

    if (currentRoom) {
      await handleLeaveRoom();
    }

    currentRoom = roomId.trim();
    username = name.trim();

    socket.join(currentRoom);
    const { history } = await roomManager.joinRoom(socket.id, currentRoom, username);

    socket.emit("room-history", history as any);
    socket
      .to(currentRoom)
      .emit("system-message", `${username} joined the room`);
    console.log(`Socket ${socket.id} joined room ${currentRoom}`);
  });

  // @ts-ignore
  socket.on("chat-message", async (text: string): Promise<void> => {
    if (!currentRoom || !username || !text.trim()) {
      socket.emit("error-message", "Invalid roomId or name");
      return;
    }
    const message: ChatMessage = {
      user: username,
      text: text.trim(),
      ts: Date.now(),
    };

    await roomManager.addMessage(currentRoom, message);
    io.to(currentRoom).emit("chat-message", message);
  });

  async function handleLeaveRoom(): Promise<void> {
    if(!currentRoom || !username) return;

    await roomManager.leaveRoom(socket.id, currentRoom);
    socket.to(currentRoom).emit("system-message", `${username} left the room`);
    socket.leave(currentRoom);

    currentRoom = null;
    username = null;
  }

  socket.on("leave-room", handleLeaveRoom);

  socket.on("disconnect", async () => {
    console.log(`Socket ${socket.id} disconnected`);
    await handleLeaveRoom();
  });
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
