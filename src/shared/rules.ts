import { ValidationError } from './errors';
import { toDollars } from './utils/money';
import type { AccountsRepository } from '../domain/accounts/accounts-repository';
import type { Direction, Account } from '../domain/accounts/accounts-types';
import type { Entry, Transaction } from '../domain/transactions/transactions-types';

export const calculateBalanceImpact = (
  accountDirection: Direction,
  entryDirection: Direction,
  amount: number
): number => {
  return accountDirection === entryDirection ? amount : -amount;
};

export const ensureTransactionIsBalanced = (entries: Entry[]): void => {
  const totalDebits = entries.filter(entry => entry.direction === 'debit')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalCredits = entries.filter(entry => entry.direction === 'credit')
    .reduce((sum, entry) => sum + entry.amount, 0);

  if (totalDebits !== totalCredits) {
    const debit = toDollars(totalDebits).toFixed(2);
    const credit = toDollars(totalCredits).toFixed(2);
    throw new ValidationError(
      `Unbalanced transaction: total debits ($${debit}) != total credits ($${credit}).`
    );
  }
};

export const applyLedgerEntryToAccount = (account: Account, entry: Entry): Account => {
  const delta = calculateBalanceImpact(account.direction, entry.direction, entry.amount);
  return { ...account, balance: account.balance + delta };
};

export const applyTransactionToAccounts = (
  repo: AccountsRepository,
  transaction: Transaction
): Map<string, Account> => {
  ensureTransactionIsBalanced(transaction.entries);

  const snapshot = new Map<string, Account>();

  for (const entry of transaction.entries) {
    const account = repo.findById(entry.account_id);
    snapshot.set(account.id, account);
  }

  const updatedSnapshot = new Map(snapshot);

  for (const entry of transaction.entries) {
    const account = updatedSnapshot.get(entry.account_id)!;
    updatedSnapshot.set(account.id, applyLedgerEntryToAccount(account, entry));
  }

  return updatedSnapshot;
};
