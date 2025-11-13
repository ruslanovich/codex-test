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
  isDeleting?: boolean;
}

export function TaskCard({ task, onDelete, isDeleting }: TaskCardProps) {
  const handleDelete = () => {
    onDelete(task.id);
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
            className="task-card__delete"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
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
