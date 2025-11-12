import Fastify from 'fastify';
import cors from '@fastify/cors';
import taskServicePlugin from './plugins/task-service.js';
import taskRoutes from './routes/tasks.js';

export async function buildServer() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, { origin: true });
  await fastify.register(taskServicePlugin);
  await fastify.register(taskRoutes, { prefix: '/api' });

  fastify.get('/health', async () => ({ status: 'ok' }));

  return fastify;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 4000);
  buildServer()
    .then((server) => server.listen({ port, host: '0.0.0.0' }))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
