import type { FastifyInstance, FastifyError } from 'fastify';
import Fastify from 'fastify';
import { ZodError } from 'zod';

import { registerAccountsController } from './domain/accounts/accounts-controller.js';
import { registerTransactionsController } from './domain/transactions/transactions-controller.js';
import { AppError, NotFoundError, ValidationError } from './shared/errors.js';

export const buildApp = (): FastifyInstance => {
  const app = Fastify({ logger: true });

  app.setErrorHandler((err: FastifyError | Error, _req, reply) => {
    if (err instanceof ValidationError)
      return reply.code(400).send({ message: err.message });

    if (err instanceof NotFoundError)
      return reply.code(404).send({ message: err.message });

    if (err instanceof AppError)
      return reply.code(400).send({ message: err.message });

    if (err instanceof ZodError)
      return reply.code(400).send({
        message: 'Invalid payload',
        issues: err.issues,
      });

    app.log.error(err);
    return reply.code(500).send({ message: 'Internal Server Error' });
  });

  app.register(registerAccountsController);
  app.register(registerTransactionsController);

  return app;
};
