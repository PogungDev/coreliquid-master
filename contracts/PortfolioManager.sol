// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./interfaces/IPortfolioManager.sol";
import "./interfaces/IOracle.sol";
import "./interfaces/IRiskManagement.sol";

/**
 * @title PortfolioManager
 * @dev Comprehensive portfolio management system for CoreLiquid Protocol
 * @author CoreLiquid Protocol
 */
contract PortfolioManager is IPortfolioManager, AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using Math for uint256;

    // Roles
    bytes32 public constant PORTFOLIO_MANAGER_ROLE = keccak256("PORTFOLIO_MANAGER_ROLE");
    bytes32 public constant STRATEGY_MANAGER_ROLE = keccak256("STRATEGY_MANAGER_ROLE");
    bytes32 public constant REBALANCER_ROLE = keccak256("REBALANCER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant ANALYST_ROLE = keccak256("ANALYST_ROLE");

    // Constants
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant PRECISION = 1e18;
    uint256 public constant MAX_ASSETS_PER_PORTFOLIO = 50;
    uint256 public constant MIN_REBALANCE_THRESHOLD = 100; // 1%
    uint256 public constant MAX_REBALANCE_THRESHOLD = 2000; // 20%
    uint256 public constant PERFORMANCE_FEE_CAP = 2000; // 20%
    uint256 public constant MANAGEMENT_FEE_CAP = 500; // 5%

    // External contracts
    IOracle public immutable oracle;
    IRiskManagement public immutable riskManagement;

    // Storage mappings
    mapping(address => Portfolio) public portfolios;
    mapping(address => Asset[]) public portfolioAssets;
    mapping(address => AllocationTarget[]) public allocationTargets;
    mapping(address => PerformanceMetrics) public performanceMetrics;
    mapping(address => RebalanceHistory[]) public rebalanceHistory;
    mapping(address => StrategyConfig) public strategyConfigs;
    mapping(address => RiskProfile) public riskProfiles;
    mapping(address => PortfolioSettings) public portfolioSettings;
    mapping(address => FeeStructure) public feeStructures;
    mapping(address => PortfolioAnalytics) public portfolioAnalytics;
    mapping(address => address[]) public userPortfolios;
    mapping(bytes32 => RebalanceExecution) public rebalanceExecutions;
    
    // Global arrays
    address[] public allPortfolios;
    address[] public activeStrategies;
    bytes32[] public allRebalances;
    
    // Portfolio configuration
    PortfolioConfig public config;
    
    // Counters
    uint256 public totalPortfolios;
    uint256 public totalRebalances;
    uint256 public totalStrategies;
    uint256 public totalAssets;

    // State variables
    bool public emergencyMode;
    uint256 public lastGlobalRebalance;
    mapping(address => uint256) public lastPortfolioUpdate;
    mapping(address => bool) public isPortfolioActive;

    constructor(
        address _oracle,
        address _riskManagement,
        uint256 _managementFee,
        uint256 _performanceFee
    ) {
        require(_oracle != address(0), "Invalid oracle");
        require(_riskManagement != address(0), "Invalid risk management");
        require(_managementFee <= MANAGEMENT_FEE_CAP, "Management fee too high");
        require(_performanceFee <= PERFORMANCE_FEE_CAP, "Performance fee too high");
        
        oracle = IOracle(_oracle);
        riskManagement = IRiskManagement(_riskManagement);
        
        config = PortfolioConfig({
            defaultManagementFee: _managementFee,
            defaultPerformanceFee: _performanceFee,
            minPortfolioValue: 1000e18, // $1000
            maxPortfolioValue: 100000000e18, // $100M
            rebalanceThreshold: 500, // 5%
            maxSlippage: 300, // 3%
            emergencyThreshold: 1000, // 10%
            isActive: true
        });
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PORTFOLIO_MANAGER_ROLE, msg.sender);
        _grantRole(STRATEGY_MANAGER_ROLE, msg.sender);
        _grantRole(REBALANCER_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        _grantRole(ANALYST_ROLE, msg.sender);
    }

    // Core portfolio management functions
    function createPortfolio(
        string calldata name,
        string calldata description,
        StrategyType strategyType,
        RiskLevel riskLevel
    ) external override returns (address portfolioId) {
        portfolioId = address(uint160(uint256(keccak256(abi.encodePacked(msg.sender, name, block.timestamp)))));
        
        Portfolio storage portfolio = portfolios[portfolioId];
        portfolio.portfolioId = portfolioId;
        portfolio.owner = msg.sender;
        portfolio.name = name;
        portfolio.description = description;
        portfolio.strategyType = strategyType;
        portfolio.riskLevel = riskLevel;
        portfolio.createdAt = block.timestamp;
        portfolio.lastUpdate = block.timestamp;
        portfolio.isActive = true;
        
        // Initialize portfolio settings
        PortfolioSettings storage settings = portfolioSettings[portfolioId];
        settings.autoRebalance = true;
        settings.rebalanceThreshold = config.rebalanceThreshold;
        settings.maxSlippage = config.maxSlippage;
        settings.emergencyStop = false;
        
        // Initialize fee structure
        FeeStructure storage fees = feeStructures[portfolioId];
        fees.managementFee = config.defaultManagementFee;
        fees.performanceFee = config.defaultPerformanceFee;
        fees.lastFeeCollection = block.timestamp;
        
        userPortfolios[msg.sender].push(portfolioId);
        allPortfolios.push(portfolioId);
        isPortfolioActive[portfolioId] = true;
        totalPortfolios++;
        
        emit PortfolioCreated(portfolioId, msg.sender, name, strategyType, riskLevel, block.timestamp);
        
        return portfolioId;
    }

    function addAsset(
        address portfolioId,
        address asset,
        uint256 amount,
        uint256 targetAllocation
    ) external override onlyPortfolioOwner(portfolioId) {
        require(asset != address(0), "Invalid asset");
        require(amount > 0, "Invalid amount");
        require(targetAllocation <= BASIS_POINTS, "Invalid allocation");
        require(portfolioAssets[portfolioId].length < MAX_ASSETS_PER_PORTFOLIO, "Too many assets");
        
        // Transfer asset to portfolio
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        
        // Add to portfolio assets
        Asset memory newAsset = Asset({
            asset: asset,
            balance: amount,
            targetAllocation: targetAllocation,
            currentAllocation: 0, // Will be calculated
            lastUpdate: block.timestamp,
            isActive: true
        });
        
        portfolioAssets[portfolioId].push(newAsset);
        
        // Update portfolio value
        _updatePortfolioValue(portfolioId);
        
        // Recalculate allocations
        _recalculateAllocations(portfolioId);
        
        emit AssetAdded(portfolioId, asset, amount, targetAllocation, block.timestamp);
    }

    function removeAsset(
        address portfolioId,
        address asset
    ) external override onlyPortfolioOwner(portfolioId) {
        require(asset != address(0), "Invalid asset");
        
        Asset[] storage assets = portfolioAssets[portfolioId];
        uint256 assetIndex = type(uint256).max;
        
        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i].asset == asset) {
                assetIndex = i;
                break;
            }
        }
        
        require(assetIndex != type(uint256).max, "Asset not found");
        
        // Transfer asset back to owner
        uint256 balance = assets[assetIndex].balance;
        if (balance > 0) {
            IERC20(asset).safeTransfer(msg.sender, balance);
        }
        
        // Remove asset from array
        assets[assetIndex] = assets[assets.length - 1];
        assets.pop();
        
        // Update portfolio value
        _updatePortfolioValue(portfolioId);
        
        // Recalculate allocations
        _recalculateAllocations(portfolioId);
        
        emit AssetRemoved(portfolioId, asset, balance, block.timestamp);
    }

    function updateAllocation(
        address portfolioId,
        address asset,
        uint256 newTargetAllocation
    ) external override onlyPortfolioOwner(portfolioId) {
        require(asset != address(0), "Invalid asset");
        require(newTargetAllocation <= BASIS_POINTS, "Invalid allocation");
        
        Asset[] storage assets = portfolioAssets[portfolioId];
        bool found = false;
        
        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i].asset == asset) {
                assets[i].targetAllocation = newTargetAllocation;
                assets[i].lastUpdate = block.timestamp;
                found = true;
                break;
            }
        }
        
        require(found, "Asset not found");
        
        // Validate total allocations don't exceed 100%
        _validateAllocations(portfolioId);
        
        emit AllocationUpdated(portfolioId, asset, newTargetAllocation, block.timestamp);
    }

    function rebalancePortfolio(
        address portfolioId
    ) external override onlyRole(REBALANCER_ROLE) nonReentrant {
        require(isPortfolioActive[portfolioId], "Portfolio not active");
        
        Portfolio storage portfolio = portfolios[portfolioId];
        require(portfolio.isActive, "Portfolio inactive");
        
        // Check if rebalancing is needed
        bool needsRebalancing = _checkRebalanceNeeded(portfolioId);
        require(needsRebalancing, "Rebalancing not needed");
        
        // Execute rebalancing
        bytes32 rebalanceId = _executeRebalance(portfolioId);
        
        // Update portfolio
        portfolio.lastRebalance = block.timestamp;
        portfolio.lastUpdate = block.timestamp;
        lastPortfolioUpdate[portfolioId] = block.timestamp;
        
        emit PortfolioRebalanced(portfolioId, rebalanceId, block.timestamp);
    }

    function setStrategy(
        address portfolioId,
        StrategyConfig calldata strategy
    ) external override onlyPortfolioOwner(portfolioId) {
        require(strategy.strategyType != StrategyType.CUSTOM || strategy.customParams.length > 0, "Invalid custom strategy");
        
        strategyConfigs[portfolioId] = strategy;
        
        // Update portfolio strategy type
        portfolios[portfolioId].strategyType = strategy.strategyType;
        portfolios[portfolioId].lastUpdate = block.timestamp;
        
        emit StrategyUpdated(portfolioId, strategy.strategyType, block.timestamp);
    }

    function calculatePerformance(
        address portfolioId
    ) external override returns (PerformanceMetrics memory) {
        require(isPortfolioActive[portfolioId], "Portfolio not active");
        
        PerformanceMetrics storage metrics = performanceMetrics[portfolioId];
        
        // Calculate current portfolio value
        uint256 currentValue = _calculatePortfolioValue(portfolioId);
        
        // Calculate returns
        if (metrics.initialValue > 0) {
            metrics.totalReturn = currentValue > metrics.initialValue 
                ? ((currentValue - metrics.initialValue) * BASIS_POINTS) / metrics.initialValue
                : 0;
        } else {
            metrics.initialValue = currentValue;
        }
        
        // Calculate other metrics
        metrics.currentValue = currentValue;
        metrics.lastUpdate = block.timestamp;
        metrics.sharpeRatio = _calculateSharpeRatio(portfolioId);
        metrics.maxDrawdown = _calculateMaxDrawdown(portfolioId);
        metrics.volatility = _calculateVolatility(portfolioId);
        metrics.alpha = _calculateAlpha(portfolioId);
        metrics.beta = _calculateBeta(portfolioId);
        
        emit PerformanceCalculated(portfolioId, currentValue, metrics.totalReturn, block.timestamp);
        
        return metrics;
    }

    function updateRiskProfile(
        address portfolioId,
        RiskProfile calldata newRiskProfile
    ) external override onlyPortfolioOwner(portfolioId) {
        riskProfiles[portfolioId] = newRiskProfile;
        
        // Update portfolio risk level
        portfolios[portfolioId].riskLevel = newRiskProfile.riskLevel;
        portfolios[portfolioId].lastUpdate = block.timestamp;
        
        emit RiskProfileUpdated(portfolioId, newRiskProfile.riskLevel, block.timestamp);
    }

    function optimizePortfolio(
        address portfolioId,
        OptimizationObjective objective
    ) external override onlyRole(ANALYST_ROLE) returns (AllocationTarget[] memory) {
        require(isPortfolioActive[portfolioId], "Portfolio not active");
        
        // Get current portfolio state
        Asset[] storage assets = portfolioAssets[portfolioId];
        require(assets.length > 0, "No assets in portfolio");
        
        // Calculate optimal allocations based on objective
        AllocationTarget[] memory targets = _calculateOptimalAllocations(portfolioId, objective);
        
        // Store optimization targets
        delete allocationTargets[portfolioId];
        for (uint256 i = 0; i < targets.length; i++) {
            allocationTargets[portfolioId].push(targets[i]);
        }
        
        emit PortfolioOptimized(portfolioId, objective, targets.length, block.timestamp);
        
        return targets;
    }

    function executeStrategy(
        address portfolioId,
        bytes calldata strategyData
    ) external override onlyRole(STRATEGY_MANAGER_ROLE) {
        require(isPortfolioActive[portfolioId], "Portfolio not active");
        
        StrategyConfig storage strategy = strategyConfigs[portfolioId];
        require(strategy.isActive, "Strategy not active");
        
        // Execute strategy based on type
        if (strategy.strategyType == StrategyType.BALANCED) {
            _executeBalancedStrategy(portfolioId, strategyData);
        } else if (strategy.strategyType == StrategyType.GROWTH) {
            _executeGrowthStrategy(portfolioId, strategyData);
        } else if (strategy.strategyType == StrategyType.CONSERVATIVE) {
            _executeConservativeStrategy(portfolioId, strategyData);
        } else if (strategy.strategyType == StrategyType.AGGRESSIVE) {
            _executeAggressiveStrategy(portfolioId, strategyData);
        } else {
            _executeCustomStrategy(portfolioId, strategyData);
        }
        
        // Update portfolio
        portfolios[portfolioId].lastUpdate = block.timestamp;
        
        emit StrategyExecuted(portfolioId, strategy.strategyType, block.timestamp);
    }

    function collectFees(
        address portfolioId
    ) external override onlyRole(PORTFOLIO_MANAGER_ROLE) {
        require(isPortfolioActive[portfolioId], "Portfolio not active");
        
        FeeStructure storage fees = feeStructures[portfolioId];
        uint256 currentValue = _calculatePortfolioValue(portfolioId);
        
        // Calculate management fee
        uint256 timePeriod = block.timestamp - fees.lastFeeCollection;
        uint256 managementFee = (currentValue * fees.managementFee * timePeriod) / (BASIS_POINTS * 365 days);
        
        // Calculate performance fee
        PerformanceMetrics storage metrics = performanceMetrics[portfolioId];
        uint256 performanceFee = 0;
        if (currentValue > metrics.highWaterMark) {
            uint256 profit = currentValue - metrics.highWaterMark;
            performanceFee = (profit * fees.performanceFee) / BASIS_POINTS;
            metrics.highWaterMark = currentValue;
        }
        
        uint256 totalFees = managementFee + performanceFee;
        
        if (totalFees > 0) {
            fees.totalFeesCollected += totalFees;
            fees.lastFeeCollection = block.timestamp;
            
            // Transfer fees (implementation depends on fee collection mechanism)
            emit FeesCollected(portfolioId, managementFee, performanceFee, block.timestamp);
        }
    }

    // Emergency functions
    function emergencyStop(
        address portfolioId
    ) external override onlyRole(EMERGENCY_ROLE) {
        portfolioSettings[portfolioId].emergencyStop = true;
        portfolios[portfolioId].isActive = false;
        
        emit EmergencyStop(portfolioId, block.timestamp);
    }

    function emergencyWithdraw(
        address portfolioId,
        address asset
    ) external override onlyRole(EMERGENCY_ROLE) {
        require(portfolioSettings[portfolioId].emergencyStop, "Emergency stop not active");
        
        Asset[] storage assets = portfolioAssets[portfolioId];
        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i].asset == asset) {
                uint256 balance = assets[i].balance;
                if (balance > 0) {
                    IERC20(asset).safeTransfer(portfolios[portfolioId].owner, balance);
                    assets[i].balance = 0;
                }
                break;
            }
        }
        
        emit EmergencyWithdraw(portfolioId, asset, block.timestamp);
    }

    function pausePortfolio(
        address portfolioId
    ) external override onlyRole(EMERGENCY_ROLE) {
        portfolios[portfolioId].isActive = false;
        isPortfolioActive[portfolioId] = false;
    }

    // Configuration functions
    function updatePortfolioConfig(
        PortfolioConfig calldata newConfig
    ) external onlyRole(PORTFOLIO_MANAGER_ROLE) {
        require(newConfig.defaultManagementFee <= MANAGEMENT_FEE_CAP, "Management fee too high");
        require(newConfig.defaultPerformanceFee <= PERFORMANCE_FEE_CAP, "Performance fee too high");
        require(newConfig.rebalanceThreshold >= MIN_REBALANCE_THRESHOLD && 
                newConfig.rebalanceThreshold <= MAX_REBALANCE_THRESHOLD, "Invalid rebalance threshold");
        
        config = newConfig;
        
        emit PortfolioConfigUpdated(block.timestamp);
    }

    // View functions
    function getPortfolio(address portfolioId) external view override returns (Portfolio memory) {
        return portfolios[portfolioId];
    }

    function getPortfolioAssets(address portfolioId) external view override returns (Asset[] memory) {
        return portfolioAssets[portfolioId];
    }

    function getAllocationTargets(address portfolioId) external view override returns (AllocationTarget[] memory) {
        return allocationTargets[portfolioId];
    }

    function getPerformanceMetrics(address portfolioId) external view override returns (PerformanceMetrics memory) {
        return performanceMetrics[portfolioId];
    }

    function getRebalanceHistory(address portfolioId) external view override returns (RebalanceHistory[] memory) {
        return rebalanceHistory[portfolioId];
    }

    function getStrategyConfig(address portfolioId) external view override returns (StrategyConfig memory) {
        return strategyConfigs[portfolioId];
    }

    function getRiskProfile(address portfolioId) external view override returns (RiskProfile memory) {
        return riskProfiles[portfolioId];
    }

    function getPortfolioSettings(address portfolioId) external view override returns (PortfolioSettings memory) {
        return portfolioSettings[portfolioId];
    }

    function getFeeStructure(address portfolioId) external view override returns (FeeStructure memory) {
        return feeStructures[portfolioId];
    }

    function getPortfolioAnalytics(address portfolioId) external view override returns (PortfolioAnalytics memory) {
        return portfolioAnalytics[portfolioId];
    }

    function getPortfolioConfig() external view override returns (PortfolioConfig memory) {
        return config;
    }

    function getUserPortfolios(address user) external view override returns (address[] memory) {
        return userPortfolios[user];
    }

    function getAllPortfolios() external view override returns (address[] memory) {
        return allPortfolios;
    }

    function getPortfolioValue(address portfolioId) external view override returns (uint256) {
        return _calculatePortfolioValue(portfolioId);
    }

    function getSystemMetrics() external view override returns (SystemMetrics memory) {
        return SystemMetrics({
            totalPortfolios: totalPortfolios,
            activePortfolios: _countActivePortfolios(),
            totalAssets: totalAssets,
            totalValue: _calculateTotalSystemValue(),
            totalRebalances: totalRebalances,
            averagePerformance: _calculateAveragePerformance(),
            systemHealth: _calculateSystemHealth(),
            lastUpdate: block.timestamp
        });
    }

    // Internal functions
    function _updatePortfolioValue(address portfolioId) internal {
        uint256 newValue = _calculatePortfolioValue(portfolioId);
        portfolios[portfolioId].totalValue = newValue;
        portfolios[portfolioId].lastUpdate = block.timestamp;
        lastPortfolioUpdate[portfolioId] = block.timestamp;
    }

    function _calculatePortfolioValue(address portfolioId) internal view returns (uint256) {
        Asset[] storage assets = portfolioAssets[portfolioId];
        uint256 totalValue = 0;
        
        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i].isActive && assets[i].balance > 0) {
                uint256 price = oracle.getPrice(assets[i].asset);
                totalValue += (assets[i].balance * price) / PRECISION;
            }
        }
        
        return totalValue;
    }

    function _recalculateAllocations(address portfolioId) internal {
        Asset[] storage assets = portfolioAssets[portfolioId];
        uint256 totalValue = _calculatePortfolioValue(portfolioId);
        
        if (totalValue > 0) {
            for (uint256 i = 0; i < assets.length; i++) {
                if (assets[i].isActive) {
                    uint256 price = oracle.getPrice(assets[i].asset);
                    uint256 assetValue = (assets[i].balance * price) / PRECISION;
                    assets[i].currentAllocation = (assetValue * BASIS_POINTS) / totalValue;
                }
            }
        }
    }

    function _validateAllocations(address portfolioId) internal view {
        Asset[] storage assets = portfolioAssets[portfolioId];
        uint256 totalAllocation = 0;
        
        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i].isActive) {
                totalAllocation += assets[i].targetAllocation;
            }
        }
        
        require(totalAllocation <= BASIS_POINTS, "Total allocation exceeds 100%");
    }

    function _checkRebalanceNeeded(address portfolioId) internal view returns (bool) {
        Asset[] storage assets = portfolioAssets[portfolioId];
        uint256 threshold = portfolioSettings[portfolioId].rebalanceThreshold;
        
        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i].isActive) {
                uint256 deviation = assets[i].currentAllocation > assets[i].targetAllocation
                    ? assets[i].currentAllocation - assets[i].targetAllocation
                    : assets[i].targetAllocation - assets[i].currentAllocation;
                
                if (deviation > threshold) {
                    return true;
                }
            }
        }
        
        return false;
    }

    function _executeRebalance(address portfolioId) internal returns (bytes32) {
        bytes32 rebalanceId = keccak256(abi.encodePacked(portfolioId, block.timestamp));
        
        RebalanceExecution storage execution = rebalanceExecutions[rebalanceId];
        execution.rebalanceId = rebalanceId;
        execution.portfolioId = portfolioId;
        execution.timestamp = block.timestamp;
        execution.executor = msg.sender;
        execution.success = true; // Simplified for now
        
        // Add to history
        RebalanceHistory memory historyEntry = RebalanceHistory({
            timestamp: block.timestamp,
            trigger: RebalanceTrigger.MANUAL,
            gasUsed: gasleft(),
            success: true
        });
        
        rebalanceHistory[portfolioId].push(historyEntry);
        allRebalances.push(rebalanceId);
        totalRebalances++;
        
        return rebalanceId;
    }

    function _calculateOptimalAllocations(
        address portfolioId,
        OptimizationObjective objective
    ) internal view returns (AllocationTarget[] memory) {
        Asset[] storage assets = portfolioAssets[portfolioId];
        AllocationTarget[] memory targets = new AllocationTarget[](assets.length);
        
        // Simplified optimization - equal weight for now
        uint256 equalWeight = BASIS_POINTS / assets.length;
        
        for (uint256 i = 0; i < assets.length; i++) {
            targets[i] = AllocationTarget({
                asset: assets[i].asset,
                targetAllocation: equalWeight,
                confidence: 8000, // 80%
                reasoning: "Equal weight optimization"
            });
        }
        
        return targets;
    }

    function _calculateSharpeRatio(address portfolioId) internal view returns (uint256) {
        // Simplified Sharpe ratio calculation
        return 150; // 1.5
    }

    function _calculateMaxDrawdown(address portfolioId) internal view returns (uint256) {
        // Simplified max drawdown calculation
        return 500; // 5%
    }

    function _calculateVolatility(address portfolioId) internal view returns (uint256) {
        // Simplified volatility calculation
        return 1000; // 10%
    }

    function _calculateAlpha(address portfolioId) internal view returns (uint256) {
        // Simplified alpha calculation
        return 200; // 2%
    }

    function _calculateBeta(address portfolioId) internal view returns (uint256) {
        // Simplified beta calculation
        return 110; // 1.1
    }

    function _executeBalancedStrategy(address portfolioId, bytes calldata data) internal {
        // Implement balanced strategy
    }

    function _executeGrowthStrategy(address portfolioId, bytes calldata data) internal {
        // Implement growth strategy
    }

    function _executeConservativeStrategy(address portfolioId, bytes calldata data) internal {
        // Implement conservative strategy
    }

    function _executeAggressiveStrategy(address portfolioId, bytes calldata data) internal {
        // Implement aggressive strategy
    }

    function _executeCustomStrategy(address portfolioId, bytes calldata data) internal {
        // Implement custom strategy
    }

    function _countActivePortfolios() internal view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < allPortfolios.length; i++) {
            if (isPortfolioActive[allPortfolios[i]]) {
                count++;
            }
        }
        return count;
    }

    function _calculateTotalSystemValue() internal view returns (uint256) {
        uint256 totalValue = 0;
        for (uint256 i = 0; i < allPortfolios.length; i++) {
            if (isPortfolioActive[allPortfolios[i]]) {
                totalValue += _calculatePortfolioValue(allPortfolios[i]);
            }
        }
        return totalValue;
    }

    function _calculateAveragePerformance() internal view returns (uint256) {
        if (allPortfolios.length == 0) return 0;
        
        uint256 totalReturn = 0;
        uint256 activePortfolios = 0;
        
        for (uint256 i = 0; i < allPortfolios.length; i++) {
            if (isPortfolioActive[allPortfolios[i]]) {
                totalReturn += performanceMetrics[allPortfolios[i]].totalReturn;
                activePortfolios++;
            }
        }
        
        return activePortfolios > 0 ? totalReturn / activePortfolios : 0;
    }

    function _calculateSystemHealth() internal view returns (uint256) {
        return _countActivePortfolios() * BASIS_POINTS / Math.max(allPortfolios.length, 1);
    }

    // Modifiers
    modifier onlyPortfolioOwner(address portfolioId) {
        require(portfolios[portfolioId].owner == msg.sender, "Not portfolio owner");
        _;
    }

    // Emergency functions
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}