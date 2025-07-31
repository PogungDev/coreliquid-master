const { ethers } = require("hardhat");

async function main() {
    console.log("\n=== Core Testnet SimpleTestToken Deployment ===");
    
    // Get deployer account
    // Use the funded address
    const privateKey = "0x22A196A5D71B30542a9EEd349BE98DE352Fdb565";
    const provider = new ethers.providers.JsonRpcProvider("https://rpc.test.btcs.network");
    const deployer = new ethers.Wallet(privateKey, provider);
    const deployerAddress = await deployer.getAddress();
    const balance = await deployer.getBalance();
    
    console.log("\n📋 Deployment Info:");
    console.log(`Deployer: ${deployerAddress}`);
    console.log(`Balance: ${ethers.utils.formatEther(balance)} CORE`);
    console.log(`Network: ${hre.network.name}`);
    console.log(`Chain ID: ${hre.network.config.chainId}`);
    console.log(`RPC URL: ${hre.network.config.url}`);
    
    if (balance.eq(0)) {
        console.log("\n⚠️  No CORE tokens found!");
        console.log("Please get testnet CORE from faucet:");
        console.log("🚰 Core Testnet Faucet: https://scan.test.btcs.network/faucet");
        console.log("📋 Your address:", deployerAddress);
        return;
    }
    
    // Contract parameters
    const initialSupply = ethers.utils.parseUnits("1000000", 18); // 1M tokens
    
    console.log("\n🚀 Deploying SimpleTestToken...");
    console.log(`Initial Supply: ${ethers.utils.formatUnits(initialSupply, 18)} CLT`);
    
    try {
        // Deploy contract
        const SimpleTestToken = await ethers.getContractFactory("SimpleTestToken");
        const token = await SimpleTestToken.deploy(initialSupply, {
            gasLimit: 3000000
        });
        
        console.log("\n⏳ Waiting for deployment...");
        await token.deployed();
        
        const contractAddress = token.address;
        const deployTxHash = token.deployTransaction.hash;
        
        console.log("\n✅ Deployment Successful!");
        console.log(`Contract Address: ${contractAddress}`);
        console.log(`Deploy Transaction: ${deployTxHash}`);
        
        // Verify deployment by calling contract functions
        console.log("\n🔍 Verifying deployment...");
        const info = await token.getInfo();
        const deployerBalance = await token.balanceOf(deployerAddress);
        
        console.log(`Contract Name: ${info[0]}`);
        console.log(`Contract Symbol: ${info[1]}`);
        console.log(`Contract Decimals: ${info[2]}`);
        console.log(`Total Supply: ${ethers.utils.formatUnits(info[3], info[2])} ${info[1]}`);
        console.log(`Owner: ${info[4]}`);
        console.log(`Deployer Balance: ${ethers.utils.formatUnits(deployerBalance, info[2])} ${info[1]}`);
        
        // Test mint function
        console.log("\n🪙 Testing mint function...");
        const mintAmount = ethers.utils.parseUnits("10000", 18);
        const mintTx = await token.mint(deployerAddress, mintAmount, {
            gasLimit: 100000
        });
        await mintTx.wait();
        
        const newBalance = await token.balanceOf(deployerAddress);
        const newTotalSupply = await token.totalSupply();
        
        console.log(`Mint Transaction: ${mintTx.hash}`);
        console.log(`New Deployer Balance: ${ethers.utils.formatUnits(newBalance, 18)} CLT`);
        console.log(`New Total Supply: ${ethers.utils.formatUnits(newTotalSupply, 18)} CLT`);
        
        // Test transfer function
        console.log("\n💸 Testing transfer function...");
        const transferAmount = ethers.utils.parseUnits("1000", 18);
        const randomAddress = ethers.Wallet.createRandom().address;
        const transferTx = await token.transfer(randomAddress, transferAmount, {
            gasLimit: 100000
        });
        await transferTx.wait();
        
        const recipientBalance = await token.balanceOf(randomAddress);
        const finalDeployerBalance = await token.balanceOf(deployerAddress);
        
        console.log(`Transfer Transaction: ${transferTx.hash}`);
        console.log(`Transferred to: ${randomAddress}`);
        console.log(`Recipient Balance: ${ethers.utils.formatUnits(recipientBalance, 18)} CLT`);
        console.log(`Final Deployer Balance: ${ethers.utils.formatUnits(finalDeployerBalance, 18)} CLT`);
        
        // Explorer links
        console.log("\n🔗 Core Testnet Explorer Links:");
        console.log(`Contract: https://scan.test.btcs.network/address/${contractAddress}`);
        console.log(`Deploy Tx: https://scan.test.btcs.network/tx/${deployTxHash}`);
        console.log(`Mint Tx: https://scan.test.btcs.network/tx/${mintTx.hash}`);
        console.log(`Transfer Tx: https://scan.test.btcs.network/tx/${transferTx.hash}`);
        
        console.log("\n🎉 Deployment completed successfully!");
        console.log("\n📝 Summary:");
        console.log(`- Contract deployed at: ${contractAddress}`);
        console.log(`- Total supply: ${ethers.utils.formatUnits(newTotalSupply, 18)} CLT`);
        console.log(`- Deployer owns: ${ethers.utils.formatUnits(finalDeployerBalance, 18)} CLT`);
        console.log(`- Network: Core Testnet (Chain ID: ${hre.network.config.chainId})`);
        console.log(`- Explorer: https://scan.test.btcs.network/address/${contractAddress}`);
        
        // Save deployment info
        const deploymentInfo = {
            contractAddress,
            deployTxHash,
            mintTxHash: mintTx.hash,
            transferTxHash: transferTx.hash,
            deployer: deployerAddress,
            network: hre.network.name,
            chainId: hre.network.config.chainId,
            timestamp: new Date().toISOString()
        };
        
        console.log("\n💾 Deployment info saved:");
        console.log(JSON.stringify(deploymentInfo, null, 2));
        
    } catch (error) {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Script failed:");
        console.error(error);
        process.exit(1);
    });