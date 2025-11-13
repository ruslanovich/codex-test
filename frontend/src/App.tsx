import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskBoard } from './components/TaskBoard.js';
import { TaskFilters, type TaskFilterState } from './components/TaskFilters.js';
import { useTasks } from './hooks/useTasks.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { AddTaskDialog, type AddTaskDialogValues } from './components/AddTaskDialog.js';
import { createTask, deleteTask, updateTask } from './api/tasks.js';
import { readStoredTheme } from './utils/themePreference.js';
import type { CreateTaskInput, Task, UpdateTaskInput } from './types.js';
import './styles/theme.css';

const DEFAULT_FILTERS: TaskFilterState = {
  status: 'ALL',
  search: '',
  priority: 'ALL',
  theme: 'light',
};

const mapTaskToDialogValues = (task: Task): AddTaskDialogValues => ({
  title: task.title,
  description: task.description ?? '',
  status: task.status,
  priority: task.priority,
  assignee: task.assignee ?? '',
  dueDate: task.dueDate ?? '',
  tags: [...task.tags],
});

const createTaskPayload = (values: AddTaskDialogValues): CreateTaskInput => {
  const trimmedTitle = values.title.trim();
  const trimmedDescription = values.description.trim();
  const trimmedAssignee = values.assignee.trim();

  return {
    title: trimmedTitle,
    description: trimmedDescription ? trimmedDescription : undefined,
    status: values.status,
    priority: values.priority,
    assignee: trimmedAssignee ? trimmedAssignee : undefined,
    dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
    tags: values.tags,
  };
};

const updateTaskPayload = (values: AddTaskDialogValues): UpdateTaskInput => {
  const trimmedTitle = values.title.trim();
  const trimmedDescription = values.description.trim();
  const trimmedAssignee = values.assignee.trim();

  return {
    title: trimmedTitle,
    description: trimmedDescription ? trimmedDescription : null,
    status: values.status,
    priority: values.priority,
    assignee: trimmedAssignee ? trimmedAssignee : null,
    dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
    tags: values.tags,
  };
};

export default function App() {
  const [filters, setFilters] = useState<TaskFilterState>(DEFAULT_FILTERS);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const tasksQuery = useTasks(filters);

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => {
      setErrorMessage('Failed to create task. Please try again.');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => {
      setErrorMessage('Failed to delete task. Please try again.');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => updateTask(id, input),
    onSuccess: () => {
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => {
      setErrorMessage('Failed to update task. Please try again.');
    },
  });

  useEffect(() => {
    const stored = readStoredTheme();
    if (stored) {
      setFilters((prev) => ({ ...prev, theme: stored }));
    }
  }, []);

  const handleOpenAddTask = () => {
    setErrorMessage(null);
    setIsAddTaskOpen(true);
  };

  const handleCloseAddTask = () => {
    setIsAddTaskOpen(false);
  };

  const handleOpenEditTask = (task: Task) => {
    setErrorMessage(null);
    setEditingTask(task);
  };

  const handleCloseEditTask = () => {
    setEditingTask(null);
  };

  const handleAddTaskSubmit = (values: AddTaskDialogValues) => {
    const payload = createTaskPayload(values);

    setErrorMessage(null);
    createTaskMutation.mutate(payload, {
      onSuccess: () => {
        handleCloseAddTask();
      },
      onError: () => {
        setErrorMessage('Failed to create task. Please try again.');
        setIsAddTaskOpen(true);
      },
    });
  };

  const handleEditTaskSubmit = (values: AddTaskDialogValues) => {
    if (!editingTask) {
      return;
    }

    const currentTask = editingTask;
    const payload = updateTaskPayload(values);

    setErrorMessage(null);
    updateTaskMutation.mutate(
      { id: currentTask.id, input: payload },
      {
        onSuccess: () => {
          handleCloseEditTask();
        },
        onError: () => {
          setErrorMessage('Failed to update task. Please try again.');
          setEditingTask(currentTask);
        },
      },
    );
  };

  const handleDeleteTask = (id: string) => {
    setErrorMessage(null);
    deleteTaskMutation.mutate(id);
  };

  const addTaskSubmitLabel = useMemo(
    () => (createTaskMutation.isPending ? 'Adding…' : 'Add task'),
    [createTaskMutation.isPending],
  );

  const editTaskSubmitLabel = useMemo(
    () => (updateTaskMutation.isPending ? 'Saving…' : 'Save changes'),
    [updateTaskMutation.isPending],
  );

  const editDialogInitialValues = useMemo(
    () => (editingTask ? mapTaskToDialogValues(editingTask) : undefined),
    [editingTask],
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
        {errorMessage ? (
          <div className="app__error" role="alert">
            {errorMessage}
          </div>
        ) : null}
        <TaskFilters filters={filters} onChange={setFilters} />
        <TaskBoard
          tasks={tasksQuery.data ?? []}
          isLoading={tasksQuery.isLoading}
          onDelete={handleDeleteTask}
          onEdit={handleOpenEditTask}
          isDeleting={deleteTaskMutation.isPending}
          deletingTaskId={deleteTaskMutation.variables ?? null}
        />
      </main>
      <AddTaskDialog
        open={isAddTaskOpen}
        onClose={handleCloseAddTask}
        onSubmit={handleAddTaskSubmit}
        submitLabel={addTaskSubmitLabel}
      />
      {editingTask ? (
        <AddTaskDialog
          open={Boolean(editingTask)}
          onClose={handleCloseEditTask}
          onSubmit={handleEditTaskSubmit}
          initialValues={editDialogInitialValues}
          submitLabel={editTaskSubmitLabel}
          title="Edit Task"
        />
      ) : null}
    </div>
  );
}
