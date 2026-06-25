import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });
interface User {
    socket: WebSocket,
    room: string
}

let allSockets: User[] = [];

wss.on("connection", (socket) => {
    
    socket.on("message", (message) => {
        const parsedMessage = JSON.parse(message as unknown as string);

        if(parsedMessage.type === "join") {
            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId
            })
        }

        if(parsedMessage.type === "chat") {
            const currentUserRoom = allSockets.find(user => user.socket === socket)?.room;
            if (currentUserRoom === undefined) return;

            for(let i = 0;i < allSockets.length;i++) {
                if(allSockets[i]?.room === currentUserRoom) {
                    allSockets[i]?.socket.send(parsedMessage.payload.message);
                }
            }
        }
    })
})