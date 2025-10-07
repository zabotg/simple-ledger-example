export type Direction = 'debit' | 'credit';

export interface Account {
  id: string;
  name?: string;
  direction: Direction;
  balance: number;
}

export interface CreateAccountInput {
  id?: string;
  name?: string;
  direction: Account['direction'];
  balance?: number;
}
