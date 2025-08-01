const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying CoreBitcoinDualStaking Contract...");
    
    const [deployer, validator1, validator2, user1, user2] = await ethers.getSigners();
    
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Deploy SimpleToken for CORE and BTC
    console.log("\n📄 Deploying CORE and BTC tokens...");
    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    
    const coreToken = await SimpleToken.deploy(
        "Core Token",
        "CORE",
        ethers.utils.parseEther("1000000") // 1M CORE
    );
    await coreToken.deployed();
    console.log("✅ CORE Token deployed to:", coreToken.address);
    
    const btcToken = await SimpleToken.deploy(
        "Bitcoin Token",
        "BTC",
        ethers.utils.parseEther("10000") // 10K BTC
    );
    await btcToken.deployed();
    console.log("✅ BTC Token deployed to:", btcToken.address);

    // Deploy CoreBitcoinDualStaking
    console.log("\n🔗 Deploying CoreBitcoinDualStaking...");
    const CoreBitcoinDualStaking = await ethers.getContractFactory("CoreBitcoinDualStaking");
    const dualStaking = await CoreBitcoinDualStaking.deploy(
        coreToken.address,
        btcToken.address
    );
    await dualStaking.deployed();
    console.log("✅ CoreBitcoinDualStaking deployed to:", dualStaking.address);

    // Distribute tokens to users
    console.log("\n💰 Distributing tokens to users...");
    const coreAmount = ethers.utils.parseEther("10000"); // 10K CORE per user
    const btcAmount = ethers.utils.parseEther("10"); // 10 BTC per user
    
    await coreToken.transfer(user1.address, coreAmount);
    await btcToken.transfer(user1.address, btcAmount);
    await coreToken.transfer(user2.address, coreAmount);
    await btcToken.transfer(user2.address, btcAmount);
    
    console.log("✅ Tokens distributed to users");

    // Add reward pools
    console.log("\n🎁 Adding reward pools...");
    const rewardCoreAmount = ethers.utils.parseEther("50000"); // 50K CORE rewards
    const rewardBtcAmount = ethers.utils.parseEther("50"); // 50 BTC rewards
    
    await coreToken.approve(dualStaking.address, rewardCoreAmount);
    await btcToken.approve(dualStaking.address, rewardBtcAmount);
    await dualStaking.addRewards(rewardCoreAmount, rewardBtcAmount);
    
    console.log("✅ Reward pools added");

    // Register validators
    console.log("\n👥 Registering validators...");
    await dualStaking.registerValidator(validator1.address, 500); // 5% commission
    await dualStaking.registerValidator(validator2.address, 300); // 3% commission
    
    console.log("✅ Validators registered:");
    console.log("   - Validator 1:", validator1.address, "(5% commission)");
    console.log("   - Validator 2:", validator2.address, "(3% commission)");

    // Test dual staking
    console.log("\n🔄 Testing dual staking...");
    
    // User1 stakes with validator 1
    const stakeCore1 = ethers.utils.parseEther("5000"); // 5K CORE
    const stakeBtc1 = ethers.utils.parseEther("2"); // 2 BTC
    
    await coreToken.connect(user1).approve(dualStaking.address, stakeCore1);
    await btcToken.connect(user1).approve(dualStaking.address, stakeBtc1);
    await dualStaking.connect(user1).activateDualStake(stakeCore1, stakeBtc1, 1);
    
    console.log("✅ User1 activated dual stake:");
    console.log("   - CORE:", ethers.utils.formatEther(stakeCore1));
    console.log("   - BTC:", ethers.utils.formatEther(stakeBtc1));
    console.log("   - Validator: 1");
    
    // User2 stakes with validator 2
    const stakeCore2 = ethers.utils.parseEther("3000"); // 3K CORE
    const stakeBtc2 = ethers.utils.parseEther("1.5"); // 1.5 BTC
    
    await coreToken.connect(user2).approve(dualStaking.address, stakeCore2);
    await btcToken.connect(user2).approve(dualStaking.address, stakeBtc2);
    await dualStaking.connect(user2).activateDualStake(stakeCore2, stakeBtc2, 2);
    
    console.log("✅ User2 activated dual stake:");
    console.log("   - CORE:", ethers.utils.formatEther(stakeCore2));
    console.log("   - BTC:", ethers.utils.formatEther(stakeBtc2));
    console.log("   - Validator: 2");

    // Check staking stats
    console.log("\n📊 Current staking statistics:");
    const [totalCore, totalBtc, totalStakers] = await dualStaking.getTotalStats();
    console.log("   - Total CORE staked:", ethers.utils.formatEther(totalCore));
    console.log("   - Total BTC staked:", ethers.utils.formatEther(totalBtc));
    console.log("   - Total active stakers:", totalStakers.toString());

    // Check validator info
    console.log("\n🏛️ Validator information:");
    const validator1Info = await dualStaking.getValidatorInfo(1);
    const validator2Info = await dualStaking.getValidatorInfo(2);
    
    console.log("   Validator 1:");
    console.log("     - Address:", validator1Info.validatorAddress);
    console.log("     - CORE staked:", ethers.utils.formatEther(validator1Info.totalCoreStaked));
    console.log("     - BTC staked:", ethers.utils.formatEther(validator1Info.totalBtcStaked));
    console.log("     - Commission:", validator1Info.commission.toString(), "bp");
    console.log("     - Reputation:", validator1Info.reputationScore.toString());
    
    console.log("   Validator 2:");
    console.log("     - Address:", validator2Info.validatorAddress);
    console.log("     - CORE staked:", ethers.utils.formatEther(validator2Info.totalCoreStaked));
    console.log("     - BTC staked:", ethers.utils.formatEther(validator2Info.totalBtcStaked));
    console.log("     - Commission:", validator2Info.commission.toString(), "bp");
    console.log("     - Reputation:", validator2Info.reputationScore.toString());

    // Check user stake info
    console.log("\n👤 User stake information:");
    const user1Stake = await dualStaking.getUserStakeInfo(user1.address);
    const user2Stake = await dualStaking.getUserStakeInfo(user2.address);
    
    console.log("   User1:");
    console.log("     - CORE amount:", ethers.utils.formatEther(user1Stake.coreAmount));
    console.log("     - BTC amount:", ethers.utils.formatEther(user1Stake.btcAmount));
    console.log("     - Validator ID:", user1Stake.validatorId.toString());
    console.log("     - Is active:", user1Stake.isActive);
    
    console.log("   User2:");
    console.log("     - CORE amount:", ethers.utils.formatEther(user2Stake.coreAmount));
    console.log("     - BTC amount:", ethers.utils.formatEther(user2Stake.btcAmount));
    console.log("     - Validator ID:", user2Stake.validatorId.toString());
    console.log("     - Is active:", user2Stake.isActive);

    // Simulate time passage for rewards
    console.log("\n⏰ Simulating time passage (1 day)...");
    await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
    await ethers.provider.send("evm_mine");

    // Check pending rewards
    console.log("\n💎 Checking pending rewards:");
    const [user1CoreRewards, user1BtcRewards] = await dualStaking.getPendingRewards(user1.address);
    const [user2CoreRewards, user2BtcRewards] = await dualStaking.getPendingRewards(user2.address);
    
    console.log("   User1 pending rewards:");
    console.log("     - CORE:", ethers.utils.formatEther(user1CoreRewards));
    console.log("     - BTC:", ethers.utils.formatEther(user1BtcRewards));
    
    console.log("   User2 pending rewards:");
    console.log("     - CORE:", ethers.utils.formatEther(user2CoreRewards));
    console.log("     - BTC:", ethers.utils.formatEther(user2BtcRewards));

    // Test reward harvesting
    console.log("\n🌾 Testing reward harvesting...");
    
    // Get balances before harvesting
    const user1CoreBefore = await coreToken.balanceOf(user1.address);
    const user1BtcBefore = await btcToken.balanceOf(user1.address);
    
    // Harvest rewards
    await dualStaking.connect(user1).harvestRewards();
    
    // Get balances after harvesting
    const user1CoreAfter = await coreToken.balanceOf(user1.address);
    const user1BtcAfter = await btcToken.balanceOf(user1.address);
    
    console.log("✅ User1 harvested rewards:");
    console.log("   - CORE gained:", ethers.utils.formatEther(user1CoreAfter.sub(user1CoreBefore)));
    console.log("   - BTC gained:", ethers.utils.formatEther(user1BtcAfter.sub(user1BtcBefore)));

    // Test epoch information
    console.log("\n📅 Epoch information:");
    const [currentEpoch, lastUpdate] = await dualStaking.getCurrentEpochInfo();
    console.log("   - Current epoch:", currentEpoch.toString());
    console.log("   - Last update:", new Date(lastUpdate.toNumber() * 1000).toISOString());

    // Test validator history
    console.log("\n📜 User validator history:");
    const user1History = await dualStaking.getUserValidatorHistory(user1.address);
    const user2History = await dualStaking.getUserValidatorHistory(user2.address);
    
    console.log("   User1 validators:", user1History.map(id => id.toString()));
    console.log("   User2 validators:", user2History.map(id => id.toString()));

    // Test admin functions
    console.log("\n⚙️ Testing admin functions...");
    
    // Update validator reputation
    await dualStaking.updateValidatorReputation(1, 95); // Reduce validator 1 reputation
    const updatedValidator1 = await dualStaking.getValidatorInfo(1);
    console.log("✅ Updated validator 1 reputation to:", updatedValidator1.reputationScore.toString());
    
    // Update daily reward rate
    await dualStaking.updateDailyRewardRate(150); // 1.5% daily
    console.log("✅ Updated daily reward rate to 1.5%");

    console.log("\n🎉 CoreBitcoinDualStaking deployment and testing completed!");
    console.log("\n📋 Contract Addresses:");
    console.log("   - CORE Token:", coreToken.address);
    console.log("   - BTC Token:", btcToken.address);
    console.log("   - CoreBitcoinDualStaking:", dualStaking.address);
    
    console.log("\n🔗 Key Features Demonstrated:");
    console.log("   ✅ Dual CORE + BTC staking");
    console.log("   ✅ Validator delegation mechanism");
    console.log("   ✅ Satoshi Plus epoch system");
    console.log("   ✅ Reward harvesting with bonuses");
    console.log("   ✅ Commission-based validator rewards");
    console.log("   ✅ Reputation scoring system");
    console.log("   ✅ Cross-protocol staking analytics");
    console.log("   ✅ Emergency controls and admin functions");
    
    return {
        coreToken: coreToken.address,
        btcToken: btcToken.address,
        dualStaking: dualStaking.address,
        deployer: deployer.address,
        validators: [validator1.address, validator2.address],
        users: [user1.address, user2.address]
    };
}

main()
    .then((result) => {
        console.log("\n🚀 Deployment successful!");
        console.log("Result:", result);
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });

module.exports = main;