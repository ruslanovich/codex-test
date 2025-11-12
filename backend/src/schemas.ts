import { z } from 'zod';

export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
export const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: taskStatusSchema.optional().default('TODO'),
  priority: taskPrioritySchema.optional().default('MEDIUM'),
  assignee: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
  archived: z.boolean().optional().default(false),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  order: z.number().int().nonnegative().optional(),
});

export const taskQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  assignee: z.string().optional(),
  priority: taskPrioritySchema.optional(),
  search: z.string().optional(),
});
