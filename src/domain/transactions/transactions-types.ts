import type { Direction } from '../accounts/accounts-types';

export interface Entry {
  id: string;
  direction: Direction;
  amount: number;
  account_id: string;
}

export interface Transaction {
  id: string;
  name?: string;
  entries: Entry[];
}

export interface LedgerEntryInput {
  id?: string;
  direction: Direction;
  amount: number;
  account_id: string;
}

export interface CreateTransactionInput {
  id?: string;
  name?: string;
  entries: LedgerEntryInput[];
}
