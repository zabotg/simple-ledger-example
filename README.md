# Ledger (Double-Entry) — Fastify + TypeScript

A minimal double-entry accounting ledger built with **Fastify**, **TypeScript**, and **Zod**.
Implements debit/credit accounts, balanced transactions, and in-memory storage.

## Running Locally

```bash
npm ci
npm run dev
```

Server runs on [http://localhost:8080](http://localhost:8080)

## Running Tests

```bash
npm test
```

Runs all unit tests using Jest.

## API Endpoints

### Accounts

- `POST /accounts` — Create a new account
- `GET /accounts/:id` — Retrieve an account by ID

### Transactions

- `POST /transactions` — Create a transaction (must be balanced)

## Example Flow

Run the included test script to simulate ledger operations:

```bash
chmod +x ledger-curls.sh
./ledger-curls.sh
```

This will:

- Create debit and credit accounts
- Perform a balanced transaction
- Validate account balances
- Attempt an unbalanced transaction (expected to fail)

## Tech Stack

- **Node.js 20+** (ES Modules)
- **Fastify 4** — lightweight HTTP server
- **TypeScript 5** — static typing
- **Zod** — schema validation
- **Jest** — testing framework

## Design Notes

- In-memory repositories (no database)
- Validation with Zod
- Business logic isolated in domain modules
