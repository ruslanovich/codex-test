import type { FastifyInstance } from 'fastify';
import { createTaskSchema, taskQuerySchema, updateTaskSchema } from '../schemas.js';

export default async function taskRoutes(fastify: FastifyInstance) {
  fastify.get('/tasks', async (request) => {
    const query = taskQuerySchema.parse(request.query);
    return fastify.taskService.list(query);
  });

  fastify.get('/tasks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const task = fastify.taskService.findById(id);
    if (!task) {
      return reply.code(404).send({ message: 'Task not found' });
    }
    return task;
  });

  fastify.post('/tasks', async (request, reply) => {
    const body = createTaskSchema.parse(request.body);
    const task = fastify.taskService.create(body);
    return reply.code(201).send(task);
  });

  fastify.put('/tasks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateTaskSchema.parse(request.body);

    try {
      const task = fastify.taskService.update(id, body);
      return task;
    } catch (error) {
      return reply.code(404).send({ message: (error as Error).message });
    }
  });

  fastify.delete('/tasks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      fastify.taskService.delete(id);
      return reply.code(204).send();
    } catch (error) {
      return reply.code(404).send({ message: (error as Error).message });
    }
  });
}
