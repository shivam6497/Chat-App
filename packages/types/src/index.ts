// Domain Models

export interface ChatMessage {
    user: string;
    text: string;
    ts: number;
}

// client -> server

export interface JoinRoomPayload {
    roomId: string;
    name: string;
}

export interface ClientToServerEvent {
    'join-room': (payload: JoinRoomPayload) => void;
    'leave-room': () => void;
    'chat-message': (text: string) => string;
}

// server -> client

export interface ServerToClientEvent {
    'room-history': (message: ChatMessage) => void;
    'user-list': (user: string[]) => void;
    'chat-message': (message: ChatMessage) => void;
    'system-message': (text: string) => void;
    'error-message': (text: string) => void;
}

// internal server side room state

export interface RoomState {
    users: Map<string, string>;
    messages: ChatMessage[];
    emptyTimer: ReturnType<typeof setTimeout> | null;
}
