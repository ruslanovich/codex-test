import { describe, expect, it } from 'vitest';
import { TaskService } from '../src/services/task-service.js';
import type { Task } from '../src/types.js';

describe('TaskService', () => {
  it('reindexes remaining tasks after delete', () => {
    const now = new Date().toISOString();
    const seed: Task[] = [
      {
        id: 'task-1',
        title: 'First task',
        status: 'TODO',
        priority: 'MEDIUM',
        tags: [],
        archived: false,
        order: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'task-2',
        title: 'Second task',
        status: 'TODO',
        priority: 'MEDIUM',
        tags: [],
        archived: false,
        order: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'task-3',
        title: 'Third task',
        status: 'TODO',
        priority: 'MEDIUM',
        tags: [],
        archived: false,
        order: 2,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const service = new TaskService(seed.map((task) => ({ ...task })));

    service.delete('task-2');

    const tasks = service.list({ status: 'TODO' });
    expect(tasks).toHaveLength(2);
    expect(tasks[0].id).toBe('task-1');
    expect(tasks[0].order).toBe(0);
    expect(tasks[1].id).toBe('task-3');
    expect(tasks[1].order).toBe(1);
  });
});
