import type { CreateTaskInput, Task, UpdateTaskInput } from '../types.js';
import type { TaskFilterState } from '../components/TaskFilters.js';

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

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to create task');
  }

  return response.json();
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });

  if (response.status !== 204) {
    throw new Error('Failed to delete task');
  }
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to update task');
  }

  return response.json();
}
