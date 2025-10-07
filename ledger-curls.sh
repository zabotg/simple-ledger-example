#!/usr/bin/env bash

BASE_URL="http://localhost:8080"

echo ""
echo "Testing Ledger API on $BASE_URL"
echo "----------------------------------------------------------"

# 1 - Create debit account
echo "Creating debit account (Cash)..."
curl -s -X POST "$BASE_URL/accounts" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cash",
    "direction": "debit",
    "balance": 500
  }' | tee cash.json | jq .

CASH_ID=$(jq -r '.id' cash.json)
echo "Cash account created: $CASH_ID"
echo "----------------------------------------------------------"

# 2 - Create credit account
echo "Creating credit account (Liabilities)..."
curl -s -X POST "$BASE_URL/accounts" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Liabilities",
    "direction": "credit",
    "balance": 0
  }' | tee liabilities.json | jq .

LIAB_ID=$(jq -r '.id' liabilities.json)
echo "Liabilities account created: $LIAB_ID"
echo "----------------------------------------------------------"

# 3 - List both accounts
echo "Fetching accounts..."
curl -s "$BASE_URL/accounts/$CASH_ID" | jq .
curl -s "$BASE_URL/accounts/$LIAB_ID" | jq .
echo "----------------------------------------------------------"

# 4 - Create a valid transaction
echo "Creating a balanced transaction (transfer 100)..."
curl -s -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Transfer 100 from Cash to Liabilities\",
    \"entries\": [
      { \"direction\": \"credit\", \"amount\": 100, \"account_id\": \"$CASH_ID\" },
      { \"direction\": \"debit\",  \"amount\": 100, \"account_id\": \"$LIAB_ID\" }
    ]
  }" | tee tx.json | jq .
echo "----------------------------------------------------------"

# 5 -  Get updated balances
echo "Fetching updated account balances..."
echo "Cash:"
curl -s "$BASE_URL/accounts/$CASH_ID" | jq .
echo "Liabilities:"
curl -s "$BASE_URL/accounts/$LIAB_ID" | jq .
echo "----------------------------------------------------------"

# 6 - Try unbalanced transaction
echo "Creating unbalanced transaction (should fail)..."
curl -s -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Broken TX\",
    \"entries\": [
      { \"direction\": \"debit\", \"amount\": 50, \"account_id\": \"$CASH_ID\" },
      { \"direction\": \"credit\", \"amount\": 30, \"account_id\": \"$LIAB_ID\" }
    ]
  }" | jq .
echo "----------------------------------------------------------"

# 7 - Done
echo "All tests executed."

rm -f cash.json liabilities.json tx.json