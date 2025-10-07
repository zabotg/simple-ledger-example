import { randomUUID } from 'node:crypto';
import type { Account, CreateAccountInput } from './accounts-types';
import { accountsRepository as defaultAccountsRepo, AccountsRepository } from './accounts-repository';

export class AccountsService {
  constructor(private readonly repo: AccountsRepository = defaultAccountsRepo) {}

  create = (input: CreateAccountInput): Account => {
    const account: Account = {
      id: input.id ?? randomUUID(),
      name: input.name,
      direction: input.direction,
      balance: input.balance ?? 0
    };
    return this.repo.create(account);
  };

  get = (id: string): Account => {
    return this.repo.findById(id);
  };
}
