import type { FastifyInstance } from 'fastify';

import { createTransactionSchema } from './transactions-schema';
import { TransactionsService } from './transactions-service';
import type { Transaction } from './transactions-types';
import { toDollars } from '../../shared/utils/money';

const serializeTransaction = (transaction: Transaction) => ({
  ...transaction,
  entries: transaction.entries.map(entry => ({ ...entry, amount: toDollars(entry.amount) })),
});

export const registerTransactionsController = async (app: FastifyInstance) => {
  const service = new TransactionsService();

  app.post('/transactions', async (req, reply) => {
    const data = createTransactionSchema.parse(req.body);
    const transaction = service.create(data);
    reply.code(201).send(serializeTransaction(transaction));
  });
};
