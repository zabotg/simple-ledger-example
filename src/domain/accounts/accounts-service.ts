import { randomUUID } from 'node:crypto';

import type { AccountsRepository } from './accounts-repository';
import { accountsRepository as defaultAccountsRepo } from './accounts-repository';
import type { Account, CreateAccountInput } from './accounts-types';

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
