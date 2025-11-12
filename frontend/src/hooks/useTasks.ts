import { useQuery } from '@tanstack/react-query';
import { fetchTasks } from '../api/tasks.js';
import type { TaskFilterState } from '../components/TaskFilters.js';

export function useTasks(filters: TaskFilterState) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
  });
}
