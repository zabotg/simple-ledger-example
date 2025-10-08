import type { Transaction } from './transactions-types';

export class TransactionsRepository {
  private store = new Map<string, Transaction>();

  create = (transaction: Transaction): Transaction => {
    this.store.set(transaction.id, transaction);
    return transaction;
  };

  get = (id: string): Transaction | undefined => {
    return this.store.get(id);
  };

  clear = (): void => {
    this.store.clear();
  };
}
