import { describe, expect, it } from 'vitest';
import { buildServer } from '../src/server.js';

async function setup() {
  const server = await buildServer();
  return server;
}

describe('Task routes', () => {
  it('lists tasks', async () => {
    const server = await setup();
    const response = await server.inject({ method: 'GET', url: '/api/tasks' });
    expect(response.statusCode).toBe(200);
    const payload = response.json();
    expect(Array.isArray(payload)).toBe(true);
    expect(payload.length).toBeGreaterThan(0);
  });

  it('creates and retrieves a task', async () => {
    const server = await setup();
    const createResponse = await server.inject({
      method: 'POST',
      url: '/api/tasks',
      payload: {
        title: 'Write tests',
        description: 'Add vitest coverage for task routes',
        status: 'TODO',
      },
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json();
    const getResponse = await server.inject({
      method: 'GET',
      url: `/api/tasks/${created.id}`,
    });
    expect(getResponse.statusCode).toBe(200);
    const task = getResponse.json();
    expect(task.title).toBe('Write tests');
  });

  it('deletes a task and prevents further access', async () => {
    const server = await setup();

    const createResponse = await server.inject({
      method: 'POST',
      url: '/api/tasks',
      payload: {
        title: 'Temporary task',
        description: 'Task that will be removed',
        status: 'TODO',
      },
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json();

    const deleteResponse = await server.inject({
      method: 'DELETE',
      url: `/api/tasks/${created.id}`,
    });

    expect(deleteResponse.statusCode).toBe(204);

    const getResponse = await server.inject({
      method: 'GET',
      url: `/api/tasks/${created.id}`,
    });

    expect(getResponse.statusCode).toBe(404);

    const listResponse = await server.inject({ method: 'GET', url: '/api/tasks' });
    expect(listResponse.statusCode).toBe(200);
    const tasks = listResponse.json();
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.some((task: { id: string }) => task.id === created.id)).toBe(false);
  });

  it('returns 404 for unknown task', async () => {
    const server = await setup();
    const response = await server.inject({ method: 'GET', url: '/api/tasks/nonexistent' });
    expect(response.statusCode).toBe(404);
  });
});
