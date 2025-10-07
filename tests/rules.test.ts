import { Account } from "../src/domain/accounts/accounts-types";
import { Entry } from "../src/domain/transactions/transactions-types";
import { applyLedgerEntryToAccount, calculateBalanceImpact, ensureTransactionIsBalanced } from "../src/shared/rules";

describe('Ledger Rules', () => {
  describe('calculateBalanceImpact', () => {
    it('adds amount when account and entry have the same direction', () => {
      expect(calculateBalanceImpact('debit', 'debit', 100)).toBe(100);
      expect(calculateBalanceImpact('credit', 'credit', 100)).toBe(100);
    });

    it('subtracts amount when directions differ', () => {
      expect(calculateBalanceImpact('debit', 'credit', 100)).toBe(-100);
      expect(calculateBalanceImpact('credit', 'debit', 100)).toBe(-100);
    });
  });

  describe('applyLedgerEntryToAccount', () => {
    it('returns a new account object with updated balance', () => {
      const account: Account = { id: 'a', direction: 'debit', balance: 100 };
      const entry: Entry = { id: 'e', direction: 'debit', amount: 50, account_id: 'a' };

      const updated = applyLedgerEntryToAccount(account, entry);

      expect(updated).not.toBe(account);
      expect(updated.balance).toBe(150);
    });
  });

  describe('ensureTransactionIsBalanced', () => {
    it('throws when debits and credits do not sum to the same value', () => {
      const entries: Entry[] = [
        { id: '1', direction: 'debit', amount: 100, account_id: 'a' },
        { id: '2', direction: 'credit', amount: 90, account_id: 'b' },
      ];
      expect(() => ensureTransactionIsBalanced(entries)).toThrow(/Unbalanced transaction/i);
    });

    it('does not throw for balanced entries', () => {
      const entries: Entry[] = [
        { id: '1', direction: 'debit', amount: 75, account_id: 'a' },
        { id: '2', direction: 'credit', amount: 75, account_id: 'b' },
      ];
      expect(() => ensureTransactionIsBalanced(entries)).not.toThrow();
    });
  });
});
