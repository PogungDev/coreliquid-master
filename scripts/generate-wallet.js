const { ethers } = require('ethers');
const fs = require('fs');

async function generateWallet() {
    console.log("\n🔐 === Wallet Generator untuk CoreLiquid Testing ===");
    
    try {
        // Generate new random wallet
        const wallet = ethers.Wallet.createRandom();
        
        console.log("\n✅ New wallet generated successfully!");
        console.log("\n📋 === WALLET DETAILS ===");
        console.log(`🏠 Address: ${wallet.address}`);
        console.log(`🔑 Private Key: ${wallet.privateKey}`);
        console.log(`🎲 Mnemonic: ${wallet.mnemonic.phrase}`);
        
        // Save to .env file
        const envContent = `# CoreLiquid Testing Environment\nPRIVATE_KEY=${wallet.privateKey}\nWALLET_ADDRESS=${wallet.address}\nCORE_TESTNET_RPC=https://rpc.test.btcs.network\nCHAIN_ID=1115\n`;
        
        fs.writeFileSync('.env', envContent);
        console.log("\n💾 Wallet details saved to .env file");
        
        // Create wallet info file
        const walletInfo = {
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: wallet.mnemonic.phrase,
            network: "Core Testnet",
            rpc: "https://rpc.test.btcs.network",
            chainId: 1115,
            generated: new Date().toISOString()
        };
        
        fs.writeFileSync('wallet-info.json', JSON.stringify(walletInfo, null, 2));
        console.log("📄 Detailed wallet info saved to wallet-info.json");
        
        console.log("\n🚨 === SECURITY WARNING ===");
        console.log("⚠️  NEVER share your private key with anyone!");
        console.log("⚠️  NEVER commit private key to git repository!");
        console.log("⚠️  This is for TESTNET only - don't use for mainnet!");
        
        console.log("\n💰 === NEXT STEPS ===");
        console.log("1. Fund this address with tCORE from faucet:");
        console.log(`   🌐 https://scan.test.btcs.network/faucet`);
        console.log(`   📍 Address: ${wallet.address}`);
        
        console.log("\n2. Check balance:");
        console.log(`   cast balance ${wallet.address} --rpc-url https://rpc.test.btcs.network`);
        
        console.log("\n3. Deploy contracts:");
        console.log(`   export PRIVATE_KEY=${wallet.privateKey}`);
        console.log(`   ./scripts/deploy-all-contracts.sh`);
        
        console.log("\n4. Or deploy individual contract:");
        console.log(`   forge create contracts/SimpleTestToken.sol:SimpleTestToken \\`);
        console.log(`     --rpc-url https://rpc.test.btcs.network \\`);
        console.log(`     --constructor-args 1000000000000000000000000 \\`);
        console.log(`     --private-key ${wallet.privateKey} \\`);
        console.log(`     --broadcast`);
        
        console.log("\n🔍 === MONITORING ===");
        console.log(`📊 Explorer: https://scan.test.btcs.network/address/${wallet.address}`);
        console.log(`💧 Faucet: https://scan.test.btcs.network/faucet`);
        
        console.log("\n🎯 === FOR HACKATHON ===");
        console.log("Document these for submission:");
        console.log(`- Wallet Address: ${wallet.address}`);
        console.log("- All deployed contract addresses");
        console.log("- Transaction hashes");
        console.log("- Test results and gas reports");
        
    } catch (error) {
        console.error("❌ Error generating wallet:", error.message);
        process.exit(1);
    }
}

// Alternative: Use existing address if provided
function useExistingAddress() {
    const existingAddress = "0x22A196A5D71B30542a9EEd349BE98DE352Fdb565";
    
    console.log("\n🔄 === Using Existing Address ===");
    console.log(`📍 Address: ${existingAddress}`);
    console.log(`💰 Balance: 1 tCORE (confirmed)`);
    
    console.log("\n⚠️  You need to provide the private key for this address:");
    console.log("1. If you have the private key, set it in .env:");
    console.log(`   PRIVATE_KEY=your_private_key_here`);
    console.log(`   WALLET_ADDRESS=${existingAddress}`);
    
    console.log("\n2. Then run deployment:");
    console.log(`   export PRIVATE_KEY=your_private_key_here`);
    console.log(`   ./scripts/deploy-all-contracts.sh`);
    
    console.log("\n💡 If you don't have the private key, generate a new wallet instead.");
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--existing')) {
    useExistingAddress();
} else {
    console.log("\n🤔 Choose an option:");
    console.log("1. Generate NEW wallet: node scripts/generate-wallet.js");
    console.log("2. Use EXISTING address: node scripts/generate-wallet.js --existing");
    
    if (args.length === 0) {
        generateWallet();
    }
}

console.log("\n✨ Wallet setup completed!");