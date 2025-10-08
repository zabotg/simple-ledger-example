import { randomUUID } from 'node:crypto';

import { TransactionsRepository } from './transactions-repository';
import type { CreateTransactionInput, Transaction } from './transactions-types';
import { applyTransactionToAccounts } from '../../shared/rules';
import { accountsRepository as defaultAccountsRepo } from '../accounts/accounts-repository';
import type { AccountsRepository } from '../accounts/accounts-repository';

export class TransactionsService {
  constructor(
    private readonly txRepo: TransactionsRepository = new TransactionsRepository(),
    private readonly accountsRepo: AccountsRepository = defaultAccountsRepo
  ) {}

  create = (input: CreateTransactionInput): Transaction => {
    const transaction: Transaction = {
      id: input.id ?? randomUUID(),
      name: input.name,
      entries: input.entries.map(entry => ({
        ...entry,
        id: entry.id ?? randomUUID()
      }))
    };

    const updatedAccounts = applyTransactionToAccounts(this.accountsRepo, transaction);
    for (const account of updatedAccounts.values()) {
      this.accountsRepo.update(account);
    }

    return this.txRepo.create(transaction);
  };
}
