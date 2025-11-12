import { ChangeEvent } from 'react';
import './TaskFilters.css';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'ALL', label: 'Any priority' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
] as const;

export interface TaskFilterState {
  status: (typeof STATUS_OPTIONS)[number]['value'];
  priority?: (typeof PRIORITY_OPTIONS)[number]['value'];
  search: string;
  theme?: 'light' | 'dark';
}

interface TaskFiltersProps {
  filters: TaskFilterState;
  onChange: (filters: TaskFilterState) => void;
}

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const update = (patch: Partial<TaskFilterState>) => {
    onChange({ ...filters, ...patch });
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    update({ status: event.target.value as TaskFilterState['status'] });
  };

  const handlePriorityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    update({ priority: event.target.value as TaskFilterState['priority'] });
  };

  return (
    <section className="task-filters" aria-label="Task filters">
      <input
        className="task-filters__search"
        type="search"
        placeholder="Search tasks"
        value={filters.search}
        onChange={(event) => update({ search: event.target.value })}
      />
      <select value={filters.status} onChange={handleStatusChange}>
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select value={filters.priority ?? 'ALL'} onChange={handlePriorityChange}>
        {PRIORITY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </section>
  );
}
