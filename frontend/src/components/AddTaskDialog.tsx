import type { ChangeEvent, FormEvent } from 'react';
import { useId, useMemo, useState } from 'react';
import './AddTaskDialog.css';
import type { TaskPriority, TaskStatus } from '../types.js';

export interface AddTaskDialogValues {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  tags: string[];
}

export interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AddTaskDialogValues) => void;
  initialValues?: Partial<AddTaskDialogValues>;
  submitLabel?: string;
}

const DEFAULT_VALUES: AddTaskDialogValues = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  assignee: '',
  dueDate: '',
  tags: [],
};

const parseTags = (value: string): string[] =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

export function AddTaskDialog({
  open,
  onClose,
  onSubmit,
  initialValues,
  submitLabel = 'Add task',
}: AddTaskDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const assigneeId = useId();
  const priorityId = useId();
  const statusId = useId();
  const dueDateId = useId();
  const tagsId = useId();

  const resolvedInitialValues = useMemo<AddTaskDialogValues>(
    () => ({
      ...DEFAULT_VALUES,
      ...initialValues,
      tags: [...(initialValues?.tags ?? DEFAULT_VALUES.tags)],
    }),
    [initialValues],
  );

  const [formValues, setFormValues] = useState<AddTaskDialogValues>(
    resolvedInitialValues,
  );
  const [tagsInput, setTagsInput] = useState<string>(() =>
    resolvedInitialValues.tags.join(', '),
  );

  const handleChange = <Field extends keyof AddTaskDialogValues>(
    field: Field,
  ) =>
    (
      event:
        | ChangeEvent<HTMLInputElement>
        | ChangeEvent<HTMLTextAreaElement>
        | ChangeEvent<HTMLSelectElement>,
    ) => {
      const value = event.target.value;
      setFormValues((current) => ({
        ...current,
        [field]: value,
      }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = formValues.title.trim();
    if (!trimmedTitle) {
      setFormValues((current) => ({
        ...current,
        title: trimmedTitle,
      }));
      return;
    }

    const submission: AddTaskDialogValues = {
      ...formValues,
      title: trimmedTitle,
      tags: parseTags(tagsInput),
    };

    onSubmit(submission);
    onClose();
  };

  const priorityOptions = useMemo<readonly TaskPriority[]>(
    () => ['LOW', 'MEDIUM', 'HIGH'],
    [],
  );
  const statusOptions = useMemo<readonly TaskStatus[]>(
    () => ['TODO', 'IN_PROGRESS', 'DONE'],
    [],
  );

  if (!open) {
    return null;
  }

  return (
    <div className="add-task-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="add-task-dialog__content">
        <h2 id={titleId}>Add Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="add-task-dialog__field">
            <label htmlFor={`${titleId}-input`}>Title</label>
            <input
              id={`${titleId}-input`}
              type="text"
              value={formValues.title}
              onChange={handleChange('title')}
              required
            />
          </div>

          <div className="add-task-dialog__field">
            <label htmlFor={descriptionId}>Description</label>
            <textarea
              id={descriptionId}
              value={formValues.description}
              onChange={handleChange('description')}
              rows={3}
            />
          </div>

          <div className="add-task-dialog__field">
            <label htmlFor={assigneeId}>Assignee</label>
            <input
              id={assigneeId}
              type="text"
              value={formValues.assignee}
              onChange={handleChange('assignee')}
            />
          </div>

          <div className="add-task-dialog__grid">
            <div className="add-task-dialog__field">
              <label htmlFor={statusId}>Status</label>
              <select
                id={statusId}
                value={formValues.status}
                onChange={handleChange('status')}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="add-task-dialog__field">
              <label htmlFor={priorityId}>Priority</label>
              <select
                id={priorityId}
                value={formValues.priority}
                onChange={handleChange('priority')}
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="add-task-dialog__field">
            <label htmlFor={dueDateId}>Due date</label>
            <input
              id={dueDateId}
              type="date"
              value={formValues.dueDate}
              onChange={handleChange('dueDate')}
            />
          </div>

          <div className="add-task-dialog__field">
            <label htmlFor={tagsId}>Tags</label>
            <input
              id={tagsId}
              type="text"
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="design, backend"
            />
          </div>

          <div className="add-task-dialog__actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
