import './ThemeToggle.css';

interface ThemeToggleProps {
  value: 'light' | 'dark';
  onChange: (value: 'light' | 'dark') => void;
}

export function ThemeToggle({ value, onChange }: ThemeToggleProps) {
  const toggle = () => {
    const next = value === 'light' ? 'dark' : 'light';
    onChange(next);
    localStorage.setItem('task-board-theme', next);
  };

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
      {value === 'light' ? '🌞' : '🌙'}
    </button>
  );
}
