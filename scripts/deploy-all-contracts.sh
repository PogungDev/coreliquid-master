#!/bin/bash

# 🚀 CoreLiquid Complete Deployment Script
# This script deploys all smart contracts to Core Testnet

echo "🚀 === CoreLiquid Complete Deployment Started ==="
echo "📅 $(date)"

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable not set"
    echo "💡 Set it with: export PRIVATE_KEY=your_private_key_here"
    exit 1
fi

# Core Testnet configuration
RPC_URL="https://rpc.test.btcs.network"
CHAIN_ID=1115

echo "🌐 Network: Core Testnet"
echo "🔗 RPC: $RPC_URL"
echo "⛓️  Chain ID: $CHAIN_ID"

# Create deployment log
LOG_FILE="deployment_$(date +%Y%m%d_%H%M%S).log"
echo "📝 Logging to: $LOG_FILE"

# Function to deploy contract
deploy_contract() {
    local contract_path=$1
    local contract_name=$2
    local constructor_args=$3
    
    echo "\n🔧 Deploying $contract_name..."
    
    if [ -n "$constructor_args" ]; then
        forge create "$contract_path:$contract_name" \
            --rpc-url $RPC_URL \
            --constructor-args $constructor_args \
            --private-key $PRIVATE_KEY \
            --broadcast 2>&1 | tee -a $LOG_FILE
    else
        forge create "$contract_path:$contract_name" \
            --rpc-url $RPC_URL \
            --private-key $PRIVATE_KEY \
            --broadcast 2>&1 | tee -a $LOG_FILE
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ $contract_name deployed successfully"
    else
        echo "❌ Failed to deploy $contract_name"
    fi
}

# Check balance first
echo "\n💰 Checking deployer balance..."
cast balance $(cast wallet address --private-key $PRIVATE_KEY) --rpc-url $RPC_URL

# Start deployments
echo "\n🏗️  Starting contract deployments..."

# 1. Deploy SimpleTestToken (isolated, should work)
echo "\n=== 1. SimpleTestToken ==="
deploy_contract "contracts/SimpleTestToken.sol" "SimpleTestToken" "1000000000000000000000000"

# 2. Deploy basic utility contracts
echo "\n=== 2. Oracle ==="
deploy_contract "contracts/Oracle.sol" "Oracle"

echo "\n=== 3. Treasury ==="
deploy_contract "contracts/Treasury.sol" "Treasury"

echo "\n=== 4. RiskEngine ==="
deploy_contract "contracts/RiskEngine.sol" "RiskEngine"

echo "\n=== 5. LendingMarket ==="
deploy_contract "contracts/LendingMarket.sol" "LendingMarket"

echo "\n=== 6. Governance ==="
deploy_contract "contracts/Governance.sol" "Governance"

echo "\n=== 7. Analytics ==="
deploy_contract "contracts/Analytics.sol" "Analytics"

echo "\n=== 8. Insurance ==="
deploy_contract "contracts/Insurance.sol" "Insurance"

echo "\n=== 9. Compliance ==="
deploy_contract "contracts/Compliance.sol" "Compliance"

echo "\n=== 10. RevenueModel ==="
deploy_contract "contracts/RevenueModel.sol" "RevenueModel"

echo "\n=== 11. StCOREToken ==="
deploy_contract "contracts/StCOREToken.sol" "StCOREToken"

echo "\n=== 12. Timelock ==="
deploy_contract "contracts/Timelock.sol" "Timelock"

# Try to deploy core contracts (might have compilation issues)
echo "\n=== Core Contracts (Advanced) ==="
echo "⚠️  Note: These might have compilation conflicts"

echo "\n=== 13. InfiniteLiquidityEngine ==="
forge create "contracts/core/InfiniteLiquidityEngine.sol:InfiniteLiquidityEngine" \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast 2>&1 | tee -a $LOG_FILE || echo "❌ InfiniteLiquidityEngine failed (expected due to compilation issues)"

echo "\n=== 14. LiquidityPool ==="
forge create "contracts/core/LiquidityPool.sol:LiquidityPool" \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast 2>&1 | tee -a $LOG_FILE || echo "❌ LiquidityPool failed (expected due to compilation issues)"

# Run tests
echo "\n🧪 Running test suite..."
forge test --gas-report 2>&1 | tee -a $LOG_FILE

# Generate reports
echo "\n📊 Generating reports..."
forge coverage --report lcov 2>&1 | tee -a $LOG_FILE

# Summary
echo "\n📋 === DEPLOYMENT SUMMARY ==="
echo "📅 Completed at: $(date)"
echo "📝 Full log: $LOG_FILE"
echo "🔍 Check deployed contracts on: https://scan.test.btcs.network"

# Extract contract addresses from log
echo "\n📍 Deployed Contract Addresses:"
grep -E "Deployed to:" $LOG_FILE || echo "No successful deployments found in log"

echo "\n✅ Deployment script completed!"
echo "\n🎯 For hackathon submission:"
echo "   1. Check $LOG_FILE for all deployment details"
echo "   2. Verify contracts on Core testnet explorer"
echo "   3. Document gas usage and test results"
echo "   4. Create transaction proof screenshots"

echo "\n🔗 Useful links:"
echo "   Explorer: https://scan.test.btcs.network"
echo "   Faucet: https://scan.test.btcs.network/faucet"
echo "   RPC: $RPC_URL"