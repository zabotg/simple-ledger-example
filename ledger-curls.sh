#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"

# Check dependencies
if ! command -v jq &>/dev/null; then
  echo "Error: jq is not installed."
  exit 1
fi

echo
echo "Running Ledger API smoke test against $BASE_URL"
echo "=============================================================="

# Temp files
CASH_JSON=$(mktemp)
LIAB_JSON=$(mktemp)
TX_JSON=$(mktemp)
cleanup() { rm -f "$CASH_JSON" "$LIAB_JSON" "$TX_JSON"; }
trap cleanup EXIT

# 1) Create Cash account
echo
echo "[1] Creating debit account (Cash, balance 500)..."
curl -s -f -X POST "$BASE_URL/accounts" \
  -H "Content-Type: application/json" \
  -d '{"name":"Cash","direction":"debit","balance":500}' \
  | tee "$CASH_JSON" | jq .
CASH_ID=$(jq -r '.id' "$CASH_JSON")
echo "=============================================================="

# 2) Create Liabilities account
echo
echo "[2] Creating credit account (Liabilities, balance 200)..."
curl -s -f -X POST "$BASE_URL/accounts" \
  -H "Content-Type: application/json" \
  -d '{"name":"Liabilities","direction":"credit","balance":200}' \
  | tee "$LIAB_JSON" | jq .
LIAB_ID=$(jq -r '.id' "$LIAB_JSON")
echo "=============================================================="

# 3) List both accounts
echo
echo "[3] Fetching both accounts..."
echo "Cash:"
curl -s -f "$BASE_URL/accounts/$CASH_ID" | jq .
echo
echo "Liabilities:"
curl -s -f "$BASE_URL/accounts/$LIAB_ID" | jq .
echo "=============================================================="

# 4) Balanced transaction
echo
echo "[4] Creating a balanced transaction: pay down liabilities by 100..."
curl -s -f -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Pay down liabilities by 100\",
    \"entries\": [
      { \"direction\": \"credit\", \"amount\": 100, \"account_id\": \"$CASH_ID\" },
      { \"direction\": \"debit\",  \"amount\": 100, \"account_id\": \"$LIAB_ID\" }
    ]
  }" | tee "$TX_JSON" | jq .
  echo "=============================================================="

# 5) Updated balances
echo
echo "[5] Checking updated balances (expected: Cash=400, Liabilities=100)..."
CASH_AFTER=$(curl -s -f "$BASE_URL/accounts/$CASH_ID" | jq .)
LIAB_AFTER=$(curl -s -f "$BASE_URL/accounts/$LIAB_ID" | jq .)
echo "$CASH_AFTER"
echo "$LIAB_AFTER"

CASH_BAL=$(echo "$CASH_AFTER" | jq -r '.balance')
LIAB_BAL=$(echo "$LIAB_AFTER" | jq -r '.balance')
echo
echo "→ Current balances: Cash=$CASH_BAL, Liabilities=$LIAB_BAL"
echo "=============================================================="

# 6) Unbalanced transaction
echo
echo "[6] Trying an unbalanced transaction (should fail)..."
set +e
curl -s -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Broken TX\",
    \"entries\": [
      { \"direction\": \"debit\",  \"amount\": 50, \"account_id\": \"$CASH_ID\" },
      { \"direction\": \"credit\", \"amount\": 30, \"account_id\": \"$LIAB_ID\" }
    ]
  }" | jq . || true
set -e
echo "=============================================================="

echo
echo "All tests finished."
