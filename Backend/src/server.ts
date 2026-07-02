import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { ServerToClientEvent, ClientToServerEvent, ChatMessage } from "./types";
import { RoomManager } from "./roomManager.js";

const app = express();
const httpServer = createServer(app);

const io = new Server<ClientToServerEvent, ServerToClientEvent>(httpServer, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

const PORT = 8080;
const roomManager = new RoomManager(io);

app.get("/health", (req, res) => {
  res.json({ status: true });
});

io.on("connection", (socket) => {
  console.log(`Socket Connected ${socket.id}`);

  let currentRoom: string | null = null;
  let username: string | null = null;

  socket.on("join-room", ({ roomId, name }) => {
    if (!roomId?.trim() || !name?.trim()) {
      socket.emit("error-message", "Invalid roomId or name");
      return;
    }

    if (currentRoom) {
      handleLeaveRoom();
    }

    currentRoom = roomId.trim();
    username = name.trim();

    socket.join(currentRoom);
    const { history } = roomManager.joinRoom(socket.id, currentRoom, username);

    socket.emit("room-history", history as any);
    socket
      .to(currentRoom)
      .emit("system-message", `${username} joined the room`);
    console.log(`Socket ${socket.id} joined room ${currentRoom}`);
  });

  socket.on("chat-message", (text) => {
    if (!currentRoom || !username || !text.trim()) {
      socket.emit("error-message", "Invalid roomId or name");
      return "error";
    }
    const message: ChatMessage = {
      user: username,
      text: text.trim(),
      ts: Date.now(),
    };

    roomManager.addMessage(currentRoom, message);
    io.to(currentRoom).emit("chat-message", message);
    return "ok";
  });

  function handleLeaveRoom(): void {
    if(!currentRoom || !username) return;

    roomManager.leaveRoom(socket.id, currentRoom, username);
    socket.to(currentRoom).emit("system-message", `${username} left the room`);
    socket.leave(currentRoom);

    currentRoom = null;
    username = null;
  }

  socket.on("leave-room", handleLeaveRoom);

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
    handleLeaveRoom();
  });
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
