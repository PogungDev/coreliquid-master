const { ethers } = require('hardhat');

/**
 * Demo script untuk fitur-fitur enhanced TrueUnifiedLiquidityLayer:
 * 1. Cross-protocol access tanpa token transfer
 * 2. protocolAllocate() dan protocolDeallocate() otomatis
 * 3. Auto-rebalance harian
 * 4. Yield optimization
 */
async function main() {
    console.log('🚀 Demo Enhanced TrueUnifiedLiquidityLayer Features');
    console.log('=' .repeat(60));
    
    const [deployer, user1, user2, protocol1, protocol2, keeper] = await ethers.getSigners();
    
    // Deploy contracts
    console.log('\n📦 Deploying contracts...');
    
    // Deploy SimpleToken for testing
    const SimpleToken = await ethers.getContractFactory('SimpleToken');
    const coreToken = await SimpleToken.deploy('Core Token', 'CORE', 18, ethers.parseEther('1000000'));
    const btcToken = await SimpleToken.deploy('Bitcoin Token', 'BTC', 8, ethers.parseUnits('21000', 8));
    
    // Deploy TrueUnifiedLiquidityLayer
    const TrueUnifiedLiquidityLayer = await ethers.getContractFactory('TrueUnifiedLiquidityLayer');
    const tull = await TrueUnifiedLiquidityLayer.deploy(deployer.address);
    
    console.log(`✅ CORE Token deployed: ${coreToken.target}`);
    console.log(`✅ BTC Token deployed: ${btcToken.target}`);
    console.log(`✅ TrueUnifiedLiquidityLayer deployed: ${tull.target}`);
    
    // Setup roles
    const PROTOCOL_ROLE = await tull.PROTOCOL_ROLE();
    const KEEPER_ROLE = await tull.KEEPER_ROLE();
    const REBALANCER_ROLE = await tull.REBALANCER_ROLE();
    
    await tull.grantRole(PROTOCOL_ROLE, protocol1.address);
    await tull.grantRole(PROTOCOL_ROLE, protocol2.address);
    await tull.grantRole(KEEPER_ROLE, keeper.address);
    await tull.grantRole(REBALANCER_ROLE, keeper.address);
    
    console.log('✅ Roles granted');
    
    // Add supported assets
    await tull.addSupportedAsset(coreToken.target);
    await tull.addSupportedAsset(btcToken.target);
    console.log('✅ Assets added');
    
    // Register protocols with different APYs
    await tull.registerProtocol(
        protocol1.address,
        'High Yield Protocol',
        1200, // 12% APY
        ethers.parseEther('100000'),
        30 // Risk score
    );
    
    await tull.registerProtocol(
        protocol2.address,
        'Stable Protocol',
        800, // 8% APY
        ethers.parseEther('200000'),
        10 // Risk score
    );
    
    console.log('✅ Protocols registered');
    
    // Enable auto-rebalancing
    await tull.setAutoRebalanceEnabled(coreToken.target, true);
    await tull.setAutoRebalanceEnabled(btcToken.target, true);
    console.log('✅ Auto-rebalancing enabled');
    
    // Transfer tokens to users
    await coreToken.transfer(user1.address, ethers.parseEther('10000'));
    await coreToken.transfer(user2.address, ethers.parseEther('10000'));
    await btcToken.transfer(user1.address, ethers.parseUnits('10', 8));
    
    // Approve tokens
    await coreToken.connect(user1).approve(tull.target, ethers.parseEther('10000'));
    await coreToken.connect(user2).approve(tull.target, ethers.parseEther('10000'));
    await btcToken.connect(user1).approve(tull.target, ethers.parseUnits('10', 8));
    
    console.log('✅ Tokens distributed and approved');
    
    // Demo 1: Basic deposits
    console.log('\n🏦 Demo 1: Basic Deposits');
    console.log('-'.repeat(40));
    
    await tull.connect(protocol1).deposit(coreToken.target, ethers.parseEther('5000'), user1.address);
    await tull.connect(protocol1).deposit(btcToken.target, ethers.parseUnits('5', 8), user1.address);
    await tull.connect(protocol2).deposit(coreToken.target, ethers.parseEther('3000'), user2.address);
    
    console.log('✅ Initial deposits completed');
    
    // Check initial state
    const analytics1 = await tull.getAssetAnalytics(coreToken.target);
    console.log(`📊 CORE Analytics: Deposited=${ethers.formatEther(analytics1.totalDeposited)}, Utilized=${ethers.formatEther(analytics1.totalUtilized)}`);
    
    // Demo 2: Cross-protocol access WITHOUT token transfer
    console.log('\n🔄 Demo 2: Cross-Protocol Access (No Token Transfer)');
    console.log('-'.repeat(50));
    
    // Protocol1 accesses assets on behalf of user1
    await tull.connect(protocol1).accessAssets(
        protocol1.address,
        coreToken.target,
        ethers.parseEther('2000'),
        user1.address
    );
    
    console.log('✅ Protocol1 accessed 2000 CORE (accounting only)');
    
    // Check allocations
    const allocation1 = await tull.protocolAllocations(protocol1.address, coreToken.target);
    console.log(`📈 Protocol1 allocation: ${ethers.formatEther(allocation1)} CORE`);
    
    // Demo 3: Return assets with yield (accounting only)
    console.log('\n💰 Demo 3: Return Assets with Yield (Accounting Only)');
    console.log('-'.repeat(55));
    
    // Return assets with 5% yield
    const yieldGenerated = ethers.parseEther('100'); // 5% of 2000
    await tull.connect(protocol1).returnAssets(
        protocol1.address,
        coreToken.target,
        ethers.parseEther('2000'),
        yieldGenerated
    );
    
    console.log('✅ Assets returned with 100 CORE yield (accounting only)');
    
    // Demo 4: Automatic Protocol Allocation
    console.log('\n🤖 Demo 4: Automatic Protocol Allocation');
    console.log('-'.repeat(45));
    
    // Keeper triggers automatic allocation
    const [allocatedProtocol, expectedYield] = await tull.connect(keeper).protocolAllocate.staticCall(
        coreToken.target,
        ethers.parseEther('1000')
    );
    
    await tull.connect(keeper).protocolAllocate(
        coreToken.target,
        ethers.parseEther('1000')
    );
    
    console.log(`✅ Auto-allocated 1000 CORE to ${allocatedProtocol}`);
    console.log(`📊 Expected yield: ${ethers.formatEther(expectedYield)} CORE`);
    
    // Demo 5: Automatic Protocol Deallocation
    console.log('\n📉 Demo 5: Automatic Protocol Deallocation');
    console.log('-'.repeat(47));
    
    // Update protocol2 to have lower APY to trigger deallocation
    await tull.updateProtocolAPY(protocol2.address, 400); // Reduce to 4%
    
    const [deallocatedProtocol, actualYield] = await tull.connect(keeper).protocolDeallocate.staticCall(
        coreToken.target,
        ethers.parseEther('500')
    );
    
    await tull.connect(keeper).protocolDeallocate(
        coreToken.target,
        ethers.parseEther('500')
    );
    
    console.log(`✅ Auto-deallocated 500 CORE from ${deallocatedProtocol}`);
    console.log(`📊 Actual yield: ${ethers.formatEther(actualYield)} CORE`);
    
    // Demo 6: Daily Auto-Rebalancing
    console.log('\n⏰ Demo 6: Daily Auto-Rebalancing');
    console.log('-'.repeat(40));
    
    // Execute daily rebalance
    await tull.connect(keeper).executeDailyRebalance([coreToken.target, btcToken.target]);
    
    console.log('✅ Daily rebalancing executed');
    
    // Demo 7: Cross-Protocol Optimization Opportunities
    console.log('\n🎯 Demo 7: Cross-Protocol Optimization Analysis');
    console.log('-'.repeat(52));
    
    const opportunities = await tull.getCrossProtocolOpportunities(coreToken.target);
    
    console.log(`📊 Found ${opportunities.fromProtocols.length} optimization opportunities:`);
    for (let i = 0; i < opportunities.fromProtocols.length; i++) {
        console.log(`   From: ${opportunities.fromProtocols[i]}`);
        console.log(`   To: ${opportunities.toProtocols[i]}`);
        console.log(`   Amount: ${ethers.formatEther(opportunities.amounts[i])} CORE`);
        console.log(`   Yield Improvement: ${opportunities.yieldImprovements[i]} basis points`);
        console.log('   ---');
    }
    
    // Demo 8: Comprehensive Analytics
    console.log('\n📈 Demo 8: Comprehensive Analytics');
    console.log('-'.repeat(40));
    
    const finalAnalytics = await tull.getAssetAnalytics(coreToken.target);
    console.log('📊 Final CORE Analytics:');
    console.log(`   Total Deposited: ${ethers.formatEther(finalAnalytics.totalDeposited)} CORE`);
    console.log(`   Total Utilized: ${ethers.formatEther(finalAnalytics.totalUtilized)} CORE`);
    console.log(`   Idle Capital: ${ethers.formatEther(finalAnalytics.idleCapital)} CORE`);
    console.log(`   Weighted APY: ${finalAnalytics.weightedAPY} basis points`);
    console.log(`   Active Protocols: ${finalAnalytics.protocolCount}`);
    console.log(`   Last Rebalance: ${new Date(Number(finalAnalytics.lastRebalanceTime) * 1000).toISOString()}`);
    
    // Demo 9: Fee Settlement
    console.log('\n💳 Demo 9: Fee Settlement');
    console.log('-'.repeat(30));
    
    await tull.connect(keeper).settlePendingFees(coreToken.target);
    console.log('✅ Pending fees settled');
    
    // Demo 10: TVL and Performance Summary
    console.log('\n🏆 Demo 10: Performance Summary');
    console.log('-'.repeat(40));
    
    const totalTVL = await tull.getTotalValueLocked();
    const globalCounter = await tull.globalRebalanceCounter();
    
    console.log(`📊 Total Value Locked: $${ethers.formatEther(totalTVL)}`);
    console.log(`🔄 Global Rebalance Counter: ${globalCounter}`);
    
    console.log('\n🎉 Enhanced Features Demo Completed!');
    console.log('=' .repeat(60));
    console.log('\n✨ Key Features Demonstrated:');
    console.log('   ✅ Cross-protocol access without token transfers');
    console.log('   ✅ Pure accounting-based asset management');
    console.log('   ✅ Automatic protocol allocation/deallocation');
    console.log('   ✅ Daily auto-rebalancing with yield optimization');
    console.log('   ✅ Real-time cross-protocol opportunity detection');
    console.log('   ✅ Comprehensive analytics and performance tracking');
    console.log('   ✅ Fee settlement and treasury management');
    console.log('\n🚀 TrueUnifiedLiquidityLayer is ready for hackathon submission!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });