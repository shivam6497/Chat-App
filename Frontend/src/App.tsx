import { useCallback, useEffect, useRef, useState } from 'react';
import JoinScreen from './components/JoinScreen';
import ChatRoom from './components/ChatRoom';
import { socket } from './socket';
import type { ChatMessage, FeedItem } from './types';
import { ThemeProvider } from './ThemeContext';

type Screen = 'join' | 'chat';

function generateRoomCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function AppInner() {
  const [screen, setScreen] = useState<Screen>('join');
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [feed, setFeed] = useState<FeedItem[]>([]);      
  const [users, setUsers] = useState<string[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const pendingJoinRef = useRef<{ roomId: string; name: string } | null>(null);

  useEffect(() => {
    function handleRoomHistory(history: ChatMessage[]) {
      // Seed the feed with history, all as 'message' items.
      setFeed(history.map((data) => ({ kind: 'message', data })));
      if (pendingJoinRef.current) {
        setScreen('chat');
        pendingJoinRef.current = null;
      }
    }

    function handleUserList(list: string[]) {
      setUsers(list);
    }

    function handleChatMessage(message: ChatMessage) {
      setFeed((prev) => [...prev, { kind: 'message', data: message }]);
    }

    function handleSystemMessage(text: string) {
      // Timestamp system messages client-side so they sort correctly in the feed.
      setFeed((prev) => [...prev, { kind: 'system', text, ts: Date.now() }]);
    }

    function handleErrorMessage(text: string) {
      setConnectionError(text);
      pendingJoinRef.current = null;
    }

    function handleConnectError() {
      setConnectionError('Could not reach the server.');
    }

    socket.on('room-history', handleRoomHistory as unknown as (message: ChatMessage) => void);
    socket.on('user-list', handleUserList);
    socket.on('chat-message', handleChatMessage);
    socket.on('system-message', handleSystemMessage);
    socket.on('error-message', handleErrorMessage as unknown as (text: string) => void);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('room-history', handleRoomHistory as unknown as (message: ChatMessage) => void);
      socket.off('user-list', handleUserList);
      socket.off('chat-message', handleChatMessage);
      socket.off('system-message', handleSystemMessage);
      socket.off('error-message', handleErrorMessage as unknown as (text: string) => void);
      socket.off('connect_error', handleConnectError);
    };
  }, []);

  const joinRoom = useCallback((name: string, code: string) => {
    setConnectionError(null);
    setFeed([]);
    setUsers([]);
    pendingJoinRef.current = { roomId: code, name };
    setUsername(name);
    setRoomId(code);
    socket.emit('join-room', { roomId: code, name });
  }, []);

  function handleCreateRoom(name: string) {
    joinRoom(name, generateRoomCode());
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
    setFeed([]);
    setUsers([]);
  }

  if (screen === 'chat') {
    return (
      <ChatRoom
        roomId={roomId}
        username={username}
        feed={feed}
        users={users}
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