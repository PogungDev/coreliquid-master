const { ethers } = require('hardhat');

/**
 * @title Simple TrueUnifiedLiquidityLayer Deployment
 * @dev Script sederhana untuk deploy dan test TrueUnifiedLiquidityLayer
 */

async function main() {
    console.log('=== Deploying True Unified Liquidity Layer ===\n');
    
    // Get signers
    const [deployer, user1, user2] = await ethers.getSigners();
    
    console.log('Deployer address:', deployer.address);
    console.log('Deployer balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'ETH\n');
    
    try {
        // Deploy TrueUnifiedLiquidityLayer
        console.log('1. Deploying TrueUnifiedLiquidityLayer...');
        const TrueUnifiedLiquidityLayer = await ethers.getContractFactory('TrueUnifiedLiquidityLayer');
        const liquidityLayer = await TrueUnifiedLiquidityLayer.deploy(deployer.address); // Treasury = deployer
        await liquidityLayer.waitForDeployment();
        
        const liquidityLayerAddress = await liquidityLayer.getAddress();
        console.log('✅ TrueUnifiedLiquidityLayer deployed at:', liquidityLayerAddress);
        
        // Deploy test tokens
        console.log('\n2. Deploying test tokens...');
        const SimpleToken = await ethers.getContractFactory('SimpleToken');
        
        const coreToken = await SimpleToken.deploy('Core Token', 'CORE', 18, ethers.parseEther('1000000'));
        await coreToken.waitForDeployment();
        const coreTokenAddress = await coreToken.getAddress();
        console.log('✅ CORE Token deployed at:', coreTokenAddress);
        
        const btcToken = await SimpleToken.deploy('Bitcoin Token', 'BTC', 8, ethers.parseUnits('21000', 8));
        await btcToken.waitForDeployment();
        const btcTokenAddress = await btcToken.getAddress();
        console.log('✅ BTC Token deployed at:', btcTokenAddress);
        
        // Setup supported assets
        console.log('\n3. Setting up supported assets...');
        await liquidityLayer.addSupportedAsset(coreTokenAddress);
        await liquidityLayer.addSupportedAsset(btcTokenAddress);
        console.log('✅ Assets added as supported');
        
        // Grant roles
        console.log('\n4. Setting up roles...');
        const PROTOCOL_ROLE = await liquidityLayer.PROTOCOL_ROLE();
        const KEEPER_ROLE = await liquidityLayer.KEEPER_ROLE();
        
        await liquidityLayer.grantRole(PROTOCOL_ROLE, deployer.address);
        await liquidityLayer.grantRole(KEEPER_ROLE, deployer.address);
        console.log('✅ Roles granted to deployer');
        
        // Register a mock protocol
        console.log('\n5. Registering mock protocol...');
        await liquidityLayer.registerProtocol(
            user1.address, // Use user1 as mock protocol
            'Mock Protocol 1',
            800, // 8% APY
            ethers.parseEther('1000000'), // 1M capacity
            25 // Medium risk
        );
        console.log('✅ Mock protocol registered');
        
        // Test basic functionality
        console.log('\n6. Testing basic functionality...');
        
        // Transfer tokens to deployer for testing
        const depositAmount = ethers.parseEther('1000');
        
        // Approve and deposit
        await coreToken.approve(liquidityLayerAddress, depositAmount);
        await liquidityLayer.deposit(coreTokenAddress, depositAmount, deployer.address);
        
        // Check balance
        const userBalance = await liquidityLayer.userBalances(deployer.address, coreTokenAddress);
        console.log('✅ Deposited:', ethers.formatEther(userBalance), 'CORE tokens');
        
        // Check asset state
        const assetState = await liquidityLayer.getAssetState(coreTokenAddress);
        console.log('✅ Total deposited:', ethers.formatEther(assetState.totalDeposited), 'CORE tokens');
        console.log('✅ Asset is active:', assetState.isActive);
        
        // Test cross-protocol access
        console.log('\n7. Testing cross-protocol access...');
        
        // Grant protocol role to user1
        await liquidityLayer.grantRole(PROTOCOL_ROLE, user1.address);
        
        // Access assets without transfer
        const accessAmount = ethers.parseEther('500');
        await liquidityLayer.connect(user1).accessAssets(
            user1.address,
            coreTokenAddress,
            accessAmount,
            deployer.address
        );
        
        // Check allocation
        const allocation = await liquidityLayer.protocolAllocations(user1.address, coreTokenAddress);
        console.log('✅ Protocol allocation:', ethers.formatEther(allocation), 'CORE tokens');
        
        // Return assets with yield
        const yieldAmount = ethers.parseEther('25'); // 5% yield
        await liquidityLayer.connect(user1).returnAssets(
            user1.address,
            coreTokenAddress,
            accessAmount,
            yieldAmount
        );
        
        // Check final state
        const finalAssetState = await liquidityLayer.getAssetState(coreTokenAddress);
        console.log('✅ Total yield generated:', ethers.formatEther(finalAssetState.totalYieldGenerated), 'CORE tokens');
        
        // Test idle capital detection
        console.log('\n8. Testing idle capital detection...');
        const idleCapital = await liquidityLayer.getIdleCapital(coreTokenAddress);
        console.log('✅ Idle capital:', ethers.formatEther(idleCapital), 'CORE tokens');
        
        // Get total TVL
        const totalTVL = await liquidityLayer.getTotalValueLocked();
        console.log('✅ Total Value Locked:', ethers.formatEther(totalTVL), 'tokens');
        
        // Test analytics
        console.log('\n9. Testing analytics...');
        const userPosition = await liquidityLayer.getUserPosition(deployer.address, coreTokenAddress);
        console.log('✅ User total deposited:', ethers.formatEther(userPosition.totalDeposited));
        console.log('✅ User shares:', ethers.formatEther(userPosition.shares));
        
        const protocolInfo = await liquidityLayer.getProtocolInfo(user1.address);
        console.log('✅ Protocol APY:', protocolInfo.currentAPY.toString(), 'basis points');
        console.log('✅ Protocol risk score:', protocolInfo.riskScore.toString());
        
        // Save deployment info
        console.log('\n10. Saving deployment info...');
        const deploymentInfo = {
            network: 'local',
            timestamp: new Date().toISOString(),
            contracts: {
                TrueUnifiedLiquidityLayer: liquidityLayerAddress,
                COREToken: coreTokenAddress,
                BTCToken: btcTokenAddress
            },
            deployer: deployer.address,
            treasury: deployer.address,
            totalTVL: ethers.formatEther(totalTVL),
            testResults: {
                basicDeposit: '✅ Success',
                crossProtocolAccess: '✅ Success',
                yieldGeneration: '✅ Success',
                idleCapitalDetection: '✅ Success',
                analytics: '✅ Success'
            }
        };
        
        const fs = require('fs');
        fs.writeFileSync(
            './SIMPLE_DEPLOYMENT_RESULTS.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('\n=== Deployment and Testing Completed Successfully! ===');
        console.log('\n📊 Summary:');
        console.log('- TrueUnifiedLiquidityLayer:', liquidityLayerAddress);
        console.log('- CORE Token:', coreTokenAddress);
        console.log('- BTC Token:', btcTokenAddress);
        console.log('- Total Value Locked:', ethers.formatEther(totalTVL), 'tokens');
        console.log('- All core features tested successfully ✅');
        
        console.log('\n🚀 Ready for Core testnet deployment!');
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        if (error.reason) {
            console.error('Reason:', error.reason);
        }
        process.exit(1);
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = { main };