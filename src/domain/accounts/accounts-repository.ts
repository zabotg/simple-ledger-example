import type { Account } from './accounts-types';
import { NotFoundError } from '../../shared/errors';

export class AccountsRepository {
  private store = new Map<string, Account>();

  create = (account: Account): Account => {
    this.store.set(account.id, account);
    return account;
  };

  findById = (id: string): Account => {
    const account = this.store.get(id);
    if (!account) throw new NotFoundError(`Account not found: ${id}`);
    return account;
  };

  update = (account: Account): void => {
    this.store.set(account.id, account);
  };

  getAll = (): Account[] => Array.from(this.store.values());

  clear = (): void => {
    this.store.clear();
  };
}

export const accountsRepository = new AccountsRepository();
