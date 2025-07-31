const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting CoreLiquid Protocol deployment...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    
    const deployedContracts = {};
    const deploymentConfig = {
        treasury: deployer.address, // In production, use a multisig
        governance: deployer.address, // In production, use governance contract
        emergencyCouncil: deployer.address, // In production, use emergency multisig
        feeRecipient: deployer.address
    };
    
    try {
        // Step 1: Deploy utility contracts first
        console.log("\n📋 Step 1: Deploying utility contracts...");
        
        // Deploy DepositGuard
        console.log("Deploying DepositGuard...");
        const DepositGuard = await ethers.getContractFactory("DepositGuard");
        const depositGuard = await DepositGuard.deploy();
        await depositGuard.deployed();
        deployedContracts.depositGuard = depositGuard.address;
        console.log("✅ DepositGuard deployed to:", depositGuard.address);
        
        // Deploy TransferProxy
        console.log("Deploying TransferProxy...");
        const TransferProxy = await ethers.getContractFactory("TransferProxy");
        const transferProxy = await TransferProxy.deploy();
        await transferProxy.deployed();
        deployedContracts.transferProxy = transferProxy.address;
        console.log("✅ TransferProxy deployed to:", transferProxy.address);
        
        // Deploy RatioCalculator
        console.log("Deploying RatioCalculator...");
        const RatioCalculator = await ethers.getContractFactory("RatioCalculator");
        const ratioCalculator = await RatioCalculator.deploy();
        await ratioCalculator.deployed();
        deployedContracts.ratioCalculator = ratioCalculator.address;
        console.log("✅ RatioCalculator deployed to:", ratioCalculator.address);
        
        // Deploy RangeCalculator
        console.log("Deploying RangeCalculator...");
        const RangeCalculator = await ethers.getContractFactory("RangeCalculator");
        const rangeCalculator = await RangeCalculator.deploy();
        await rangeCalculator.deployed();
        deployedContracts.rangeCalculator = rangeCalculator.address;
        console.log("✅ RangeCalculator deployed to:", rangeCalculator.address);
        
        // Deploy UniswapV3Router
        console.log("Deploying UniswapV3Router...");
        const UniswapV3Router = await ethers.getContractFactory("UniswapV3Router");
        const uniswapV3Router = await UniswapV3Router.deploy();
        await uniswapV3Router.deployed();
        deployedContracts.uniswapV3Router = uniswapV3Router.address;
        console.log("✅ UniswapV3Router deployed to:", uniswapV3Router.address);
        
        // Step 2: Deploy token contracts
        console.log("\n🪙 Step 2: Deploying token contracts...");
        
        // Deploy UnifiedLPToken
        console.log("Deploying UnifiedLPToken...");
        const UnifiedLPToken = await ethers.getContractFactory("UnifiedLPToken");
        const unifiedLPToken = await UnifiedLPToken.deploy(
            "CoreLiquid LP Token",
            "CLLP",
            deployer.address // Initial admin
        );
        await unifiedLPToken.deployed();
        deployedContracts.unifiedLPToken = unifiedLPToken.address;
        console.log("✅ UnifiedLPToken deployed to:", unifiedLPToken.address);
        
        // Deploy PositionNFT
        console.log("Deploying PositionNFT...");
        const PositionNFT = await ethers.getContractFactory("PositionNFT");
        const positionNFT = await PositionNFT.deploy(
            "CoreLiquid Position",
            "CLPOS",
            "https://api.coreliquid.com/metadata/",
            deployer.address // Initial admin
        );
        await positionNFT.deployed();
        deployedContracts.positionNFT = positionNFT.address;
        console.log("✅ PositionNFT deployed to:", positionNFT.address);
        
        // Step 3: Deploy APR calculation contracts
        console.log("\n📊 Step 3: Deploying APR calculation contracts...");
        
        // APRCalculator functionality is now integrated into core contracts
        
        // Deploy APROptimizer
        console.log("Deploying APROptimizer...");
        const APROptimizer = await ethers.getContractFactory("APROptimizer");
        const aprOptimizer = await APROptimizer.deploy(deployedContracts.aprCalculator || ethers.constants.AddressZero);
        await aprOptimizer.deployed();
        deployedContracts.aprOptimizer = aprOptimizer.address;
        console.log("✅ APROptimizer deployed to:", aprOptimizer.address);
        
        // Step 4: Deploy rebalance contracts
        console.log("\n⚖️ Step 4: Deploying rebalance contracts...");
        
        // Deploy TickOptimizer
        console.log("Deploying TickOptimizer...");
        const TickOptimizer = await ethers.getContractFactory("TickOptimizer");
        const tickOptimizer = await TickOptimizer.deploy();
        await tickOptimizer.deployed();
        deployedContracts.tickOptimizer = tickOptimizer.address;
        console.log("✅ TickOptimizer deployed to:", tickOptimizer.address);
        
        // Deploy AutoRebalanceManager
        console.log("Deploying AutoRebalanceManager...");
        const AutoRebalanceManager = await ethers.getContractFactory("AutoRebalanceManager");
        const autoRebalanceManager = await AutoRebalanceManager.deploy(
            positionNFT.address,
            uniswapV3Router.address
        );
        await autoRebalanceManager.deployed();
        deployedContracts.autoRebalanceManager = autoRebalanceManager.address;
        console.log("✅ AutoRebalanceManager deployed to:", autoRebalanceManager.address);
        
        // Deploy RebalanceFlow
        console.log("Deploying RebalanceFlow...");
        const RebalanceFlow = await ethers.getContractFactory("RebalanceFlow");
        const rebalanceFlow = await RebalanceFlow.deploy(
            autoRebalanceManager.address,
            tickOptimizer.address,
            aprOptimizer.address
        );
        await rebalanceFlow.deployed();
        deployedContracts.rebalanceFlow = rebalanceFlow.address;
        console.log("✅ RebalanceFlow deployed to:", rebalanceFlow.address);
        
        // Step 5: Deploy lending contracts
        console.log("\n🏦 Step 5: Deploying lending contracts...");
        
        // Deploy InterestRateModel
        console.log("Deploying InterestRateModel...");
        const InterestRateModel = await ethers.getContractFactory("InterestRateModel");
        const interestRateModel = await InterestRateModel.deploy();
        await interestRateModel.deployed();
        deployedContracts.interestRateModel = interestRateModel.address;
        console.log("✅ InterestRateModel deployed to:", interestRateModel.address);
        
        // Deploy CollateralManager
        console.log("Deploying CollateralManager...");
        const CollateralManager = await ethers.getContractFactory("CollateralManager");
        const collateralManager = await CollateralManager.deploy();
        await collateralManager.deployed();
        deployedContracts.collateralManager = collateralManager.address;
        console.log("✅ CollateralManager deployed to:", collateralManager.address);
        
        // Deploy LiquidationEngine
        console.log("Deploying LiquidationEngine...");
        const LiquidationEngine = await ethers.getContractFactory("LiquidationEngine");
        const liquidationEngine = await LiquidationEngine.deploy(
            collateralManager.address,
            interestRateModel.address
        );
        await liquidationEngine.deployed();
        deployedContracts.liquidationEngine = liquidationEngine.address;
        console.log("✅ LiquidationEngine deployed to:", liquidationEngine.address);
        
        // Deploy BorrowEngine
        console.log("Deploying BorrowEngine...");
        const BorrowEngine = await ethers.getContractFactory("BorrowEngine");
        const borrowEngine = await BorrowEngine.deploy(
            collateralManager.address,
            interestRateModel.address,
            liquidationEngine.address
        );
        await borrowEngine.deployed();
        deployedContracts.borrowEngine = borrowEngine.address;
        console.log("✅ BorrowEngine deployed to:", borrowEngine.address);
        
        // Step 6: Deploy vault contracts
        console.log("\n🏛️ Step 6: Deploying vault contracts...");
        
        // Deploy VaultStrategyBase
        console.log("Deploying VaultStrategyBase...");
        const VaultStrategyBase = await ethers.getContractFactory("VaultStrategyBase");
        const vaultStrategyBase = await VaultStrategyBase.deploy();
        await vaultStrategyBase.deployed();
        deployedContracts.vaultStrategyBase = vaultStrategyBase.address;
        console.log("✅ VaultStrategyBase deployed to:", vaultStrategyBase.address);
        
        // Deploy VaultManager
        console.log("Deploying VaultManager...");
        const VaultManager = await ethers.getContractFactory("VaultManager");
        const vaultManager = await VaultManager.deploy();
        await vaultManager.deployed();
        deployedContracts.vaultManager = vaultManager.address;
        console.log("✅ VaultManager deployed to:", vaultManager.address);
        
        // Step 7: Deploy yield contracts
        console.log("\n🌾 Step 7: Deploying yield contracts...");
        
        // Deploy YieldAggregator
        console.log("Deploying YieldAggregator...");
        const YieldAggregator = await ethers.getContractFactory("YieldAggregator");
        const yieldAggregator = await YieldAggregator.deploy(
            deploymentConfig.feeRecipient
        );
        await yieldAggregator.deployed();
        deployedContracts.yieldAggregator = yieldAggregator.address;
        console.log("✅ YieldAggregator deployed to:", yieldAggregator.address);
        
        // Deploy YieldOptimizer
        console.log("Deploying YieldOptimizer...");
        const YieldOptimizer = await ethers.getContractFactory("YieldOptimizer");
        const yieldOptimizer = await YieldOptimizer.deploy(yieldAggregator.address);
        await yieldOptimizer.deployed();
        deployedContracts.yieldOptimizer = yieldOptimizer.address;
        console.log("✅ YieldOptimizer deployed to:", yieldOptimizer.address);
        
        // Deploy YieldStrategy
        console.log("Deploying YieldStrategy...");
        const YieldStrategy = await ethers.getContractFactory("YieldStrategy");
        const yieldStrategy = await YieldStrategy.deploy(
            yieldAggregator.address,
            yieldOptimizer.address,
            deploymentConfig.feeRecipient
        );
        await yieldStrategy.deployed();
        deployedContracts.yieldStrategy = yieldStrategy.address;
        console.log("✅ YieldStrategy deployed to:", yieldStrategy.address);
        
        // Step 8: Deploy DepositManager
        console.log("\n💰 Step 8: Deploying DepositManager...");
        const DepositManager = await ethers.getContractFactory("DepositManager");
        const depositManager = await DepositManager.deploy(
            depositGuard.address,
            transferProxy.address,
            ratioCalculator.address,
            rangeCalculator.address,
            uniswapV3Router.address,
            unifiedLPToken.address,
            positionNFT.address
        );
        await depositManager.deployed();
        deployedContracts.depositManager = depositManager.address;
        console.log("✅ DepositManager deployed to:", depositManager.address);
        
        // Step 9: Deploy main protocol contract
        console.log("\n🏗️ Step 9: Deploying CoreLiquidProtocol...");
        const CoreLiquidProtocol = await ethers.getContractFactory("CoreLiquidProtocol");
        const coreLiquidProtocol = await upgrades.deployProxy(
            CoreLiquidProtocol,
            [
                deploymentConfig.treasury,
                deploymentConfig.governance,
                deploymentConfig.emergencyCouncil
            ],
            { initializer: 'initialize' }
        );
        await coreLiquidProtocol.deployed();
        deployedContracts.coreLiquidProtocol = coreLiquidProtocol.address;
        console.log("✅ CoreLiquidProtocol deployed to:", coreLiquidProtocol.address);
        
        // Step 10: Initialize components in main protocol
        console.log("\n🔧 Step 10: Initializing protocol components...");
        await coreLiquidProtocol.initializeComponents(
            depositManager.address,
            autoRebalanceManager.address,
            rebalanceFlow.address,
            borrowEngine.address,
            collateralManager.address,
            interestRateModel.address,
            liquidationEngine.address,
            vaultManager.address,
            yieldAggregator.address,
            yieldOptimizer.address,
            yieldStrategy.address,
            aprOptimizer.address
        );
        console.log("✅ Protocol components initialized");
        
        // Step 11: Setup permissions and roles
        console.log("\n🔐 Step 11: Setting up permissions...");
        
        // Grant roles to main protocol contract
        const MINTER_ROLE = await unifiedLPToken.MINTER_ROLE();
        const BURNER_ROLE = await unifiedLPToken.BURNER_ROLE();
        const POSITION_MINTER_ROLE = await positionNFT.MINTER_ROLE();
        
        await unifiedLPToken.grantRole(MINTER_ROLE, depositManager.address);
        await unifiedLPToken.grantRole(BURNER_ROLE, depositManager.address);
        await positionNFT.grantRole(POSITION_MINTER_ROLE, depositManager.address);
        
        console.log("✅ Permissions configured");
        
        // Step 12: Save deployment addresses
        console.log("\n💾 Step 12: Saving deployment addresses...");
        const deploymentData = {
            network: await ethers.provider.getNetwork(),
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            contracts: deployedContracts,
            config: deploymentConfig
        };
        
        const deploymentsDir = path.join(__dirname, '..', 'deployments');
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir, { recursive: true });
        }
        
        const networkName = (await ethers.provider.getNetwork()).name;
        const deploymentFile = path.join(deploymentsDir, `${networkName}-deployment.json`);
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
        
        console.log("✅ Deployment addresses saved to:", deploymentFile);
        
        // Step 13: Verify deployment
        console.log("\n✅ Step 13: Deployment verification...");
        console.log("📋 Deployment Summary:");
        console.log("=======================");
        
        Object.entries(deployedContracts).forEach(([name, address]) => {
            console.log(`${name}: ${address}`);
        });
        
        console.log("\n🎉 CoreLiquid Protocol deployment completed successfully!");
        console.log("\n📖 Next steps:");
        console.log("1. Verify contracts on block explorer");
        console.log("2. Configure initial parameters");
        console.log("3. Add initial yield sources");
        console.log("4. Set up monitoring and alerts");
        console.log("5. Deploy frontend application");
        
        return deployedContracts;
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = main;