import { randomUUID } from 'node:crypto';
import { accountsRepository as defaultAccountsRepo, AccountsRepository } from '../accounts/accounts-repository';
import { TransactionsRepository } from './transactions-repository';
import { applyTransactionToAccounts } from '../../shared/rules';
import type { CreateTransactionInput, Transaction } from './transactions-types';

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
