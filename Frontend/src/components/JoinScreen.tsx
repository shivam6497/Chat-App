import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface JoinScreenProps {
  onCreateRoom: (name: string) => void;
  onJoinRoom: (name: string, roomCode: string) => void;
  connectionError?: string | null;
}

export default function JoinScreen({ onCreateRoom, onJoinRoom, connectionError }: JoinScreenProps) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  function handleCreateRoom() {
    if (!name.trim()) {
      setError('Enter your name first.');
      return;
    }
    setError('');
    onCreateRoom(name.trim());
  }

  function handleJoinRoom() {
    if (!name.trim()) {
      setError('Enter your name first.');
      return;
    }
    if (!roomCode.trim()) {
      setError('Enter a room code to join.');
      return;
    }
    setError('');
    onJoinRoom(name.trim(), roomCode.trim());
  }

  const inputStyle = {
    backgroundColor: 'var(--bg-field)',
    borderColor: 'var(--border-field)',
    color: 'var(--text-primary)',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: 'var(--bg-app)' }}
    >
      <ThemeToggle />

      <div
        className="w-full max-w-[600px] rounded-xl p-5 sm:p-8 border"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle size={22} style={{ color: 'var(--text-primary)' }} strokeWidth={2} />
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Real Time Chat
          </h1>
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          temporary room that expires after all users exit
        </p>

        <button
          type="button"
          onClick={handleCreateRoom}
          className="w-full font-semibold rounded-md py-3 mb-4 transition-colors"
          style={{ backgroundColor: 'var(--btn-bg)', color: 'var(--btn-text)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-bg)')}
        >
          Create New Room
        </button>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full rounded-md px-4 py-3 mb-4 outline-none border transition-colors"
          style={inputStyle}
        />

        {/* On mobile: stacked vertically. On sm+: side by side */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Enter Room Code"
            onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
            className="flex-1 rounded-md px-4 py-3 outline-none border transition-colors"
            style={inputStyle}
          />
          <button
            type="button"
            onClick={handleJoinRoom}
            className="font-semibold rounded-md px-6 py-3 transition-colors whitespace-nowrap sm:w-auto w-full"
            style={{ backgroundColor: 'var(--btn-bg)', color: 'var(--btn-text)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-bg)')}
          >
            Join Room
          </button>
        </div>

        {(error || connectionError) && (
          <p className="text-sm text-red-400 mt-4" role="alert">
            {error || connectionError}
          </p>
        )}
      </div>
    </div>
  );
}