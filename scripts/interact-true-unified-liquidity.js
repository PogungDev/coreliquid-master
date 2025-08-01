const { ethers } = require('hardhat');
const fs = require('fs');

/**
 * @title TrueUnifiedLiquidityLayer Interaction Script
 * @dev Script untuk berinteraksi dengan TrueUnifiedLiquidityLayer yang sudah di-deploy
 * @notice Mendemonstrasikan semua fitur utama dari True Unified Liquidity Layer
 */

// Contract addresses (update setelah deployment)
const CONTRACTS = {
    liquidityLayer: '', // Will be filled from deployment
    coreToken: '',
    btcToken: '',
    ethToken: '',
    usdcToken: ''
};

// Demo configuration
const DEMO_CONFIG = {
    depositAmount: ethers.parseEther('1000'), // 1000 tokens
    smallAmount: ethers.parseEther('100'),    // 100 tokens
    largeAmount: ethers.parseEther('5000'),   // 5000 tokens
    yieldAmount: ethers.parseEther('50'),     // 50 tokens yield
};

async function main() {
    console.log('=== True Unified Liquidity Layer Interaction Demo ===\n');
    
    // Get signers
    const [deployer, user1, user2, protocol1, protocol2] = await ethers.getSigners();
    
    console.log('Accounts:');
    console.log('- Deployer:', deployer.address);
    console.log('- User 1:', user1.address);
    console.log('- User 2:', user2.address);
    console.log('- Protocol 1:', protocol1.address);
    console.log('- Protocol 2:', protocol2.address);
    console.log();
    
    // Load contract addresses from deployment
    await loadContractAddresses();
    
    // Get contract instances
    const contracts = await getContractInstances();
    
    // Demo scenarios
    await demoBasicDepositsAndWithdrawals(contracts, user1, user2, protocol1);
    await demoCrossProtocolAssetSharing(contracts, user1, protocol1, protocol2);
    await demoAutomaticRebalancing(contracts, deployer, user1, protocol1);
    await demoYieldDistribution(contracts, user1, protocol1, protocol2);
    await demoEmergencyFunctions(contracts, deployer);
    await demoAnalyticsAndReporting(contracts);
    
    console.log('\n=== Demo Completed Successfully! ===');
}

async function loadContractAddresses() {
    try {
        // Try to load from deployment info file
        if (fs.existsSync('./DEPLOYMENT_INFO.md')) {
            const deploymentInfo = fs.readFileSync('./DEPLOYMENT_INFO.md', 'utf8');
            
            // Extract addresses using regex
            const liquidityLayerMatch = deploymentInfo.match(/TrueUnifiedLiquidityLayer: (0x[a-fA-F0-9]{40})/);
            const coreTokenMatch = deploymentInfo.match(/CORE Token: (0x[a-fA-F0-9]{40})/);
            const btcTokenMatch = deploymentInfo.match(/BTC Token: (0x[a-fA-F0-9]{40})/);
            const ethTokenMatch = deploymentInfo.match(/ETH Token: (0x[a-fA-F0-9]{40})/);
            const usdcTokenMatch = deploymentInfo.match(/USDC Token: (0x[a-fA-F0-9]{40})/);
            
            if (liquidityLayerMatch) CONTRACTS.liquidityLayer = liquidityLayerMatch[1];
            if (coreTokenMatch) CONTRACTS.coreToken = coreTokenMatch[1];
            if (btcTokenMatch) CONTRACTS.btcToken = btcTokenMatch[1];
            if (ethTokenMatch) CONTRACTS.ethToken = ethTokenMatch[1];
            if (usdcTokenMatch) CONTRACTS.usdcToken = usdcTokenMatch[1];
            
            console.log('Loaded contract addresses from DEPLOYMENT_INFO.md');
        } else {
            console.log('DEPLOYMENT_INFO.md not found, using placeholder addresses');
            // Use placeholder addresses for demo
            CONTRACTS.liquidityLayer = '0x1234567890123456789012345678901234567890';
            CONTRACTS.coreToken = '0x2345678901234567890123456789012345678901';
            CONTRACTS.btcToken = '0x3456789012345678901234567890123456789012';
            CONTRACTS.ethToken = '0x4567890123456789012345678901234567890123';
            CONTRACTS.usdcToken = '0x5678901234567890123456789012345678901234';
        }
        
        console.log('Contract Addresses:');
        console.log('- TrueUnifiedLiquidityLayer:', CONTRACTS.liquidityLayer);
        console.log('- CORE Token:', CONTRACTS.coreToken);
        console.log('- BTC Token:', CONTRACTS.btcToken);
        console.log('- ETH Token:', CONTRACTS.ethToken);
        console.log('- USDC Token:', CONTRACTS.usdcToken);
        console.log();
        
    } catch (error) {
        console.error('Error loading contract addresses:', error.message);
        process.exit(1);
    }
}

async function getContractInstances() {
    const TrueUnifiedLiquidityLayer = await ethers.getContractFactory('TrueUnifiedLiquidityLayer');
    const SimpleToken = await ethers.getContractFactory('SimpleToken');
    
    return {
        liquidityLayer: TrueUnifiedLiquidityLayer.attach(CONTRACTS.liquidityLayer),
        coreToken: SimpleToken.attach(CONTRACTS.coreToken),
        btcToken: SimpleToken.attach(CONTRACTS.btcToken),
        ethToken: SimpleToken.attach(CONTRACTS.ethToken),
        usdcToken: SimpleToken.attach(CONTRACTS.usdcToken)
    };
}

async function demoBasicDepositsAndWithdrawals(contracts, user1, user2, protocol1) {
    console.log('=== Demo 1: Basic Deposits and Withdrawals ===');
    
    try {
        // Grant protocol role to protocol1
        await contracts.liquidityLayer.grantRole(
            await contracts.liquidityLayer.PROTOCOL_ROLE(),
            protocol1.address
        );
        
        // Transfer tokens to protocol1 for deposits
        await contracts.coreToken.transfer(protocol1.address, DEMO_CONFIG.depositAmount * 2n);
        
        // User 1 deposit CORE tokens
        console.log('\n1. User 1 depositing CORE tokens...');
        await contracts.coreToken.connect(protocol1).approve(
            CONTRACTS.liquidityLayer,
            DEMO_CONFIG.depositAmount
        );
        
        const depositTx = await contracts.liquidityLayer.connect(protocol1).deposit(
            CONTRACTS.coreToken,
            DEMO_CONFIG.depositAmount,
            user1.address
        );
        await depositTx.wait();
        
        // Check user balance
        const userBalance = await contracts.liquidityLayer.userBalances(user1.address, CONTRACTS.coreToken);
        console.log('User 1 CORE balance:', ethers.formatEther(userBalance));
        
        // Check asset state
        const assetState = await contracts.liquidityLayer.getAssetState(CONTRACTS.coreToken);
        console.log('Total deposited:', ethers.formatEther(assetState.totalDeposited));
        console.log('Asset is active:', assetState.isActive);
        
        // User 2 deposit (different amount)
        console.log('\n2. User 2 depositing CORE tokens...');
        await contracts.coreToken.connect(protocol1).approve(
            CONTRACTS.liquidityLayer,
            DEMO_CONFIG.depositAmount / 2n
        );
        
        await contracts.liquidityLayer.connect(protocol1).deposit(
            CONTRACTS.coreToken,
            DEMO_CONFIG.depositAmount / 2n,
            user2.address
        );
        
        const user2Balance = await contracts.liquidityLayer.userBalances(user2.address, CONTRACTS.coreToken);
        console.log('User 2 CORE balance:', ethers.formatEther(user2Balance));
        
        // Partial withdrawal
        console.log('\n3. User 1 partial withdrawal...');
        const withdrawAmount = DEMO_CONFIG.depositAmount / 4n;
        
        await contracts.liquidityLayer.connect(protocol1).withdraw(
            CONTRACTS.coreToken,
            withdrawAmount,
            user1.address
        );
        
        const newUserBalance = await contracts.liquidityLayer.userBalances(user1.address, CONTRACTS.coreToken);
        console.log('User 1 CORE balance after withdrawal:', ethers.formatEther(newUserBalance));
        
        // Check total TVL
        const totalTVL = await contracts.liquidityLayer.getTotalValueLocked();
        console.log('Total Value Locked:', ethers.formatEther(totalTVL));
        
        console.log('✅ Basic deposits and withdrawals completed successfully!');
        
    } catch (error) {
        console.error('❌ Error in basic deposits and withdrawals:', error.message);
    }
}

async function demoCrossProtocolAssetSharing(contracts, user1, protocol1, protocol2) {
    console.log('\n=== Demo 2: Cross-Protocol Asset Sharing ===');
    
    try {
        // Grant protocol role to protocol2
        await contracts.liquidityLayer.grantRole(
            await contracts.liquidityLayer.PROTOCOL_ROLE(),
            protocol2.address
        );
        
        // Register protocol2 if not already registered
        try {
            await contracts.liquidityLayer.registerProtocol(
                protocol2.address,
                'Demo Protocol 2',
                1000, // 10% APY
                ethers.parseEther('1000000'), // 1M capacity
                30 // Medium risk
            );
            console.log('Protocol 2 registered successfully');
        } catch (error) {
            console.log('Protocol 2 already registered or registration failed');
        }
        
        // Check user balance before access
        const userBalanceBefore = await contracts.liquidityLayer.userBalances(user1.address, CONTRACTS.coreToken);
        console.log('\n1. User 1 balance before protocol access:', ethers.formatEther(userBalanceBefore));
        
        // Protocol 2 accesses user's assets WITHOUT token transfer
        const accessAmount = DEMO_CONFIG.smallAmount;
        console.log('\n2. Protocol 2 accessing assets without token transfer...');
        
        await contracts.liquidityLayer.connect(protocol2).accessAssets(
            protocol2.address,
            CONTRACTS.coreToken,
            accessAmount,
            user1.address
        );
        
        // Check protocol allocation
        const protocolAllocation = await contracts.liquidityLayer.protocolAllocations(
            protocol2.address,
            CONTRACTS.coreToken
        );
        console.log('Protocol 2 allocation:', ethers.formatEther(protocolAllocation));
        
        // Check asset utilization
        const assetState = await contracts.liquidityLayer.getAssetState(CONTRACTS.coreToken);
        console.log('Total utilized:', ethers.formatEther(assetState.totalUtilized));
        
        // User balance should remain the same (no token transfer)
        const userBalanceAfter = await contracts.liquidityLayer.userBalances(user1.address, CONTRACTS.coreToken);
        console.log('User 1 balance after protocol access:', ethers.formatEther(userBalanceAfter));
        console.log('Balance unchanged (no token transfer):', userBalanceBefore === userBalanceAfter);
        
        // Protocol returns assets with yield
        console.log('\n3. Protocol 2 returning assets with yield...');
        const yieldGenerated = accessAmount / 20n; // 5% yield
        
        await contracts.liquidityLayer.connect(protocol2).returnAssets(
            protocol2.address,
            CONTRACTS.coreToken,
            accessAmount,
            yieldGenerated
        );
        
        // Check that allocation is cleared
        const finalAllocation = await contracts.liquidityLayer.protocolAllocations(
            protocol2.address,
            CONTRACTS.coreToken
        );
        console.log('Protocol 2 final allocation:', ethers.formatEther(finalAllocation));
        
        // Check yield generation
        const finalAssetState = await contracts.liquidityLayer.getAssetState(CONTRACTS.coreToken);
        console.log('Total yield generated:', ethers.formatEther(finalAssetState.totalYieldGenerated));
        
        console.log('✅ Cross-protocol asset sharing completed successfully!');
        
    } catch (error) {
        console.error('❌ Error in cross-protocol asset sharing:', error.message);
    }
}

async function demoAutomaticRebalancing(contracts, deployer, user1, protocol1) {
    console.log('\n=== Demo 3: Automatic Rebalancing ===');
    
    try {
        // Grant keeper role to deployer
        await contracts.liquidityLayer.grantRole(
            await contracts.liquidityLayer.KEEPER_ROLE(),
            deployer.address
        );
        
        // Make a large deposit to trigger idle capital detection
        console.log('\n1. Making large deposit to trigger rebalancing...');
        await contracts.coreToken.transfer(protocol1.address, DEMO_CONFIG.largeAmount);
        await contracts.coreToken.connect(protocol1).approve(
            CONTRACTS.liquidityLayer,
            DEMO_CONFIG.largeAmount
        );
        
        await contracts.liquidityLayer.connect(protocol1).deposit(
            CONTRACTS.coreToken,
            DEMO_CONFIG.largeAmount,
            user1.address
        );
        
        // Check idle capital
        const idleCapital = await contracts.liquidityLayer.getIdleCapital(CONTRACTS.coreToken);
        console.log('Idle capital detected:', ethers.formatEther(idleCapital));
        
        // Check asset state before rebalancing
        const assetStateBefore = await contracts.liquidityLayer.getAssetState(CONTRACTS.coreToken);
        console.log('Total deposited:', ethers.formatEther(assetStateBefore.totalDeposited));
        console.log('Total utilized before:', ethers.formatEther(assetStateBefore.totalUtilized));
        
        // Trigger automatic rebalancing
        console.log('\n2. Triggering automatic rebalancing...');
        
        try {
            await contracts.liquidityLayer.connect(deployer).detectAndReallocate(CONTRACTS.coreToken);
            console.log('Automatic rebalancing executed successfully');
            
            // Check asset state after rebalancing
            const assetStateAfter = await contracts.liquidityLayer.getAssetState(CONTRACTS.coreToken);
            console.log('Total utilized after:', ethers.formatEther(assetStateAfter.totalUtilized));
            console.log('Last rebalance timestamp:', assetStateAfter.lastRebalanceTimestamp.toString());
            
        } catch (error) {
            if (error.message.includes('Idle capital below threshold')) {
                console.log('Idle capital below threshold - this is expected behavior');
            } else if (error.message.includes('No suitable protocol found')) {
                console.log('No suitable protocol found - need more protocols registered');
            } else {
                throw error;
            }
        }
        
        // Get protocol allocations
        console.log('\n3. Current protocol allocations:');
        const [protocols, allocations] = await contracts.liquidityLayer.getProtocolAllocations(CONTRACTS.coreToken);
        
        for (let i = 0; i < protocols.length; i++) {
            if (allocations[i] > 0) {
                console.log(`Protocol ${protocols[i]}: ${ethers.formatEther(allocations[i])} CORE`);
            }
        }
        
        console.log('✅ Automatic rebalancing demo completed!');
        
    } catch (error) {
        console.error('❌ Error in automatic rebalancing:', error.message);
    }
}

async function demoYieldDistribution(contracts, user1, protocol1, protocol2) {
    console.log('\n=== Demo 4: Yield Distribution ===');
    
    try {
        // Simulate yield generation through protocol interactions
        console.log('\n1. Simulating yield generation...');
        
        // Protocol 1 accesses assets
        const accessAmount = DEMO_CONFIG.smallAmount;
        await contracts.liquidityLayer.connect(protocol1).accessAssets(
            protocol1.address,
            CONTRACTS.coreToken,
            accessAmount,
            user1.address
        );
        
        // Protocol 1 returns with yield
        const yieldAmount = accessAmount / 10n; // 10% yield
        await contracts.liquidityLayer.connect(protocol1).returnAssets(
            protocol1.address,
            CONTRACTS.coreToken,
            accessAmount,
            yieldAmount
        );
        
        // Check yield distribution
        const assetState = await contracts.liquidityLayer.getAssetState(CONTRACTS.coreToken);
        console.log('Total yield generated:', ethers.formatEther(assetState.totalYieldGenerated));
        console.log('Total deposited (including yield):', ethers.formatEther(assetState.totalDeposited));
        
        // Check user position
        const userPosition = await contracts.liquidityLayer.getUserPosition(user1.address, CONTRACTS.coreToken);
        console.log('User total deposited:', ethers.formatEther(userPosition.totalDeposited));
        console.log('User shares:', ethers.formatEther(userPosition.shares));
        
        // Check protocol fees
        const protocolFee = await contracts.liquidityLayer.protocolFee();
        const treasuryFee = await contracts.liquidityLayer.treasuryFee();
        console.log('Protocol fee:', protocolFee.toString(), 'basis points');
        console.log('Treasury fee:', treasuryFee.toString(), 'basis points');
        
        console.log('✅ Yield distribution demo completed!');
        
    } catch (error) {
        console.error('❌ Error in yield distribution:', error.message);
    }
}

async function demoEmergencyFunctions(contracts, deployer) {
    console.log('\n=== Demo 5: Emergency Functions ===');
    
    try {
        // Grant emergency role
        await contracts.liquidityLayer.grantRole(
            await contracts.liquidityLayer.EMERGENCY_ROLE(),
            deployer.address
        );
        
        console.log('\n1. Testing pause functionality...');
        
        // Pause the contract
        await contracts.liquidityLayer.connect(deployer).pause();
        const isPaused = await contracts.liquidityLayer.paused();
        console.log('Contract paused:', isPaused);
        
        // Unpause the contract
        await contracts.liquidityLayer.connect(deployer).unpause();
        const isUnpaused = !(await contracts.liquidityLayer.paused());
        console.log('Contract unpaused:', isUnpaused);
        
        console.log('\n2. Testing emergency withdrawal...');
        
        // Get current allocations
        const [protocols, allocations] = await contracts.liquidityLayer.getProtocolAllocations(CONTRACTS.coreToken);
        
        let emergencyExecuted = false;
        for (let i = 0; i < protocols.length; i++) {
            if (allocations[i] > 0) {
                console.log(`Executing emergency withdrawal from ${protocols[i]}...`);
                await contracts.liquidityLayer.connect(deployer).emergencyWithdraw(
                    CONTRACTS.coreToken,
                    protocols[i]
                );
                emergencyExecuted = true;
                break;
            }
        }
        
        if (!emergencyExecuted) {
            console.log('No active allocations found for emergency withdrawal');
        }
        
        console.log('✅ Emergency functions demo completed!');
        
    } catch (error) {
        console.error('❌ Error in emergency functions:', error.message);
    }
}

async function demoAnalyticsAndReporting(contracts) {
    console.log('\n=== Demo 6: Analytics and Reporting ===');
    
    try {
        console.log('\n1. Protocol Analytics:');
        
        // Get total value locked
        const totalTVL = await contracts.liquidityLayer.getTotalValueLocked();
        console.log('Total Value Locked:', ethers.formatEther(totalTVL), 'tokens');
        
        // Get asset states for all supported assets
        const assets = [CONTRACTS.coreToken, CONTRACTS.btcToken, CONTRACTS.ethToken, CONTRACTS.usdcToken];
        const assetNames = ['CORE', 'BTC', 'ETH', 'USDC'];
        
        console.log('\n2. Asset States:');
        for (let i = 0; i < assets.length; i++) {
            try {
                const assetState = await contracts.liquidityLayer.getAssetState(assets[i]);
                if (assetState.isActive) {
                    console.log(`\n${assetNames[i]} Token:`);
                    console.log('  - Total Deposited:', ethers.formatEther(assetState.totalDeposited));
                    console.log('  - Total Utilized:', ethers.formatEther(assetState.totalUtilized));
                    console.log('  - Total Yield Generated:', ethers.formatEther(assetState.totalYieldGenerated));
                    console.log('  - Auto Rebalance Enabled:', assetState.autoRebalanceEnabled);
                    
                    const idleCapital = await contracts.liquidityLayer.getIdleCapital(assets[i]);
                    console.log('  - Idle Capital:', ethers.formatEther(idleCapital));
                }
            } catch (error) {
                console.log(`${assetNames[i]} Token: Not active or error reading state`);
            }
        }
        
        console.log('\n3. Protocol Information:');
        // This would require getting the protocol list, which isn't directly exposed
        // In a real implementation, you'd have a getter for registered protocols
        
        console.log('\n4. Configuration:');
        const treasury = await contracts.liquidityLayer.treasury();
        const protocolFee = await contracts.liquidityLayer.protocolFee();
        const treasuryFee = await contracts.liquidityLayer.treasuryFee();
        
        console.log('Treasury Address:', treasury);
        console.log('Protocol Fee:', protocolFee.toString(), 'basis points');
        console.log('Treasury Fee:', treasuryFee.toString(), 'basis points');
        
        console.log('✅ Analytics and reporting completed!');
        
    } catch (error) {
        console.error('❌ Error in analytics and reporting:', error.message);
    }
}

// Helper function to format time
function formatTimestamp(timestamp) {
    return new Date(Number(timestamp) * 1000).toLocaleString();
}

// Helper function to calculate APY
function calculateAPY(principal, yield, timeInSeconds) {
    const timeInYears = timeInSeconds / (365 * 24 * 60 * 60);
    return ((Number(yield) / Number(principal)) / timeInYears) * 100;
}

// Run the demo
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Demo failed:', error);
            process.exit(1);
        });
}

module.exports = {
    main,
    demoBasicDepositsAndWithdrawals,
    demoCrossProtocolAssetSharing,
    demoAutomaticRebalancing,
    demoYieldDistribution,
    demoEmergencyFunctions,
    demoAnalyticsAndReporting
};