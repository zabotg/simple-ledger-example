import type { Account } from '../src/domain/accounts/accounts-types';
import type { Entry } from '../src/domain/transactions/transactions-types';
import { applyLedgerEntryToAccount, ensureTransactionIsBalanced } from '../src/shared/rules';

describe('rules', () => {
  test('applyLedgerEntryToAccount', () => {
    const account: Account = { id: 'a', direction: 'debit', balance: 100 };
    const entry: Entry = { id: 'e', direction: 'debit', amount: 50, account_id: 'a' };

    expect(applyLedgerEntryToAccount(account, entry).balance).toBe(150);
  });

  test('ensureTransactionIsBalanced throws on unbalanced entries', () => {
    const entries: Entry[] = [
      { id: '1', direction: 'debit', amount: 100, account_id: 'a' },
      { id: '2', direction: 'credit', amount: 90, account_id: 'b' },
    ];
    expect(() => ensureTransactionIsBalanced(entries)).toThrow(/Unbalanced/);
  });
});
