import { buildApp } from '../../src/app';
import { accountsRepository } from '../../src/domain/accounts/accounts-repository';

describe('Ledger Flow', () => {
  const app = buildApp();

  const createAccount = async (payload: Record<string, unknown>) => {
    const res = await app.inject({ method: 'POST', url: '/accounts', payload });
    return { status: res.statusCode, body: res.json() };
  };

  const postTransaction = async (payload: Record<string, unknown>) => {
    const res = await app.inject({ method: 'POST', url: '/transactions', payload });
    return { status: res.statusCode, body: res.json() };
  };

  const getAccount = async (id: string) => {
    const res = await app.inject({ method: 'GET', url: `/accounts/${id}` });
    return { status: res.statusCode, body: res.json() };
  };

  beforeEach(() => accountsRepository.clear());
  afterAll(async () => await app.close());

  it('creates accounts and retrieves them', async () => {
    const { status, body } = await createAccount({ name: 'Cash', direction: 'debit' });
    expect(status).toBe(201);
    expect(body).toMatchObject({ id: expect.any(String), name: 'Cash', direction: 'debit', balance: 0 });

    const fetched = await getAccount(body.id);
    expect(fetched.status).toBe(200);
    expect(fetched.body).toEqual(body);
  });

  it('applies a balanced transaction and persists updated balances', async () => {
    const cash = (await createAccount({ name: 'Cash', direction: 'debit', balance: 200 })).body;
    const food = (await createAccount({ name: 'Food', direction: 'debit', balance: 0 })).body;

    const transaction = await postTransaction({
      name: 'Lunch',
      entries: [
        { direction: 'debit', amount: 50, account_id: food.id },
        { direction: 'credit', amount: 50, account_id: cash.id },
      ],
    });

    expect(transaction.status).toBe(201);
    expect(transaction.body).toMatchObject({
      id: expect.any(String),
      name: 'Lunch',
      entries: [
        { id: expect.any(String), direction: 'debit', amount: 50, account_id: food.id },
        { id: expect.any(String), direction: 'credit', amount: 50, account_id: cash.id },
      ],
    });

    const afterCash = await getAccount(cash.id);
    const afterFood = await getAccount(food.id);
    expect(afterCash.body.balance).toBe(150);
    expect(afterFood.body.balance).toBe(50);
  });

  it('rejects unbalanced transaction with 400', async () => {
    const account_debit = (await createAccount({ name: 'A', direction: 'debit' })).body;
    const account_credit = (await createAccount({ name: 'B', direction: 'credit' })).body;

    const bad = await postTransaction({
      name: 'Test',
      entries: [
        { direction: 'debit', amount: 100, account_id: account_debit.id },
        { direction: 'credit', amount: 90, account_id: account_credit.id },
      ],
    });

    expect(bad.status).toBe(400);
    expect(bad.body.message).toMatch(/Unbalanced transaction/i);
  });

  it('returns 404 when fetching a non-existing account', async () => {
    const res = await getAccount('00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/Account not found/i);
  });

  it('validates account payload using missing direction with 400', async () => {
    const res = await createAccount({ name: 'No direction' });
    expect(res.status).toBe(400);
    expect(res.body.message ?? JSON.stringify(res.body)).toMatch(/Invalid payload|required/i);
  });
});
