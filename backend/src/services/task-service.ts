import { randomUUID } from 'node:crypto';
import type { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from '../types.js';

interface FindOptions {
  status?: TaskStatus;
  priority?: Task['priority'];
  assignee?: string;
  search?: string;
}

export class TaskService {
  private tasks: Task[] = [];

  constructor(seed: Task[] = []) {
    this.tasks = seed;
  }

  list(options: FindOptions = {}): Task[] {
    const { status, priority, assignee, search } = options;

    return this.tasks
      .filter((task) => !task.archived)
      .filter((task) => (status ? task.status === status : true))
      .filter((task) => (priority ? task.priority === priority : true))
      .filter((task) => (assignee ? task.assignee === assignee : true))
      .filter((task) =>
        search
          ? `${task.title} ${task.description ?? ''}`
              .toLowerCase()
              .includes(search.toLowerCase())
          : true,
      )
      .sort((a, b) => a.order - b.order);
  }

  findById(id: string): Task | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  create(input: CreateTaskInput): Task {
    const now = new Date().toISOString();
    const status = input.status ?? 'TODO';
    const siblings = this.tasks.filter((task) => task.status === status);
    const nextOrder = siblings.length === 0 ? 0 : Math.max(...siblings.map((task) => task.order)) + 1;

    const task: Task = {
      id: randomUUID(),
      title: input.title,
      description: input.description,
      status,
      priority: input.priority ?? 'MEDIUM',
      assignee: input.assignee,
      dueDate: input.dueDate,
      tags: input.tags ?? [],
      archived: input.archived ?? false,
      order: nextOrder,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.push(task);
    return task;
  }

  update(id: string, input: UpdateTaskInput): Task {
    const task = this.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    const nextStatus = input.status ?? task.status;
    if (nextStatus !== task.status) {
      this.reindexColumn(task.status, id);
      task.status = nextStatus;
      task.order = this.calculateNextOrder(nextStatus);
    }

    if (typeof input.order === 'number') {
      this.reposition(task, input.order);
    }

    task.title = input.title ?? task.title;
    task.description = input.description ?? task.description;
    task.priority = input.priority ?? task.priority;
    task.assignee = input.assignee ?? task.assignee;
    task.dueDate = input.dueDate ?? task.dueDate;
    task.tags = input.tags ?? task.tags;
    task.archived = input.archived ?? task.archived;
    task.updatedAt = new Date().toISOString();

    return task;
  }

  delete(id: string): void {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }

    const [removed] = this.tasks.splice(index, 1);
    this.reindexColumn(removed.status);
  }

  private calculateNextOrder(status: TaskStatus): number {
    const siblings = this.tasks.filter((task) => task.status === status);
    return siblings.length === 0 ? 0 : Math.max(...siblings.map((task) => task.order)) + 1;
  }

  private reindexColumn(status: TaskStatus, skipId?: string) {
    const siblings = this.tasks
      .filter((task) => task.status === status && task.id !== skipId)
      .sort((a, b) => a.order - b.order);

    siblings.forEach((task, index) => {
      task.order = index;
    });
  }

  private reposition(task: Task, newOrder: number) {
    const siblings = this.tasks
      .filter((other) => other.status === task.status && other.id !== task.id)
      .sort((a, b) => a.order - b.order);

    siblings.splice(newOrder, 0, task);
    siblings.forEach((sibling, index) => {
      sibling.order = index;
    });
  }
}

export function createSeedTasks(): Task[] {
  const now = new Date().toISOString();
  return [
    {
      id: randomUUID(),
      title: 'Design wireframes',
      description: 'Create responsive wireframes for the Kanban board',
      status: 'TODO',
      priority: 'HIGH',
      assignee: 'Alex Morgan',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['design'],
      order: 0,
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      title: 'Setup Fastify server',
      description: 'Initialize Fastify with health check route and logging',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      assignee: 'Jamie Fox',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['backend'],
      order: 0,
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      title: 'Implement drag and drop',
      description: 'Use @dnd-kit to support column reordering',
      status: 'DONE',
      priority: 'LOW',
      assignee: 'Taylor Smith',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['frontend'],
      order: 0,
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
