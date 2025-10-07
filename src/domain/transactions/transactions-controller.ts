import type { FastifyInstance } from 'fastify';
import { TransactionsService } from './transactions-service';
import { createTransactionSchema } from './transactions-schema';

export const registerTransactionsController = async (app: FastifyInstance) => {
  const service = new TransactionsService();

  app.post('/transactions', async (req, reply) => {
    const data = createTransactionSchema.parse(req.body);
    const transaction = service.create(data);
    reply.code(201).send(transaction);
  });
};
