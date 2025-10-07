import type { Transaction } from './transactions-types';

export class TransactionsRepository {
  private store = new Map<string, Transaction>();

  create = (tx: Transaction): Transaction => {
    this.store.set(tx.id, tx);
    return tx;
  };

  get = (id: string): Transaction | undefined => {
    return this.store.get(id);
  };

  clear = (): void => {
    this.store.clear();
  };
}
