const hre = require("hardhat");
const { ethers } = hre;
const fs = require('fs');

// Contract addresses will be stored here after deployment
let deployedContracts = {};

async function main() {
    console.log("\n🚀 === CoreLiquid Complete Smart Contract Testing ===");
    console.log("📅 Started at:", new Date().toISOString());
    
    // Check if we have a funded address
    const targetAddress = "0x22A196A5D71B30542a9EEd349BE98DE352Fdb565";
    console.log(`\n🔍 Checking address: ${targetAddress}`);
    
    try {
        // Note: This script provides instructions since we need private key
        console.log("\n📋 === TESTING CHECKLIST ===");
        
        console.log("\n1️⃣ SETUP PRIVATE KEY");
        console.log("   Set your private key in .env file:");
        console.log("   PRIVATE_KEY=your_private_key_here");
        
        console.log("\n2️⃣ CONTRACTS TO TEST:");
        const contractsToTest = [
            "SimpleTestToken.sol - Basic ERC20 token",
            "Oracle.sol - Price oracle system", 
            "RiskEngine.sol - Risk management",
            "LendingMarket.sol - Lending functionality",
            "Treasury.sol - Treasury management",
            "Governance.sol - Governance system",
            "Analytics.sol - Analytics tracking",
            "Insurance.sol - Insurance coverage",
            "Compliance.sol - Compliance checks",
            "RevenueModel.sol - Revenue distribution",
            "StCOREToken.sol - Staked CORE token",
            "Timelock.sol - Time-locked operations"
        ];
        
        contractsToTest.forEach((contract, index) => {
            console.log(`   ${index + 1}. ${contract}`);
        });
        
        console.log("\n3️⃣ DEPLOYMENT COMMANDS:");
        console.log("\n   🔧 Using Forge (Recommended):");
        
        const deployCommands = [
            {
                name: "SimpleTestToken",
                command: "forge create contracts/SimpleTestToken.sol:SimpleTestToken --rpc-url https://rpc.test.btcs.network --constructor-args 1000000000000000000000000 --private-key $PRIVATE_KEY --broadcast"
            },
            {
                name: "Oracle", 
                command: "forge create contracts/Oracle.sol:Oracle --rpc-url https://rpc.test.btcs.network --private-key $PRIVATE_KEY --broadcast"
            },
            {
                name: "RiskEngine",
                command: "forge create contracts/RiskEngine.sol:RiskEngine --rpc-url https://rpc.test.btcs.network --private-key $PRIVATE_KEY --broadcast"
            },
            {
                name: "Treasury",
                command: "forge create contracts/Treasury.sol:Treasury --rpc-url https://rpc.test.btcs.network --private-key $PRIVATE_KEY --broadcast"
            },
            {
                name: "LendingMarket",
                command: "forge create contracts/LendingMarket.sol:LendingMarket --rpc-url https://rpc.test.btcs.network --private-key $PRIVATE_KEY --broadcast"
            }
        ];
        
        deployCommands.forEach((cmd, index) => {
            console.log(`\n   ${index + 1}. Deploy ${cmd.name}:`);
            console.log(`      ${cmd.command}`);
        });
        
        console.log("\n4️⃣ TESTING COMMANDS:");
        console.log("\n   📊 Run Unit Tests:");
        console.log("      forge test -vvv");
        
        console.log("\n   📈 Run with Gas Report:");
        console.log("      forge test --gas-report");
        
        console.log("\n   📋 Run Coverage Report:");
        console.log("      forge coverage");
        
        console.log("\n   🔍 Test Specific Contract:");
        console.log("      forge test --match-contract [ContractName]Test -vvv");
        
        console.log("\n5️⃣ INTEGRATION TESTING:");
        console.log("\n   🔗 Deploy All via Script:");
        console.log("      forge script script/Deploy.s.sol:Deploy --rpc-url https://rpc.test.btcs.network --private-key $PRIVATE_KEY --broadcast");
        
        console.log("\n   🎯 Real Deployment Script:");
        console.log("      forge script script/RealDeploy.s.sol:RealDeploy --rpc-url https://rpc.test.btcs.network --private-key $PRIVATE_KEY --broadcast");
        
        console.log("\n   🤝 Interaction Testing:");
        console.log("      forge script script/Interact.s.sol:Interact --rpc-url https://rpc.test.btcs.network --private-key $PRIVATE_KEY --broadcast");
        
        console.log("\n6️⃣ MONITORING & VERIFICATION:");
        console.log("\n   📊 Check Balance:");
        console.log(`      cast balance ${targetAddress} --rpc-url https://rpc.test.btcs.network`);
        
        console.log("\n   🔍 Check Contract:");
        console.log("      cast code [CONTRACT_ADDRESS] --rpc-url https://rpc.test.btcs.network");
        
        console.log("\n   📱 Explorer Links:");
        console.log(`      Address: https://scan.test.btcs.network/address/${targetAddress}`);
        console.log("      Faucet: https://scan.test.btcs.network/faucet");
        
        console.log("\n7️⃣ AUTOMATED TEST SCRIPT:");
        console.log("\n   Create and run automated deployment:");
        console.log("      node scripts/deploy-all-contracts.js");
        
        console.log("\n✅ === READY FOR COMPREHENSIVE TESTING ===");
        console.log("\n📝 Next Steps:");
        console.log("   1. Set PRIVATE_KEY in .env file");
        console.log("   2. Fund address with tCORE from faucet");
        console.log("   3. Run deployment commands above");
        console.log("   4. Execute test suite");
        console.log("   5. Monitor results on Core testnet explorer");
        
        console.log("\n🎯 For hackathon submission, document:");
        console.log("   - All deployed contract addresses");
        console.log("   - Transaction hashes");
        console.log("   - Test results and coverage");
        console.log("   - Gas usage reports");
        
    } catch (error) {
        console.error("❌ Error during testing setup:", error.message);
    }
    
    console.log("\n🏁 Testing guide completed at:", new Date().toISOString());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Fatal error:", error);
        process.exit(1);
    });