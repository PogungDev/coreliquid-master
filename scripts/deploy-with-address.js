console.log("\n=== Core Testnet SimpleTestToken Deployment ===");

// Target address with 1 tCORE balance
const targetAddress = "0x22A196A5D71B30542a9EEd349BE98DE352Fdb565";

console.log(`Target address: ${targetAddress}`);
console.log(`Balance: 1 tCORE (confirmed via cast balance)`);

console.log("\n✅ Address has sufficient balance for deployment");
console.log("\n📝 To deploy the SimpleTestToken contract, run this command:");
console.log("\n🔧 Using Forge (recommended):");
console.log(`forge create contracts/SimpleTestToken.sol:SimpleTestToken \\`);
console.log(`  --rpc-url https://rpc.test.btcs.network \\`);
console.log(`  --constructor-args 1000000000000000000000000 \\`);
console.log(`  --private-key YOUR_PRIVATE_KEY \\`);
console.log(`  --broadcast`);

console.log("\n📋 Constructor args explanation:");
console.log(`  - 1000000000000000000000000 = 1,000,000 tokens (18 decimals)`);

console.log("\n🔗 Useful links:");
console.log(`📊 Explorer: https://scan.test.btcs.network/address/${targetAddress}`);
console.log(`💧 Faucet: https://scan.test.btcs.network/faucet`);
console.log(`🌐 Core Testnet RPC: https://rpc.test.btcs.network`);

console.log("\n⚠️  Note: Replace YOUR_PRIVATE_KEY with the actual private key for the address above");
console.log("\n🎯 After deployment, you'll get the contract address to interact with your token!");