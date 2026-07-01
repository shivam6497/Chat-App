import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function ThemeToggleInline() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="w-8 h-8 flex items-center justify-center rounded-md border transition-colors shrink-0"
      style={{
        borderColor: 'var(--border-field)',
        color: 'var(--text-primary)',
        backgroundColor: 'var(--bg-field)',
      }}
    >
      {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
    </button>
  );
}
