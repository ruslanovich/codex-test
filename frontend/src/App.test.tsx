import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import App from './App.js';
import { setupUser } from './test/setupUser.js';

const createJsonResponse = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers ?? {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    statusText: init.statusText,
    headers,
  });
};

const exampleTask = {
  id: 'task-1',
  title: 'Launch plan',
  description: 'Kick-off planning',
  status: 'TODO' as const,
  priority: 'MEDIUM' as const,
  assignee: 'Taylor Doe',
  dueDate: new Date('2024-01-01T00:00:00.000Z').toISOString(),
  tags: ['planning'],
  order: 0,
  archived: false,
  createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
  updatedAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const user = setupUser();
  const renderResult = render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );

  return { user, ...renderResult };
};

describe('App', () => {
  let fetchMock: MockInstance<
    [input: RequestInfo | URL, init?: RequestInit | undefined],
    Promise<Response>
  >;

  beforeEach(() => {
    fetchMock = vi
      .spyOn(global, 'fetch')
      .mockImplementation((input) =>
        Promise.reject(new Error(`Unhandled fetch call: ${String(input)}`)),
      );
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it('opens the add task dialog and posts the new task', async () => {
    const createdTask = {
      ...exampleTask,
      id: 'test-id',
      description: '',
      assignee: undefined,
      dueDate: undefined,
      tags: [],
    };

    fetchMock
      .mockResolvedValueOnce(createJsonResponse([]))
      .mockResolvedValueOnce(createJsonResponse(createdTask, { status: 201 }))
      .mockResolvedValueOnce(createJsonResponse([createdTask]));

    const { user } = createWrapper();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    fetchMock.mockClear();

    const openButton = screen.getByRole('button', { name: /add task/i });
    await user.click(openButton);

    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Launch plan');

    const dialog = screen.getByRole('dialog');
    const submitButton = within(dialog).getByRole('button', { name: /add task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const [, init] = fetchMock.mock.calls[0] as [RequestInfo, RequestInit];
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toMatchObject({
      title: 'Launch plan',
      status: 'TODO',
      priority: 'MEDIUM',
      tags: [],
    });
  });

  it('opens the edit dialog and submits task updates', async () => {
    const updatedTask = {
      ...exampleTask,
      title: 'Updated title',
    };

    fetchMock
      .mockResolvedValueOnce(createJsonResponse([exampleTask]))
      .mockResolvedValueOnce(createJsonResponse(updatedTask))
      .mockResolvedValueOnce(createJsonResponse([updatedTask]));

    const { user } = createWrapper();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const taskCard = await screen.findByRole('article', {
      name: `Task ${exampleTask.title}`,
    });

    const editButton = within(taskCard).getByRole('button', {
      name: new RegExp(`Edit task "${exampleTask.title}"`, 'i'),
    });

    await user.click(editButton);

    const dialog = await screen.findByRole('dialog');
    const titleInput = within(dialog).getByLabelText('Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated title');

    const submitButton = within(dialog).getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([, init]) => init?.method === 'PUT'),
      ).toBe(true);
    });

    const putCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT');
    expect(putCall?.[0]).toBe(`/api/tasks/${exampleTask.id}`);
    expect(JSON.parse((putCall?.[1] as RequestInit).body as string)).toMatchObject({
      title: 'Updated title',
      status: exampleTask.status,
      priority: exampleTask.priority,
    });
  });

  it('deletes a task and removes it from the board when the API succeeds', async () => {
    fetchMock
      .mockResolvedValueOnce(createJsonResponse([exampleTask]))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(createJsonResponse([]));

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    try {
      const { user } = createWrapper();

      const taskCard = await screen.findByRole('article', {
        name: `Task ${exampleTask.title}`,
      });

      const deleteButton = within(taskCard).getByRole('button', {
        name: new RegExp(`Delete task "${exampleTask.title}"`),
      });

      await user.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalledWith(
        `Are you sure you want to delete "${exampleTask.title}"?`,
      );

      await waitFor(() => {
        expect(
          fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE'),
        ).toBe(true);
      });

      await waitFor(() =>
        expect(
          screen.queryByRole('article', { name: `Task ${exampleTask.title}` }),
        ).not.toBeInTheDocument(),
      );

      expect(
        fetchMock.mock.calls.find(([, init]) => init?.method === 'DELETE'),
      ).toEqual([
        `/api/tasks/${exampleTask.id}`,
        expect.objectContaining({ method: 'DELETE' }),
      ]);
    } finally {
      confirmSpy.mockRestore();
    }
  });

  it('shows an error message when deleting a task fails', async () => {
    fetchMock
      .mockResolvedValueOnce(createJsonResponse([exampleTask]))
      .mockResolvedValueOnce(createJsonResponse({ message: 'error' }, { status: 500 }));

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    try {
      const { user } = createWrapper();

      const taskCard = await screen.findByRole('article', {
        name: `Task ${exampleTask.title}`,
      });

      const deleteButton = within(taskCard).getByRole('button', {
        name: new RegExp(`Delete task "${exampleTask.title}"`),
      });

      await user.click(deleteButton);

      await waitFor(() => {
        expect(
          fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE'),
        ).toBe(true);
      });

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent('Failed to delete task. Please try again.');

      expect(
        screen.getByRole('article', { name: `Task ${exampleTask.title}` }),
      ).toBeInTheDocument();
    } finally {
      confirmSpy.mockRestore();
    }
  });
});
