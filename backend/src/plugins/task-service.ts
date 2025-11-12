import fp from 'fastify-plugin';
import { TaskService, createSeedTasks } from '../services/task-service.js';

declare module 'fastify' {
  interface FastifyInstance {
    taskService: TaskService;
  }
}

export default fp(async (fastify) => {
  const taskService = new TaskService(createSeedTasks());
  fastify.decorate('taskService', taskService);
});
