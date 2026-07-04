import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="fixed top-6 right-6 w-9 h-9 flex items-center justify-center rounded-md border transition-colors cursor-pointer"
      style={{
        borderColor: 'var(--border-card)',
        color: 'var(--text-primary)',
        backgroundColor: 'var(--bg-card)',
      }}
    >
      {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
