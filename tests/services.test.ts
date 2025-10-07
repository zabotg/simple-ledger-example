import { accountsRepository } from '../src/domain/accounts/accounts-repository';
import { AccountsService } from '../src/domain/accounts/accounts-service';
import { TransactionsService } from '../src/domain/transactions/transactions-service';

beforeEach(() => accountsRepository.clear());

test('apply balanced transaction updates account balances correctly', () => {
  const accSvc = new AccountsService();
  const txSvc = new TransactionsService();

  const cash = accSvc.create({ direction: 'debit', name: 'Cash', balance: 0 });
  const expense = accSvc.create({ direction: 'debit', name: 'Food Expense', balance: 0 });

  txSvc.create({
    name: 'Lunch',
    entries: [
      { direction: 'debit', amount: 100, account_id: expense.id },
      { direction: 'credit', amount: 100, account_id: cash.id }
    ]
  });

  expect(accountsRepository.findById(cash.id).balance).toBe(-100);
  expect(accountsRepository.findById(expense.id).balance).toBe(100);
});
