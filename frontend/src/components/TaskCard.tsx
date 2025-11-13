import type { Task } from '../types.js';
import './TaskCard.css';

function getInitials(name?: string) {
  if (!name) return '??';
  const [first = '', second = ''] = name.split(' ');
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}

interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  isDeleting?: boolean;
}

export function TaskCard({ task, onDelete, onEdit, isDeleting }: TaskCardProps) {
  const handleDelete = () => {
    if (isDeleting) return;

    const confirmed = window.confirm(`Are you sure you want to delete "${task.title}"?`);
    if (!confirmed) return;

    onDelete(task.id);
  };

  const handleEdit = () => {
    onEdit(task);
  };

  return (
    <article className="task-card" aria-label={`Task ${task.title}`}>
      <header className="task-card__header">
        <span className={`task-card__priority task-card__priority--${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
        <div className="task-card__header-actions">
          <button
            type="button"
            className="task-card__action task-card__action--primary"
            onClick={handleEdit}
            aria-label={`Edit task "${task.title}"`}
            title={`Edit task "${task.title}"`}
          >
            Edit
          </button>
          <button
            type="button"
            className="task-card__action task-card__action--danger"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label={`Delete task "${task.title}"`}
            title={`Delete task "${task.title}"`}
          >
            {isDeleting ? (
              <>
                <span className="task-card__spinner" aria-hidden="true" />
                <span className="task-card__delete-text">Deleting…</span>
              </>
            ) : (
              <span className="task-card__delete-text">Delete</span>
            )}
          </button>
          <span className="task-card__assignee" title={task.assignee ?? 'Unassigned'}>
            {getInitials(task.assignee)}
          </span>
        </div>
      </header>
      <h3 className="task-card__title">{task.title}</h3>
      {task.dueDate ? (
        <p className="task-card__due">Due {new Date(task.dueDate).toLocaleDateString()}</p>
      ) : null}
      {task.tags.length > 0 ? (
        <ul className="task-card__tags">
          {task.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
