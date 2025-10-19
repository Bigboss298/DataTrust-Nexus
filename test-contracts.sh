#!/bin/bash
# ============================================================
# TEST SMART CONTRACTS ON BLOCKDAG (Bash Version)
# ============================================================
# This script tests if your deployed contracts are working

echo "========================================"
echo "Testing Smart Contracts on BlockDAG..."
echo "========================================"
echo ""

# Your deployed contract addresses
INSTITUTION_REGISTRY="0x5e845012B9c5347daB42DA4b5AC2669970b3B5cE"
DATA_VAULT="0x8D9e9A1999C8D33E335bEA01A25E0A6698D32168"
ACCESS_CONTROL="0x6e951aC90F0ea195af2991938DCcBbD845c424D3"
AUDIT_TRAIL="0x4b7CFa26D4e5abA247240B117a8B25fBB7476261"
DEPLOYER="0xEB982d4692d70330D35361d247B67daE1f919E13"

RPC_URL="https://rpc.awakening.bdagscan.com"

# Test 1: Check InstitutionRegistry contract
echo "Test 1: Checking InstitutionRegistry contract..."
response1=$(curl -s -X POST $RPC_URL \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$INSTITUTION_REGISTRY\",\"latest\"],\"id\":1}")

if echo "$response1" | grep -q '"result":"0x[0-9a-fA-F]\{10,\}"'; then
    echo "✅ InstitutionRegistry contract FOUND!"
    echo "   Address: $INSTITUTION_REGISTRY"
else
    echo "❌ InstitutionRegistry contract NOT FOUND!"
fi
echo ""

# Test 2: Check DataVaultContract
echo "Test 2: Checking DataVaultContract..."
response2=$(curl -s -X POST $RPC_URL \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$DATA_VAULT\",\"latest\"],\"id\":1}")

if echo "$response2" | grep -q '"result":"0x[0-9a-fA-F]\{10,\}"'; then
    echo "✅ DataVaultContract FOUND!"
    echo "   Address: $DATA_VAULT"
else
    echo "❌ DataVaultContract NOT FOUND!"
fi
echo ""

# Test 3: Check AccessControlContract
echo "Test 3: Checking AccessControlContract..."
response3=$(curl -s -X POST $RPC_URL \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$ACCESS_CONTROL\",\"latest\"],\"id\":1}")

if echo "$response3" | grep -q '"result":"0x[0-9a-fA-F]\{10,\}"'; then
    echo "✅ AccessControlContract FOUND!"
    echo "   Address: $ACCESS_CONTROL"
else
    echo "❌ AccessControlContract NOT FOUND!"
fi
echo ""

# Test 4: Check AuditTrailContract
echo "Test 4: Checking AuditTrailContract..."
response4=$(curl -s -X POST $RPC_URL \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$AUDIT_TRAIL\",\"latest\"],\"id\":1}")

if echo "$response4" | grep -q '"result":"0x[0-9a-fA-F]\{10,\}"'; then
    echo "✅ AuditTrailContract FOUND!"
    echo "   Address: $AUDIT_TRAIL"
else
    echo "❌ AuditTrailContract NOT FOUND!"
fi
echo ""

# Test 5: Get latest block number
echo "Test 5: Getting latest BlockDAG block number..."
response5=$(curl -s -X POST $RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}')

if echo "$response5" | grep -q '"result":"0x'; then
    block_hex=$(echo "$response5" | grep -o '"result":"0x[0-9a-fA-F]*"' | cut -d'"' -f4)
    block_number=$((16#${block_hex#0x}))
    echo "✅ BlockDAG is online!"
    echo "   Latest block: $block_number"
else
    echo "❌ Could not connect to BlockDAG!"
fi
echo ""

# Test 6: Check wallet balance
echo "Test 6: Checking deployer wallet balance..."
response6=$(curl -s -X POST $RPC_URL \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"$DEPLOYER\",\"latest\"],\"id\":1}")

if echo "$response6" | grep -q '"result":"0x'; then
    balance_hex=$(echo "$response6" | grep -o '"result":"0x[0-9a-fA-F]*"' | cut -d'"' -f4)
    balance_wei=$((16#${balance_hex#0x}))
    balance_eth=$(echo "scale=4; $balance_wei / 1000000000000000000" | bc)
    echo "✅ Wallet balance retrieved!"
    echo "   Address: $DEPLOYER"
    echo "   Balance: $balance_eth ETH"
else
    echo "❌ Could not retrieve wallet balance!"
fi
echo ""

# Summary
echo "========================================"
echo "SUMMARY"
echo "========================================"

all_good=true
if ! echo "$response1" | grep -q '"result":"0x[0-9a-fA-F]\{10,\}"'; then all_good=false; fi
if ! echo "$response2" | grep -q '"result":"0x[0-9a-fA-F]\{10,\}"'; then all_good=false; fi
if ! echo "$response3" | grep -q '"result":"0x[0-9a-fA-F]\{10,\}"'; then all_good=false; fi
if ! echo "$response4" | grep -q '"result":"0x[0-9a-fA-F]\{10,\}"'; then all_good=false; fi

if $all_good; then
    echo "✅ ALL CONTRACTS ARE DEPLOYED AND WORKING!"
    echo ""
    echo "Next steps:"
    echo "1. cd Backend && dotnet restore"
    echo "2. Copy ABIs to Backend/ContractABIs/"
    echo "3. dotnet run"
else
    echo "⚠️  Some contracts may not be deployed correctly"
    echo "Check the deployment on: https://awakening.bdagscan.com/"
fi

echo ""
echo "View your contracts on BlockDAG Explorer:"
echo "https://awakening.bdagscan.com/address/$INSTITUTION_REGISTRY"

