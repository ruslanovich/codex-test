import { useEffect, useMemo, useState } from 'react';
import { TaskBoard } from './components/TaskBoard.js';
import { TaskFilters, type TaskFilterState } from './components/TaskFilters.js';
import { useTasks } from './hooks/useTasks.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { AddTaskDialog } from './components/AddTaskDialog.js';
import { useCreateTask } from './hooks/useCreateTask.js';
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
  const createTaskMutation = useCreateTask();
  const [isAddTaskOpen, setAddTaskOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('task-board-theme');
    if (stored === 'light' || stored === 'dark') {
      setFilters((prev) => ({ ...prev, theme: stored }));
    }
  }, []);

  useEffect(() => {
    if (!confirmation) {
      return;
    }
    const timeout = window.setTimeout(() => setConfirmation(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [confirmation]);

  const mutationError = useMemo(() => {
    if (!createTaskMutation.isError) {
      return null;
    }
    const error = createTaskMutation.error;
    return error instanceof Error ? error.message : 'Failed to create task';
  }, [createTaskMutation.error, createTaskMutation.isError]);

  const handleDialogClose = () => {
    setAddTaskOpen(false);
    createTaskMutation.reset();
  };

  const handleTaskCreated = () => {
    setConfirmation('Task created successfully.');
    setAddTaskOpen(false);
  };

  return (
    <div className="app" data-theme={filters.theme ?? 'light'}>
      <header className="app__header">
        <div>
          <h1>Codex Task Board</h1>
          <p className="app__subtitle">Track work across Todo, In Progress, and Done lanes.</p>
        </div>
        <div className="app__actions">
          <ThemeToggle value={filters.theme ?? 'light'} onChange={(theme) => setFilters((prev) => ({ ...prev, theme }))} />
          <button type="button" className="app__add-task-button" onClick={() => setAddTaskOpen(true)}>
            Add task
          </button>
        </div>
      </header>
      {confirmation ? <div className="app__alert">{confirmation}</div> : null}
      <main>
        <TaskFilters filters={filters} onChange={setFilters} />
        <TaskBoard tasks={tasksQuery.data ?? []} isLoading={tasksQuery.isLoading} />
      </main>
      <AddTaskDialog
        isOpen={isAddTaskOpen}
        onClose={handleDialogClose}
        onCreate={createTaskMutation.mutateAsync}
        isSubmitting={createTaskMutation.isPending}
        mutationError={mutationError}
        onSuccess={handleTaskCreated}
      />
    </div>
  );
}
