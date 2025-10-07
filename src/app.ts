import Fastify from 'fastify';
import { registerAccountsController } from './domain/accounts/accounts-controller';
import { registerTransactionsController } from './domain/transactions/transactions-controller';
import { AppError, NotFoundError, ValidationError } from './shared/errors';

export const buildApp = () => {
  const app = Fastify({ logger: true });

  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof ValidationError) return reply.code(400).send({ message: err.message });
    if (err instanceof NotFoundError) return reply.code(404).send({ message: err.message });
    if (err instanceof AppError) return reply.code(400).send({ message: err.message });
    if (err?.name === 'ZodError') {
      // @ts-ignore - zod runtime provides issues
      return reply.code(400).send({ message: 'Invalid payload', issues: err.issues });
    }
    app.log.error(err);
    return reply.code(500).send({ message: 'Internal Server Error' });
  });

  app.register(registerAccountsController);
  app.register(registerTransactionsController);

  return app;
};
