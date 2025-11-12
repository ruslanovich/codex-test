import { useEffect, useState } from 'react';
import { TaskBoard } from './components/TaskBoard.js';
import { TaskFilters, type TaskFilterState } from './components/TaskFilters.js';
import { useTasks } from './hooks/useTasks.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import './styles/theme.css';

const DEFAULT_FILTERS: TaskFilterState = {
  status: 'ALL',
  search: '',
  priority: 'ALL',
  theme: 'light',
};

export default function App() {
  const [filters, setFilters] = useState<TaskFilterState>(DEFAULT_FILTERS);
  const tasksQuery = useTasks(filters);

  useEffect(() => {
    const stored = localStorage.getItem('task-board-theme');
    if (stored === 'light' || stored === 'dark') {
      setFilters((prev) => ({ ...prev, theme: stored }));
    }
  }, []);

  return (
    <div className="app" data-theme={filters.theme ?? 'light'}>
      <header className="app__header">
        <div>
          <h1>Codex Task Board</h1>
          <p className="app__subtitle">Track work across Todo, In Progress, and Done lanes.</p>
        </div>
        <ThemeToggle value={filters.theme ?? 'light'} onChange={(theme) => setFilters((prev) => ({ ...prev, theme }))} />
      </header>
      <main>
        <TaskFilters filters={filters} onChange={setFilters} />
        <TaskBoard tasks={tasksQuery.data ?? []} isLoading={tasksQuery.isLoading} />
      </main>
    </div>
  );
}
