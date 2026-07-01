import { useCallback, useEffect, useRef, useState } from 'react';
import JoinScreen from './components/JoinScreen';
import ChatRoom from './components/ChatRoom';
import { socket } from './socket';
import type { ChatMessage } from './types';
import { ThemeProvider } from './ThemeContext';

type Screen = 'join' | 'chat';

function generateRoomCode(): string {
  // Short, human-typeable code: 6 uppercase alphanumeric chars.
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function AppInner() {
  const [screen, setScreen] = useState<Screen>('join');
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [systemMessages, setSystemMessages] = useState<string[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Track the room/name we're attempting to join so error-message handling
  // (which fires before we know if it succeeded) can decide whether to
  // bounce back to the join screen.
  const pendingJoinRef = useRef<{ roomId: string; name: string } | null>(null);

  useEffect(() => {
    function handleRoomHistory(history: ChatMessage[]) {
      setMessages(history);
      // A successful room-history means the join actually went through.
      if (pendingJoinRef.current) {
        setScreen('chat');
        pendingJoinRef.current = null;
      }
    }

    function handleUserList(list: string[]) {
      setUsers(list);
    }

    function handleChatMessage(message: ChatMessage) {
      setMessages((prev) => [...prev, message]);
    }

    function handleSystemMessage(text: string) {
      setSystemMessages((prev) => [...prev, text]);
    }

    function handleErrorMessage(text: string) {
      setConnectionError(text);
      pendingJoinRef.current = null;
    }

    function handleConnectError() {
      setConnectionError('Could not reach the server. Is the backend running on port 8080?');
    }

    socket.on('room-history', handleRoomHistory as unknown as (message: ChatMessage) => void);
    socket.on('user-list', handleUserList);
    socket.on('chat-message', handleChatMessage);
    socket.on('system-message', handleSystemMessage);
    socket.on('error-message', handleErrorMessage);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('room-history', handleRoomHistory as unknown as (message: ChatMessage) => void);
      socket.off('user-list', handleUserList);
      socket.off('chat-message', handleChatMessage);
      socket.off('system-message', handleSystemMessage);
      socket.off('error-message', handleErrorMessage);
      socket.off('connect_error', handleConnectError);
    };
  }, []);

  const joinRoom = useCallback((name: string, code: string) => {
    setConnectionError(null);
    setMessages([]);
    setUsers([]);
    setSystemMessages([]);
    pendingJoinRef.current = { roomId: code, name };
    setUsername(name);
    setRoomId(code);
    socket.emit('join-room', { roomId: code, name });
  }, []);

  function handleCreateRoom(name: string) {
    const code = generateRoomCode();
    joinRoom(name, code);
  }

  function handleJoinRoom(name: string, code: string) {
    joinRoom(name, code.toUpperCase());
  }

  function handleSendMessage(text: string) {
    socket.emit('chat-message', text);
  }

  function handleLeaveRoom() {
    socket.emit('leave-room');
    setScreen('join');
    setRoomId('');
    setUsername('');
    setMessages([]);
    setUsers([]);
    setSystemMessages([]);
  }

  if (screen === 'chat') {
    return (
      <ChatRoom
        roomId={roomId}
        username={username}
        messages={messages}
        users={users}
        systemMessages={systemMessages}
        onSendMessage={handleSendMessage}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  return (
    <JoinScreen
      onCreateRoom={handleCreateRoom}
      onJoinRoom={handleJoinRoom}
      connectionError={connectionError}
    />
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

export default App;
