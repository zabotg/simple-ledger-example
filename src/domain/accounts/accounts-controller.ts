import type { FastifyInstance } from 'fastify';

import { createAccountSchema } from './accounts-schema';
import { AccountsService } from './accounts-service';

export const registerAccountsController = async (app: FastifyInstance) => {
  const service = new AccountsService();

  app.post('/accounts', async (req, reply) => {
    const data = createAccountSchema.parse(req.body);
    const account = service.create(data);
    reply.code(201).send(account);
  });

  app.get('/accounts/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const account = service.get(id);
    reply.send(account);
  });
};
