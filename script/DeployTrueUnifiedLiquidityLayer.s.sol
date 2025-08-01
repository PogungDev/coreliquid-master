// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/TrueUnifiedLiquidityLayer.sol";
import "../contracts/SimpleToken.sol";

/**
 * @title DeployTrueUnifiedLiquidityLayer
 * @dev Deployment script for TrueUnifiedLiquidityLayer on Core testnet
 * @notice Deploys the complete True Unified Liquidity Layer system
 */
contract DeployTrueUnifiedLiquidityLayer is Script {
    // Core testnet addresses (update these as needed)
    address public constant TREASURY = 0x742D35cC6634c0532925a3b8D4c9Db96C4B5Da5e; // Example treasury
    address public constant DEPLOYER = 0x742D35cC6634c0532925a3b8D4c9Db96C4B5Da5e; // Example deployer
    
    // Test token configurations
    struct TokenConfig {
        string name;
        string symbol;
        uint8 decimals;
        uint256 initialSupply;
    }
    
    // Protocol configurations for testing
    struct ProtocolConfig {
        string name;
        uint256 apy; // in basis points (500 = 5%)
        uint256 maxCapacity;
        uint256 riskScore; // 1-100, lower is safer
    }
    
    TrueUnifiedLiquidityLayer public liquidityLayer;
    SimpleToken public coreToken;
    SimpleToken public btcToken;
    SimpleToken public ethToken;
    SimpleToken public usdcToken;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== Deploying True Unified Liquidity Layer ===");
        console.log("Deployer:", msg.sender);
        console.log("Treasury:", TREASURY);
        
        // 1. Deploy TrueUnifiedLiquidityLayer
        liquidityLayer = new TrueUnifiedLiquidityLayer(TREASURY);
        console.log("TrueUnifiedLiquidityLayer deployed at:", address(liquidityLayer));
        
        // 2. Deploy test tokens
        _deployTestTokens();
        
        // 3. Setup supported assets
        _setupSupportedAssets();
        
        // 4. Deploy and register mock protocols
        _deployMockProtocols();
        
        // 5. Setup initial configuration
        _setupInitialConfiguration();
        
        // 6. Verify deployment
        _verifyDeployment();
        
        vm.stopBroadcast();
        
        console.log("=== Deployment Summary ===");
        console.log("TrueUnifiedLiquidityLayer:", address(liquidityLayer));
        console.log("CORE Token:", address(coreToken));
        console.log("BTC Token:", address(btcToken));
        console.log("ETH Token:", address(ethToken));
        console.log("USDC Token:", address(usdcToken));
        console.log("Treasury:", TREASURY);
        console.log("Total Value Locked:", liquidityLayer.getTotalValueLocked());
        
        // Save deployment info
        _saveDeploymentInfo();
    }
    
    function _deployTestTokens() internal {
        console.log("\n=== Deploying Test Tokens ===");
        
        // Deploy CORE token (simulated)
        coreToken = new SimpleToken(
            "Core Token",
            "CORE",
            18,
            1000000 * 1e18 // 1M tokens
        );
        console.log("CORE Token deployed at:", address(coreToken));
        
        // Deploy BTC token (simulated)
        btcToken = new SimpleToken(
            "Bitcoin Token",
            "BTC",
            8,
            21000 * 1e8 // 21K tokens with 8 decimals
        );
        console.log("BTC Token deployed at:", address(btcToken));
        
        // Deploy ETH token (simulated)
        ethToken = new SimpleToken(
            "Ethereum Token",
            "ETH",
            18,
            100000 * 1e18 // 100K tokens
        );
        console.log("ETH Token deployed at:", address(ethToken));
        
        // Deploy USDC token (simulated)
        usdcToken = new SimpleToken(
            "USD Coin",
            "USDC",
            6,
            10000000 * 1e6 // 10M tokens with 6 decimals
        );
        console.log("USDC Token deployed at:", address(usdcToken));
    }
    
    function _setupSupportedAssets() internal {
        console.log("\n=== Setting up Supported Assets ===");
        
        liquidityLayer.addSupportedAsset(address(coreToken));
        console.log("Added CORE as supported asset");
        
        liquidityLayer.addSupportedAsset(address(btcToken));
        console.log("Added BTC as supported asset");
        
        liquidityLayer.addSupportedAsset(address(ethToken));
        console.log("Added ETH as supported asset");
        
        liquidityLayer.addSupportedAsset(address(usdcToken));
        console.log("Added USDC as supported asset");
    }
    
    function _deployMockProtocols() internal {
        console.log("\n=== Deploying Mock Protocols ===");
        
        // Deploy mock protocol contracts (simplified for demo)
        MockProtocol protocol1 = new MockProtocol("CoreStaking Protocol");
        MockProtocol protocol2 = new MockProtocol("BTCFi Protocol");
        MockProtocol protocol3 = new MockProtocol("DeFi Yield Protocol");
        MockProtocol protocol4 = new MockProtocol("Lending Protocol");
        
        console.log("Mock Protocol 1 deployed at:", address(protocol1));
        console.log("Mock Protocol 2 deployed at:", address(protocol2));
        console.log("Mock Protocol 3 deployed at:", address(protocol3));
        console.log("Mock Protocol 4 deployed at:", address(protocol4));
        
        // Register protocols with different APYs and risk profiles
        liquidityLayer.registerProtocol(
            address(protocol1),
            "CoreStaking Protocol",
            800, // 8% APY
            1000000 * 1e18, // 1M capacity
            15 // Low risk
        );
        
        liquidityLayer.registerProtocol(
            address(protocol2),
            "BTCFi Protocol",
            1200, // 12% APY
            500000 * 1e18, // 500K capacity
            35 // Medium risk
        );
        
        liquidityLayer.registerProtocol(
            address(protocol3),
            "DeFi Yield Protocol",
            1500, // 15% APY
            300000 * 1e18, // 300K capacity
            55 // Higher risk
        );
        
        liquidityLayer.registerProtocol(
            address(protocol4),
            "Lending Protocol",
            600, // 6% APY
            2000000 * 1e18, // 2M capacity
            10 // Very low risk
        );
        
        console.log("All protocols registered successfully");
    }
    
    function _setupInitialConfiguration() internal {
        console.log("\n=== Setting up Initial Configuration ===");
        
        // Set protocol fees
        liquidityLayer.setProtocolFee(100); // 1%
        liquidityLayer.setTreasuryFee(50);   // 0.5%
        
        console.log("Protocol fee set to 1%");
        console.log("Treasury fee set to 0.5%");
        
        // Grant roles to deployer for testing
        liquidityLayer.grantRole(liquidityLayer.KEEPER_ROLE(), msg.sender);
        liquidityLayer.grantRole(liquidityLayer.REBALANCER_ROLE(), msg.sender);
        liquidityLayer.grantRole(liquidityLayer.EMERGENCY_ROLE(), msg.sender);
        
        console.log("Roles granted to deployer for testing");
    }
    
    function _verifyDeployment() internal view {
        console.log("\n=== Verifying Deployment ===");
        
        // Verify contract addresses
        require(address(liquidityLayer) != address(0), "LiquidityLayer not deployed");
        require(address(coreToken) != address(0), "CORE token not deployed");
        require(address(btcToken) != address(0), "BTC token not deployed");
        require(address(ethToken) != address(0), "ETH token not deployed");
        require(address(usdcToken) != address(0), "USDC token not deployed");
        
        // Verify supported assets
        require(liquidityLayer.supportedAssets(address(coreToken)), "CORE not supported");
        require(liquidityLayer.supportedAssets(address(btcToken)), "BTC not supported");
        require(liquidityLayer.supportedAssets(address(ethToken)), "ETH not supported");
        require(liquidityLayer.supportedAssets(address(usdcToken)), "USDC not supported");
        
        // Verify treasury
        require(liquidityLayer.treasury() == TREASURY, "Treasury not set correctly");
        
        // Verify fees
        require(liquidityLayer.protocolFee() == 100, "Protocol fee not set correctly");
        require(liquidityLayer.treasuryFee() == 50, "Treasury fee not set correctly");
        
        console.log("All verifications passed!");
    }
    
    function _saveDeploymentInfo() internal {
        string memory deploymentInfo = string.concat(
            "# True Unified Liquidity Layer Deployment\n\n",
            "## Contract Addresses\n",
            "- TrueUnifiedLiquidityLayer: ", vm.toString(address(liquidityLayer)), "\n",
            "- CORE Token: ", vm.toString(address(coreToken)), "\n",
            "- BTC Token: ", vm.toString(address(btcToken)), "\n",
            "- ETH Token: ", vm.toString(address(ethToken)), "\n",
            "- USDC Token: ", vm.toString(address(usdcToken)), "\n\n",
            "## Configuration\n",
            "- Treasury: ", vm.toString(TREASURY), "\n",
            "- Protocol Fee: 1%\n",
            "- Treasury Fee: 0.5%\n\n",
            "## Features\n",
            "- Cross-protocol asset sharing without token transfer\n",
            "- Automatic idle capital detection and reallocation\n",
            "- Multi-protocol yield optimization\n",
            "- Emergency controls and pause functionality\n",
            "- Comprehensive role-based access control\n"
        );
        
        vm.writeFile("./DEPLOYMENT_INFO.md", deploymentInfo);
        console.log("\nDeployment info saved to DEPLOYMENT_INFO.md");
    }
}

/**
 * @title MockProtocol
 * @dev Simple mock protocol for testing
 */
contract MockProtocol {
    string public name;
    address public liquidityLayer;
    
    mapping(address => uint256) public deposits;
    
    event Deposit(address indexed user, address indexed asset, uint256 amount);
    event Withdraw(address indexed user, address indexed asset, uint256 amount);
    
    constructor(string memory _name) {
        name = _name;
    }
    
    function setLiquidityLayer(address _liquidityLayer) external {
        liquidityLayer = _liquidityLayer;
    }
    
    function deposit(address asset, uint256 amount) external {
        // Simulate protocol deposit
        deposits[asset] += amount;
        emit Deposit(msg.sender, asset, amount);
    }
    
    function withdraw(address asset, uint256 amount) external {
        require(deposits[asset] >= amount, "Insufficient deposits");
        deposits[asset] -= amount;
        emit Withdraw(msg.sender, asset, amount);
    }
    
    function getDeposits(address asset) external view returns (uint256) {
        return deposits[asset];
    }
}