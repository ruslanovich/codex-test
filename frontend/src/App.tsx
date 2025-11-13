import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskBoard } from './components/TaskBoard.js';
import { TaskFilters, type TaskFilterState } from './components/TaskFilters.js';
import { useTasks } from './hooks/useTasks.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { AddTaskDialog, type AddTaskDialogValues } from './components/AddTaskDialog.js';
import { createTask } from './api/tasks.js';
import type { CreateTaskInput } from './types.js';
import './styles/theme.css';

const DEFAULT_FILTERS: TaskFilterState = {
  status: 'ALL',
  search: '',
  priority: 'ALL',
  theme: 'light',
};

export default function App() {
  const [filters, setFilters] = useState<TaskFilterState>(DEFAULT_FILTERS);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const tasksQuery = useTasks(filters);

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      setCreationError(null);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => {
      setCreationError('Failed to create task. Please try again.');
    },
  });

  useEffect(() => {
    const stored = localStorage.getItem('task-board-theme');
    if (stored === 'light' || stored === 'dark') {
      setFilters((prev) => ({ ...prev, theme: stored }));
    }
  }, []);

  const handleOpenAddTask = () => {
    setCreationError(null);
    setIsAddTaskOpen(true);
  };

  const handleCloseAddTask = () => {
    setIsAddTaskOpen(false);
  };

  const handleAddTaskSubmit = (values: AddTaskDialogValues) => {
    const payload: CreateTaskInput = {
      title: values.title,
      description: values.description?.trim() ? values.description.trim() : undefined,
      status: values.status,
      priority: values.priority,
      assignee: values.assignee?.trim() ? values.assignee.trim() : undefined,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
      tags: values.tags,
    };

    setCreationError(null);
    createTaskMutation.mutate(payload, {
      onSuccess: () => {
        handleCloseAddTask();
      },
      onError: () => {
        setCreationError('Failed to create task. Please try again.');
        setIsAddTaskOpen(true);
      },
    });
  };

  const addTaskSubmitLabel = useMemo(
    () => (createTaskMutation.isPending ? 'Adding…' : 'Add task'),
    [createTaskMutation.isPending],
  );

  return (
    <div className="app" data-theme={filters.theme ?? 'light'}>
      <header className="app__header">
        <div>
          <h1>Codex Task Board</h1>
          <p className="app__subtitle">Track work across Todo, In Progress, and Done lanes.</p>
        </div>
        <div className="app__actions">
          <button type="button" className="app__add-task" onClick={handleOpenAddTask}>
            Add task
          </button>
          <ThemeToggle
            value={filters.theme ?? 'light'}
            onChange={(theme) => setFilters((prev) => ({ ...prev, theme }))}
          />
        </div>
      </header>
      <main>
        {creationError ? (
          <div className="app__error" role="alert">
            {creationError}
          </div>
        ) : null}
        <TaskFilters filters={filters} onChange={setFilters} />
        <TaskBoard tasks={tasksQuery.data ?? []} isLoading={tasksQuery.isLoading} />
      </main>
      <AddTaskDialog
        open={isAddTaskOpen}
        onClose={handleCloseAddTask}
        onSubmit={handleAddTaskSubmit}
        submitLabel={addTaskSubmitLabel}
      />
    </div>
  );
}
