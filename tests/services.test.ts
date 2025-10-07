import { accountsRepository } from "../src/domain/accounts/accounts-repository";
import { AccountsService } from "../src/domain/accounts/accounts-service";
import { TransactionsService } from "../src/domain/transactions/transactions-service";

describe('Domain Services (accounts & transactions)', () => {
  const accounts = new AccountsService();
  const transactions = new TransactionsService();

  beforeEach(() => accountsRepository.clear());

  describe('AccountsService', () => {
    it('creates accounts with sensible defaults', () => {
      const cash = accounts.create({ direction: 'debit', name: 'Cash' });
      expect(cash).toMatchObject({
        id: expect.any(String),
        name: 'Cash',
        direction: 'debit',
        balance: 0,
      });

      const liabilities = accounts.create({ direction: 'credit', name: 'Liabilities', balance: 10 });
      expect(liabilities.balance).toBe(10);
    });

    it('retrieves account by id', () => {
      const acc = accounts.create({ direction: 'debit', name: 'Foo' });
      const fetched = accounts.get(acc.id);
      expect(fetched).toEqual(acc);
    });
  });

  describe('TransactionsService', () => {
    it('applies a balanced transaction and adjusts balances correctly', () => {
      const cash = accounts.create({ direction: 'debit', name: 'Cash', balance: 0 });
      const expense = accounts.create({ direction: 'debit', name: 'Food Expense', balance: 0 });

      transactions.create({
        name: 'Lunch',
        entries: [
          { direction: 'debit', amount: 100, account_id: expense.id },
          { direction: 'credit', amount: 100, account_id: cash.id },
        ],
      });

      expect(accountsRepository.findById(cash.id).balance).toBe(-100);
      expect(accountsRepository.findById(expense.id).balance).toBe(100);
    });

    it('rejects unbalanced transactions and throws ValidationError mapped by app', () => {
      const a = accounts.create({ direction: 'debit', name: 'A' });
      const b = accounts.create({ direction: 'credit', name: 'B' });

      expect(() =>
        transactions.create({
          name: 'Broken',
          entries: [
            { direction: 'debit', amount: 100, account_id: a.id },
            { direction: 'credit', amount: 90, account_id: b.id },
          ],
        })
      ).toThrow(/Unbalanced transaction/i);
    });
  });
});
