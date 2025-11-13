import type { Task } from '../types.js';
import { TaskColumn } from './TaskColumn.js';
import './TaskBoard.css';

export interface TaskBoardProps {
  tasks: Task[];
  isLoading?: boolean;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  isDeleting?: boolean;
  deletingTaskId?: string | null;
}

const STATUSES = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' },
] as const;

type Status = (typeof STATUSES)[number]['id'];

export function TaskBoard({
  tasks,
  isLoading,
  onDelete,
  onEdit,
  isDeleting,
  deletingTaskId,
}: TaskBoardProps) {
  return (
    <section className="task-board">
      {STATUSES.map((column) => (
        <TaskColumn
          key={column.id}
          status={column.title}
          tasks={tasks.filter((task) => task.status === (column.id as Status))}
          isLoading={isLoading}
          onDelete={onDelete}
          onEdit={onEdit}
          isDeleting={isDeleting}
          deletingTaskId={deletingTaskId}
        />
      ))}
    </section>
  );
}
