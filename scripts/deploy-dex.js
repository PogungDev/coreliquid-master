const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("\n=== CoreLiquid DEX/AMM Deployment ===");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    
    const deploymentResults = {};
    
    try {
        // 1. Deploy UnifiedLPToken template
        console.log("\n1. Deploying UnifiedLPToken template...");
        const UnifiedLPToken = await ethers.getContractFactory("UnifiedLPToken");
        const unifiedLPToken = await UnifiedLPToken.deploy("CoreLiquid LP Token", "CLP");
        await unifiedLPToken.deployed();
        console.log("UnifiedLPToken deployed to:", unifiedLPToken.address);
        deploymentResults.unifiedLPToken = unifiedLPToken.address;
        
        // 2. Deploy OracleRouter (simplified)
        console.log("\n2. Deploying OracleRouter...");
        const OracleRouter = await ethers.getContractFactory("OracleRouter");
        const oracleRouter = await OracleRouter.deploy();
        await oracleRouter.deployed();
        console.log("OracleRouter deployed to:", oracleRouter.address);
        deploymentResults.oracleRouter = oracleRouter.address;
        
        // 3. Deploy UnifiedLiquidityLayer
        console.log("\n3. Deploying UnifiedLiquidityLayer...");
        const UnifiedLiquidityLayer = await ethers.getContractFactory("UnifiedLiquidityLayer");
        const unifiedLiquidityLayer = await UnifiedLiquidityLayer.deploy();
        await unifiedLiquidityLayer.deployed();
        console.log("UnifiedLiquidityLayer deployed to:", unifiedLiquidityLayer.address);
        deploymentResults.unifiedLiquidityLayer = unifiedLiquidityLayer.address;
        
        // 4. Deploy IdleCapitalManager
        console.log("\n4. Deploying IdleCapitalManager...");
        const IdleCapitalManager = await ethers.getContractFactory("IdleCapitalManager");
        const idleCapitalManager = await IdleCapitalManager.deploy();
        await idleCapitalManager.deployed();
        console.log("IdleCapitalManager deployed to:", idleCapitalManager.address);
        deploymentResults.idleCapitalManager = idleCapitalManager.address;
        
        // 5. Deploy VaultManager
        console.log("\n5. Deploying VaultManager...");
        const VaultManager = await ethers.getContractFactory("VaultManager");
        const vaultManager = await VaultManager.deploy();
        await vaultManager.deployed();
        console.log("VaultManager deployed to:", vaultManager.address);
        deploymentResults.vaultManager = vaultManager.address;
        
        // 6. Deploy ZeroSlippageEngine
        console.log("\n6. Deploying ZeroSlippageEngine...");
        const ZeroSlippageEngine = await ethers.getContractFactory("ZeroSlippageEngine");
        const zeroSlippageEngine = await ZeroSlippageEngine.deploy(
            unifiedLiquidityLayer.address,
            oracleRouter.address
        );
        await zeroSlippageEngine.deployed();
        console.log("ZeroSlippageEngine deployed to:", zeroSlippageEngine.address);
        deploymentResults.zeroSlippageEngine = zeroSlippageEngine.address;
        
        // 7. Deploy InfiniteLiquidityEngine
        console.log("\n7. Deploying InfiniteLiquidityEngine...");
        const InfiniteLiquidityEngine = await ethers.getContractFactory("InfiniteLiquidityEngine");
        const infiniteLiquidityEngine = await InfiniteLiquidityEngine.deploy(
            unifiedLiquidityLayer.address,
            zeroSlippageEngine.address,
            idleCapitalManager.address,
            oracleRouter.address,
            vaultManager.address
        );
        await infiniteLiquidityEngine.deployed();
        console.log("InfiniteLiquidityEngine deployed to:", infiniteLiquidityEngine.address);
        deploymentResults.infiniteLiquidityEngine = infiniteLiquidityEngine.address;
        
        // 8. Deploy CoreDEX
        console.log("\n8. Deploying CoreDEX...");
        const CoreDEX = await ethers.getContractFactory("CoreDEX");
        const coreDEX = await CoreDEX.deploy(
            zeroSlippageEngine.address,
            infiniteLiquidityEngine.address,
            deployer.address // Fee recipient
        );
        await coreDEX.deployed();
        console.log("CoreDEX deployed to:", coreDEX.address);
        deploymentResults.coreDEX = coreDEX.address;
        
        // 9. Deploy CoreDEXRouter
        console.log("\n9. Deploying CoreDEXRouter...");
        const CoreDEXRouter = await ethers.getContractFactory("CoreDEXRouter");
        const coreDEXRouter = await CoreDEXRouter.deploy(
            coreDEX.address,
            zeroSlippageEngine.address
        );
        await coreDEXRouter.deployed();
        console.log("CoreDEXRouter deployed to:", coreDEXRouter.address);
        deploymentResults.coreDEXRouter = coreDEXRouter.address;
        
        // 10. Deploy CoreDEXFactory
        console.log("\n10. Deploying CoreDEXFactory...");
        const CoreDEXFactory = await ethers.getContractFactory("CoreDEXFactory");
        const coreDEXFactory = await CoreDEXFactory.deploy(
            deployer.address, // Default fee recipient
            zeroSlippageEngine.address, // Zero slippage template
            infiniteLiquidityEngine.address // Infinite liquidity template
        );
        await coreDEXFactory.deployed();
        console.log("CoreDEXFactory deployed to:", coreDEXFactory.address);
        deploymentResults.coreDEXFactory = coreDEXFactory.address;
        
        // 11. Deploy test tokens for demonstration
        console.log("\n11. Deploying test tokens...");
        const SimpleToken = await ethers.getContractFactory("SimpleToken");
        
        const tokenA = await SimpleToken.deploy(
            "Test Token A",
            "TTA",
            ethers.utils.parseEther("1000000") // 1M tokens
        );
        await tokenA.deployed();
        console.log("Test Token A deployed to:", tokenA.address);
        deploymentResults.tokenA = tokenA.address;
        
        const tokenB = await SimpleToken.deploy(
            "Test Token B",
            "TTB",
            ethers.utils.parseEther("1000000") // 1M tokens
        );
        await tokenB.deployed();
        console.log("Test Token B deployed to:", tokenB.address);
        deploymentResults.tokenB = tokenB.address;
        
        // 12. Initialize DEX with test trading pairs
        console.log("\n12. Initializing DEX with test trading pairs...");
        
        // Create trading pair
        const createPairTx = await coreDEX.createPair(
            tokenA.address,
            tokenB.address,
            300 // 0.3% fee
        );
        await createPairTx.wait();
        console.log("Trading pair created for TTA/TTB");
        
        // Get pair ID
        const pairId = await coreDEX.getPair(tokenA.address, tokenB.address);
        console.log("Pair ID:", pairId);
        deploymentResults.testPairId = pairId;
        
        // 13. Add initial liquidity
        console.log("\n13. Adding initial liquidity...");
        
        const liquidityAmountA = ethers.utils.parseEther("10000"); // 10K tokens
        const liquidityAmountB = ethers.utils.parseEther("10000"); // 10K tokens
        
        // Approve tokens for DEX
        await tokenA.approve(coreDEX.address, liquidityAmountA);
        await tokenB.approve(coreDEX.address, liquidityAmountB);
        
        // Add liquidity
        const addLiquidityParams = {
            tokenA: tokenA.address,
            tokenB: tokenB.address,
            amountADesired: liquidityAmountA,
            amountBDesired: liquidityAmountB,
            amountAMin: ethers.utils.parseEther("9000"),
            amountBMin: ethers.utils.parseEther("9000"),
            to: deployer.address,
            deadline: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        };
        
        const addLiquidityTx = await coreDEX.addLiquidity(addLiquidityParams);
        const receipt = await addLiquidityTx.wait();
        console.log("Initial liquidity added successfully");
        
        // 14. Test a swap
        console.log("\n14. Testing swap functionality...");
        
        const swapAmount = ethers.utils.parseEther("100"); // 100 tokens
        await tokenA.approve(coreDEX.address, swapAmount);
        
        const swapParams = {
            tokenIn: tokenA.address,
            tokenOut: tokenB.address,
            amountIn: swapAmount,
            amountOutMin: ethers.utils.parseEther("90"), // Minimum 90 tokens out
            to: deployer.address,
            deadline: Math.floor(Date.now() / 1000) + 3600,
            useZeroSlippage: false
        };
        
        const swapTx = await coreDEX.swap(swapParams);
        const swapReceipt = await swapTx.wait();
        console.log("Test swap executed successfully");
        
        // 15. Get DEX statistics
        console.log("\n15. Getting DEX statistics...");
        const dexStats = await coreDEX.getDEXStats();
        console.log("DEX Statistics:");
        console.log("- Total Trades:", dexStats.totalTradesCount.toString());
        console.log("- Total Volume:", ethers.utils.formatEther(dexStats.totalVolumeAmount));
        console.log("- Total Liquidity:", ethers.utils.formatEther(dexStats.totalLiquidityAmount));
        console.log("- Total Value Locked:", ethers.utils.formatEther(dexStats.totalValueLockedAmount));
        console.log("- Total Pairs:", dexStats.totalPairs.toString());
        
        // 16. Save deployment results
        console.log("\n16. Saving deployment results...");
        
        const deploymentData = {
            network: "core_testnet",
            timestamp: new Date().toISOString(),
            deployer: deployer.address,
            contracts: deploymentResults,
            dexStats: {
                totalTrades: dexStats.totalTradesCount.toString(),
                totalVolume: ethers.utils.formatEther(dexStats.totalVolumeAmount),
                totalLiquidity: ethers.utils.formatEther(dexStats.totalLiquidityAmount),
                totalValueLocked: ethers.utils.formatEther(dexStats.totalValueLockedAmount),
                totalPairs: dexStats.totalPairs.toString()
            },
            testData: {
                tokenA: tokenA.address,
                tokenB: tokenB.address,
                testPairId: pairId,
                initialLiquidityA: ethers.utils.formatEther(liquidityAmountA),
                initialLiquidityB: ethers.utils.formatEther(liquidityAmountB)
            }
        };
        
        const deploymentPath = path.join(__dirname, '../deployments/dex-deployment.json');
        
        // Create deployments directory if it doesn't exist
        const deploymentsDir = path.dirname(deploymentPath);
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir, { recursive: true });
        }
        
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
        console.log("Deployment results saved to:", deploymentPath);
        
        // 17. Update contracts.ts file
        console.log("\n17. Updating contracts configuration...");
        
        const contractsConfig = `// Auto-generated contract addresses from DEX deployment
// Generated on: ${new Date().toISOString()}

export const DEX_CONTRACT_ADDRESSES = {
  CORE_DEX: '${coreDEX.address}',
  CORE_DEX_ROUTER: '${coreDEXRouter.address}',
  CORE_DEX_FACTORY: '${coreDEXFactory.address}',
  ZERO_SLIPPAGE_ENGINE: '${zeroSlippageEngine.address}',
  INFINITE_LIQUIDITY_ENGINE: '${infiniteLiquidityEngine.address}',
  UNIFIED_LIQUIDITY_LAYER: '${unifiedLiquidityLayer.address}',
  ORACLE_ROUTER: '${oracleRouter.address}',
  UNIFIED_LP_TOKEN: '${unifiedLPToken.address}',
  IDLE_CAPITAL_MANAGER: '${idleCapitalManager.address}',
  VAULT_MANAGER: '${vaultManager.address}'
};

export const TEST_TOKENS = {
  TOKEN_A: '${tokenA.address}',
  TOKEN_B: '${tokenB.address}'
};

export const TEST_PAIR_ID = '${pairId}';

// DEX ABI exports
export const CORE_DEX_ABI = [
  'function createPair(address tokenA, address tokenB, uint256 feeRate) external returns (bytes32 pairId)',
  'function addLiquidity(tuple(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) params) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)',
  'function removeLiquidity(tuple(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) params) external returns (uint256 amountA, uint256 amountB)',
  'function swap(tuple(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin, address to, uint256 deadline, bool useZeroSlippage) params) external returns (uint256 amountOut)',
  'function getSwapQuote(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256 amountOut, uint256 fee, uint256 priceImpact, bool zeroSlippageAvailable)',
  'function getAllPairs() external view returns (bytes32[] memory)',
  'function getPairInfo(bytes32 pairId) external view returns (tuple(address tokenA, address tokenB, uint256 reserveA, uint256 reserveB, uint256 totalSupply, uint256 feeRate, uint256 kLast, bool isActive, uint256 createdAt, uint256 lastTradeTimestamp, uint256 totalVolume, uint256 totalFees))',
  'function getDEXStats() external view returns (uint256 totalTradesCount, uint256 totalVolumeAmount, uint256 totalLiquidityAmount, uint256 totalValueLockedAmount, uint256 totalPairs)',
  'event PairCreated(address indexed token0, address indexed token1, bytes32 indexed pairId, uint256 timestamp)',
  'event LiquidityAdded(address indexed provider, bytes32 indexed pairId, uint256 amountA, uint256 amountB, uint256 liquidity, uint256 timestamp)',
  'event LiquidityRemoved(address indexed provider, bytes32 indexed pairId, uint256 amountA, uint256 amountB, uint256 liquidity, uint256 timestamp)',
  'event Swap(address indexed trader, bytes32 indexed pairId, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, uint256 fee, bool zeroSlippage, uint256 timestamp)'
];

export const CORE_DEX_ROUTER_ABI = [
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline, bool useZeroSlippage) external returns (uint256[] memory amounts)',
  'function zapIntoLiquidity(tuple(address tokenIn, address tokenA, address tokenB, uint256 amountIn, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) params) external returns (uint256 liquidity)',
  'function getOptimalSwapPath(address tokenIn, address tokenOut, uint256 amountIn) external view returns (address[] memory path, uint256 expectedAmountOut, uint256 priceImpact)',
  'function checkArbitrageOpportunity(address[] calldata tokens, uint256 amountIn) external view returns (bool exists, uint256 expectedProfit, uint256 profitPercentage)'
];
`;
        
        const contractsPath = path.join(__dirname, '../lib/dex-contracts.ts');
        fs.writeFileSync(contractsPath, contractsConfig);
        console.log("Contracts configuration saved to:", contractsPath);
        
        console.log("\n=== DEX/AMM Deployment Completed Successfully! ===");
        console.log("\n📊 Deployment Summary:");
        console.log("- CoreDEX:", coreDEX.address);
        console.log("- CoreDEXRouter:", coreDEXRouter.address);
        console.log("- CoreDEXFactory:", coreDEXFactory.address);
        console.log("- ZeroSlippageEngine:", zeroSlippageEngine.address);
        console.log("- InfiniteLiquidityEngine:", infiniteLiquidityEngine.address);
        console.log("\n🎯 Key Features Implemented:");
        console.log("✅ Complete AMM with constant product formula");
        console.log("✅ Zero-slippage trading engine");
        console.log("✅ Infinite liquidity aggregation");
        console.log("✅ Multi-hop routing");
        console.log("✅ Liquidity zapping");
        console.log("✅ Arbitrage detection");
        console.log("✅ Factory pattern for scalability");
        console.log("✅ Comprehensive fee management");
        console.log("\n🚀 Ready for Core Chain DeFi ecosystem!");
        
    } catch (error) {
        console.error("\n❌ Deployment failed:", error);
        
        // Save error log
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack,
            deploymentResults
        };
        
        const errorPath = path.join(__dirname, '../deployments/dex-deployment-error.json');
        const deploymentsDir = path.dirname(errorPath);
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir, { recursive: true });
        }
        
        fs.writeFileSync(errorPath, JSON.stringify(errorLog, null, 2));
        console.log("Error log saved to:", errorPath);
        
        process.exit(1);
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