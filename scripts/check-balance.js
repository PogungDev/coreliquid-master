const { ethers } = require("hardhat");

async function main() {
    console.log("\n=== Core Testnet Balance Check ===");
    
    const [signer] = await ethers.getSigners();
    const address = await signer.getAddress();
    const balance = await signer.getBalance();
    
    console.log("\n📋 Account Info:");
    console.log(`Address: ${address}`);
    console.log(`Balance: ${ethers.utils.formatEther(balance)} CORE`);
    console.log(`Network: ${hre.network.name}`);
    console.log(`Chain ID: ${hre.network.config.chainId}`);
    console.log(`RPC URL: ${hre.network.config.url}`);
    
    if (balance.eq(0)) {
        console.log("\n⚠️  No CORE tokens found!");
        console.log("\n🚰 Get testnet CORE from faucet:");
        console.log(`📋 Faucet URL: https://scan.test.btcs.network/faucet`);
        console.log(`📋 Your address: ${address}`);
        console.log("\n💡 Steps:");
        console.log("1. Visit the faucet URL above");
        console.log("2. Enter your address");
        console.log("3. Request testnet CORE tokens");
        console.log("4. Wait for the transaction to confirm");
        console.log("5. Run this script again to verify");
    } else {
        console.log("\n✅ Account has sufficient balance for deployment!");
        console.log(`💰 Available: ${ethers.utils.formatEther(balance)} CORE`);
        
        // Estimate gas cost for deployment
        const estimatedGasCost = ethers.utils.parseUnits("0.01", "ether"); // Rough estimate
        if (balance.gt(estimatedGasCost)) {
            console.log(`✅ Sufficient for deployment (estimated cost: ~0.01 CORE)`);
        } else {
            console.log(`⚠️  Balance might be low for deployment (estimated cost: ~0.01 CORE)`);
        }
    }
    
    console.log("\n🔗 Useful Links:");
    console.log(`Explorer: https://scan.test.btcs.network/address/${address}`);
    console.log(`Faucet: https://scan.test.btcs.network/faucet`);
}

main().catch(console.error);