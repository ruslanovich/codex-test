import type { Task } from '../types.js';
import type { TaskFilterState } from '../components/TaskFilters.js';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assignee?: Task['assignee'];
  dueDate?: Task['dueDate'];
  tags?: Task['tags'];
  archived?: Task['archived'];
}

export async function fetchTasks(filters: TaskFilterState): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'ALL') {
    params.append('status', filters.status);
  }
  if (filters.priority && filters.priority !== 'ALL') {
    params.append('priority', filters.priority);
  }
  if (filters.search) {
    params.append('search', filters.search);
  }

  const query = params.toString();
  const response = await fetch(query ? `/api/tasks?${query}` : '/api/tasks');
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const body = JSON.stringify(
    Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    ),
  );

  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    throw new Error('Failed to create task');
  }

  return response.json();
}
