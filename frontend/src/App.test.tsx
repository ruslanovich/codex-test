import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import App from './App.js';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const user = userEvent.setup();
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
    fetchMock = vi.spyOn(global, 'fetch').mockImplementation((input, init) => {
      if (!init || init.method === undefined) {
        return Promise.resolve(
          new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }

      if (init.method === 'POST') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              id: 'test-id',
              title: 'Launch plan',
              description: '',
              status: 'TODO',
              priority: 'MEDIUM',
              assignee: undefined,
              dueDate: undefined,
              tags: [],
              order: 0,
              archived: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
            {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        );
      }

      return Promise.reject(new Error(`Unhandled fetch call: ${String(input)}`));
    });
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it('opens the add task dialog and posts the new task', async () => {
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
});
