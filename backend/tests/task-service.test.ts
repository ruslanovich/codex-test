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

  it('updates fields and allows clearing optional values', () => {
    const now = new Date().toISOString();
    const due = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const service = new TaskService([
      {
        id: 'task-1',
        title: 'First task',
        status: 'TODO',
        priority: 'MEDIUM',
        description: 'Original description',
        assignee: 'Jamie',
        dueDate: due,
        tags: ['alpha'],
        archived: false,
        order: 0,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const updated = service.update('task-1', {
      title: 'Updated task',
      description: 'Rewritten description',
      assignee: 'Alex',
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      tags: ['beta'],
    });

    expect(updated.title).toBe('Updated task');
    expect(updated.description).toBe('Rewritten description');
    expect(updated.assignee).toBe('Alex');
    expect(updated.tags).toEqual(['beta']);

    const cleared = service.update('task-1', {
      description: null,
      assignee: null,
      dueDate: null,
    });

    expect(cleared.description).toBeUndefined();
    expect(cleared.assignee).toBeUndefined();
    expect(cleared.dueDate).toBeUndefined();
  });

  it('repositions tasks when moving status or order', () => {
    const now = new Date().toISOString();
    const seed: Task[] = [
      {
        id: 'task-1',
        title: 'First',
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
        title: 'Second',
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
        title: 'Third',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        tags: [],
        archived: false,
        order: 0,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const service = new TaskService(seed.map((task) => ({ ...task })));

    const moved = service.update('task-1', { status: 'IN_PROGRESS' });
    expect(moved.status).toBe('IN_PROGRESS');
    expect(moved.order).toBe(1);

    const reordered = service.update('task-1', { order: 0 });
    expect(reordered.order).toBe(0);

    const inProgress = service.list({ status: 'IN_PROGRESS' });
    expect(inProgress.map((task) => task.id)).toEqual(['task-1', 'task-3']);

    const todo = service.list({ status: 'TODO' });
    expect(todo.map((task) => task.id)).toEqual(['task-2']);
    expect(todo[0].order).toBe(0);
  });
});
