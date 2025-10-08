#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"

# Requirements
command -v jq >/dev/null 2>&1 || { echo "jq is required but not installed."; exit 1; }

# Temp files
CASH_JSON="$(mktemp)"
LIAB_JSON="$(mktemp)"
TX_JSON="$(mktemp)"
cleanup() { rm -f "$CASH_JSON" "$LIAB_JSON" "$TX_JSON"; }
trap cleanup EXIT

echo ""
echo "Testing Ledger API on $BASE_URL"
echo "----------------------------------------------------------"

# 1 - Create debit account (Cash)
echo "Creating debit account (Cash, balance 500)..."
curl -sS -f -X POST "$BASE_URL/accounts" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cash",
    "direction": "debit",
    "balance": 500
  }' | tee "$CASH_JSON" | jq .
CASH_ID="$(jq -r '.id' "$CASH_JSON")"
echo "Cash account created: $CASH_ID"
echo "----------------------------------------------------------"

# 2 - Create credit account (Liabilities)
echo "Creating credit account (Liabilities, balance 200)..."
curl -sS -f -X POST "$BASE_URL/accounts" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Liabilities",
    "direction": "credit",
    "balance": 200
  }' | tee "$LIAB_JSON" | jq .
LIAB_ID="$(jq -r '.id' "$LIAB_JSON")"
echo "Liabilities account created: $LIAB_ID"
echo "----------------------------------------------------------"

# 3 - Fetch both accounts
echo "Fetching accounts..."
curl -sS -f "$BASE_URL/accounts/$CASH_ID" | jq .
curl -sS -f "$BASE_URL/accounts/$LIAB_ID" | jq .
echo "----------------------------------------------------------"

# 4 - Create a balanced transaction
echo "Creating a balanced transaction: Pay down liabilities by 100..."
curl -sS -f -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Pay down liabilities by 100\",
    \"entries\": [
      { \"direction\": \"credit\", \"amount\": 100, \"account_id\": \"$CASH_ID\" },
      { \"direction\": \"debit\",  \"amount\": 100, \"account_id\": \"$LIAB_ID\" }
    ]
  }" | tee "$TX_JSON" | jq .
echo "----------------------------------------------------------"

# 5 - Get updated balances (expected: Cash 400; Liabilities 100)
echo "Fetching updated account balances..."
echo "Cash:"
CASH_AFTER="$(curl -sS -f "$BASE_URL/accounts/$CASH_ID" | jq .)"
echo "$CASH_AFTER"
echo "Liabilities:"
LIAB_AFTER="$(curl -sS -f "$BASE_URL/accounts/$LIAB_ID" | jq .)"
echo "$LIAB_AFTER"
echo "----------------------------------------------------------"

# 6 - Attempt unbalanced transaction (should fail)
echo "Creating unbalanced transaction (should fail)..."
set +e
UNBALANCED_OUT="$(curl -sS -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Broken TX\",
    \"entries\": [
      { \"direction\": \"debit\", \"amount\": 50, \"account_id\": \"$CASH_ID\" },
      { \"direction\": \"credit\", \"amount\": 30, \"account_id\": \"$LIAB_ID\" }
    ]
  }")"
set -e
echo "$UNBALANCED_OUT" | jq . || echo "$UNBALANCED_OUT"
echo "----------------------------------------------------------"

# 7 - Post-check
CASH_BAL="$(echo "$CASH_AFTER" | jq -r '.balance')"
LIAB_BAL="$(echo "$LIAB_AFTER" | jq -r '.balance')"
echo "Post-check: expected Cash=400, Liabilities=100 → got Cash=$CASH_BAL, Liabilities=$LIAB_BAL"

echo "All tests executed."
