import { io, Socket } from "socket.io-client";
import type { ClientToServerEvent, ServerToClientEvent } from "@chat-app/types";

const SERVER_URL = "https://chat-app-w182.onrender.com";

export const socket: Socket<ServerToClientEvent, ClientToServerEvent> = io(
  SERVER_URL,
  {
    autoConnect: true,
  },
);
