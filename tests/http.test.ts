import { buildApp } from '../src/app';
import { accountsRepository } from '../src/domain/accounts/accounts-repository';

const app = buildApp();

beforeEach(() => accountsRepository.clear());
afterAll(async () => await app.close());

test('POST /accounts and GET /accounts/:id', async () => {
  const create = await app.inject({
    method: 'POST',
    url: '/accounts',
    payload: { name: 'Cash', direction: 'debit' }
  });
  expect(create.statusCode).toBe(201);
  const account = create.json();

  const get = await app.inject({ method: 'GET', url: `/accounts/${account.id}` });
  expect(get.statusCode).toBe(200);
  expect(get.json().direction).toBe('debit');
});

test('POST /transactions updates balances correctly', async () => {
  const cash = (await app.inject({ method: 'POST', url: '/accounts', payload: { name: 'Cash', direction: 'debit', balance: 200 } })).json();
  const food = (await app.inject({ method: 'POST', url: '/accounts', payload: { name: 'Food', direction: 'debit', balance: 0 } })).json();

  const tx = await app.inject({
    method: 'POST',
    url: '/transactions',
    payload: {
      name: 'Lunch',
      entries: [
        { direction: 'debit', amount: 50, account_id: food.id },
        { direction: 'credit', amount: 50, account_id: cash.id }
      ]
    }
  });
  expect(tx.statusCode).toBe(201);

  const cashAfter = (await app.inject({ method: 'GET', url: `/accounts/${cash.id}` })).json();
  const foodAfter = (await app.inject({ method: 'GET', url: `/accounts/${food.id}` })).json();
  expect(cashAfter.balance).toBe(150);
  expect(foodAfter.balance).toBe(50);
});

test('rejects unbalanced transaction', async () => {
  const a = (await app.inject({ method: 'POST', url: '/accounts', payload: { name: 'A', direction: 'debit' } })).json();
  const b = (await app.inject({ method: 'POST', url: '/accounts', payload: { name: 'B', direction: 'credit' } })).json();

  const bad = await app.inject({
    method: 'POST',
    url: '/transactions',
    payload: {
      entries: [
        { direction: 'debit', amount: 100, account_id: a.id },
        { direction: 'credit', amount: 90, account_id: b.id }
      ]
    }
  });
  expect(bad.statusCode).toBe(400);
});
