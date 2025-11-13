import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { useCreateTask } from './useCreateTask.js';
import type { Task } from '../types.js';
import * as tasksApi from '../api/tasks.js';

const createTaskMock = vi.spyOn(tasksApi, 'createTask');

describe('useCreateTask', () => {
  beforeEach(() => {
    createTaskMock.mockReset();
  });

  it('invalidates the tasks query after a successful mutation', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const task: Task = {
      id: '123',
      title: 'Mock task',
      description: 'Example description',
      status: 'TODO',
      priority: 'MEDIUM',
      assignee: undefined,
      dueDate: undefined,
      tags: [],
      order: 0,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createTaskMock.mockResolvedValue(task);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCreateTask(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ title: 'Mock task' });
    });

    await waitFor(() => {
      expect(createTaskMock).toHaveBeenCalledWith({ title: 'Mock task' });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['tasks'] });
    });

    invalidateSpy.mockRestore();
    queryClient.clear();
  });
});
