import type { Task } from '../types.js';
import { TaskCard } from './TaskCard.js';
import './TaskColumn.css';

interface TaskColumnProps {
  status: string;
  tasks: Task[];
  isLoading?: boolean;
  onDelete: (taskId: string) => void;
  isDeleting?: boolean;
  deletingTaskId?: string | null;
}

export function TaskColumn({ status, tasks, isLoading, onDelete, isDeleting, deletingTaskId }: TaskColumnProps) {
  return (
    <article className="task-column">
      <header className="task-column__header">
        <h2>{status}</h2>
        <span className="task-column__count">{tasks.length}</span>
      </header>
      {isLoading ? (
        <div className="task-column__empty">Loading tasks…</div>
      ) : tasks.length === 0 ? (
        <div className="task-column__empty">No tasks yet.</div>
      ) : (
        <ul className="task-column__list">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                onDelete={onDelete}
                isDeleting={isDeleting && deletingTaskId === task.id}
              />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
