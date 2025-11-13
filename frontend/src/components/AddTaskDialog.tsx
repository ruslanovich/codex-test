import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { CreateTaskPayload } from '../api/tasks.js';
import type { TaskPriority, TaskStatus } from '../types.js';
import './AddTaskDialog.css';

interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
}

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: CreateTaskPayload) => Promise<unknown>;
  isSubmitting?: boolean;
  mutationError?: string | null;
  onSuccess?: () => void;
}

const createDefaultForm = (): FormState => ({
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
});

export function AddTaskDialog({
  isOpen,
  onClose,
  onCreate,
  isSubmitting = false,
  mutationError,
  onSuccess,
}: AddTaskDialogProps) {
  const [formState, setFormState] = useState<FormState>(() => createDefaultForm());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const wasOpenRef = useRef(isOpen);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setFormState(createDefaultForm());
      setErrorMessage(null);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (mutationError) {
      setErrorMessage(mutationError);
    }
  }, [mutationError]);

  const isCreateDisabled = isSubmitting;

  if (!isOpen) {
    return null;
  }

  const handleChange =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setFormState((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.title.trim()) {
      setErrorMessage('Title is required');
      return;
    }
    if (!formState.description.trim()) {
      setErrorMessage('Description is required');
      return;
    }

    setErrorMessage(null);

    try {
      await onCreate({
        title: formState.title.trim(),
        description: formState.description.trim(),
        status: formState.status,
        priority: formState.priority,
      });
      if (!onSuccess) {
        setFormState(createDefaultForm());
      }
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create task';
      setErrorMessage(message);
    }
  };

  return (
    <div className="add-task-dialog__backdrop" role="dialog" aria-modal="true" aria-labelledby="add-task-dialog-title">
      <div className="add-task-dialog">
        <header className="add-task-dialog__header">
          <h2 id="add-task-dialog-title">Add new task</h2>
          <button type="button" className="add-task-dialog__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <form className="add-task-dialog__form" onSubmit={handleSubmit} noValidate>
          <label className="add-task-dialog__field">
            <span>Title</span>
            <input
              id="add-task-title"
              name="title"
              type="text"
              value={formState.title}
              onChange={handleChange('title')}
              placeholder="Enter task title"
            />
          </label>
          <label className="add-task-dialog__field">
            <span>Description</span>
            <textarea
              id="add-task-description"
              name="description"
              value={formState.description}
              onChange={handleChange('description')}
              placeholder="Describe the task"
              rows={4}
            />
          </label>
          <div className="add-task-dialog__row">
            <label className="add-task-dialog__field">
              <span>Status</span>
              <select name="status" value={formState.status} onChange={handleChange('status')}>
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="DONE">Done</option>
              </select>
            </label>
            <label className="add-task-dialog__field">
              <span>Priority</span>
              <select name="priority" value={formState.priority} onChange={handleChange('priority')}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </label>
          </div>
          {errorMessage ? <p className="add-task-dialog__error" role="alert">{errorMessage}</p> : null}
          <div className="add-task-dialog__actions">
            <button type="button" className="add-task-dialog__button add-task-dialog__button--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="add-task-dialog__button add-task-dialog__button--primary" disabled={isCreateDisabled}>
              {isSubmitting ? 'Creating…' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
