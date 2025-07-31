// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IPortfolioManager
 * @dev Interface for the Portfolio Manager contract
 * @author CoreLiquid Protocol
 */
interface IPortfolioManager {
    // Events
    event PortfolioCreated(
        bytes32 indexed portfolioId,
        address indexed owner,
        string name,
        PortfolioType portfolioType,
        uint256 timestamp
    );
    
    event AssetAdded(
        bytes32 indexed portfolioId,
        address indexed asset,
        uint256 amount,
        uint256 targetWeight,
        uint256 timestamp
    );
    
    event AssetRemoved(
        bytes32 indexed portfolioId,
        address indexed asset,
        uint256 amount,
        uint256 timestamp
    );
    
    event PortfolioRebalanced(
        bytes32 indexed portfolioId,
        uint256[] oldWeights,
        uint256[] newWeights,
        uint256 rebalanceCost,
        uint256 timestamp
    );
    
    event TargetAllocationUpdated(
        bytes32 indexed portfolioId,
        address indexed asset,
        uint256 oldWeight,
        uint256 newWeight,
        uint256 timestamp
    );
    
    event PerformanceCalculated(
        bytes32 indexed portfolioId,
        uint256 totalReturn,
        uint256 annualizedReturn,
        uint256 volatility,
        uint256 sharpeRatio,
        uint256 timestamp
    );
    
    event RiskAssessmentCompleted(
        bytes32 indexed portfolioId,
        uint256 riskScore,
        uint256 valueAtRisk,
        uint256 maxDrawdown,
        uint256 timestamp
    );
    
    event StrategyExecuted(
        bytes32 indexed portfolioId,
        bytes32 indexed strategyId,
        StrategyType strategyType,
        uint256 impact,
        uint256 timestamp
    );
    
    event DividendReceived(
        bytes32 indexed portfolioId,
        address indexed asset,
        uint256 amount,
        uint256 timestamp
    );
    
    event PortfolioOptimized(
        bytes32 indexed portfolioId,
        OptimizationType optimizationType,
        uint256 improvementScore,
        uint256 timestamp
    );
    
    event BenchmarkSet(
        bytes32 indexed portfolioId,
        bytes32 indexed benchmarkId,
        uint256 timestamp
    );
    
    event AlertTriggered(
        bytes32 indexed portfolioId,
        AlertType alertType,
        uint256 threshold,
        uint256 currentValue,
        uint256 timestamp
    );
    
    event AllocationUpdated(
        address indexed portfolioId,
        address indexed asset,
        uint256 newTargetAllocation,
        uint256 timestamp
    );
    
    event StrategyUpdated(
        address indexed portfolioId,
        StrategyType strategyType,
        uint256 timestamp
    );
    
    event RiskProfileUpdated(
        address indexed portfolioId,
        RiskLevel riskLevel,
        uint256 timestamp
    );
    
    event FeesCollected(
        address indexed portfolioId,
        uint256 managementFee,
        uint256 performanceFee,
        uint256 timestamp
    );
    
    event EmergencyStop(
        address indexed portfolioId,
        uint256 timestamp
    );
    
    event EmergencyWithdraw(
        address indexed portfolioId,
        address indexed asset,
        uint256 timestamp
    );
    
    event PortfolioConfigUpdated(
        uint256 timestamp
    );

    // Structs
    struct Asset {
        address asset;
        uint256 balance;
        uint256 targetAllocation;
        uint256 currentAllocation;
        uint256 lastUpdate;
        bool isActive;
    }
    
    struct AllocationTarget {
        address asset;
        uint256 targetAllocation;
        uint256 confidence;
        string reasoning;
    }
    
    struct RebalanceHistory {
        uint256 timestamp;
        RebalanceTrigger trigger;
        uint256 gasUsed;
        bool success;
    }
    
    struct StrategyConfig {
        StrategyType strategyType;
        bytes customParams;
        bool isActive;
        uint256 rebalanceThreshold;
        uint256 riskTolerance;
        uint256 maxSlippage;
        uint256 minProfitThreshold;
        bool autoRebalance;
        bool autoCompound;
        uint256 lastUpdate;
    }

    struct RiskLimits {
        uint256 maxDailyLoss;
        uint256 maxWeeklyLoss;
        uint256 maxMonthlyLoss;
        uint256 maxPortfolioRisk;
        uint256 maxSingleAssetExposure;
        uint256 maxCorrelatedExposure;
        uint256 minLiquidityRatio;
        uint256 maxLeverageRatio;
        uint256 stopLossThreshold;
        uint256 marginCallThreshold;
    }

    struct RiskPreferences {
        bool autoLiquidation;
        bool riskAlerts;
        bool autoRebalancing;
        uint256 alertThreshold;
        uint256 rebalanceThreshold;
        bool emergencyMode;
        uint256 riskBudget;
        uint256 strategy; // Using uint256 instead of RiskStrategy enum
    }

    struct RiskProfile {
        address user;
        uint256 overallRiskScore;
        RiskLevel riskTolerance;
        uint256 maxPositionSize;
        uint256 maxLeverage;
        uint256 maxConcentration;
        uint256 liquidityRequirement;
        bool isHighRisk;
        uint256 lastAssessment;
        RiskLimits limits;
        RiskPreferences preferences;
    }
    
    struct Portfolio {
        bytes32 portfolioId;
        string name;
        address owner;
        PortfolioType portfolioType;
        uint256 totalValue;
        uint256 cashBalance;
        AssetHolding[] holdings;
        uint256[] targetWeights;
        PortfolioConfig config;
        PerformanceMetrics performance;
        RiskMetrics risk;
        uint256 createdAt;
        uint256 lastUpdate;
        bool isActive;
    }
    
    struct AssetHolding {
        address asset;
        uint256 amount;
        uint256 value;
        uint256 weight;
        uint256 targetWeight;
        uint256 averageCost;
        uint256 unrealizedPnL;
        uint256 realizedPnL;
        uint256 dividends;
        uint256 lastUpdate;
        AssetMetrics metrics;
    }
    
    struct AssetMetrics {
        uint256 volatility;
        uint256 beta;
        uint256 alpha;
        uint256 correlation;
        uint256 sharpeRatio;
        uint256 informationRatio;
        uint256 trackingError;
        uint256 maxDrawdown;
        uint256 calmarRatio;
        uint256 sortinoRatio;
    }
    
    struct PortfolioConfig {
        uint256 rebalanceThreshold; // Basis points
        uint256 rebalanceFrequency; // Seconds
        bool autoRebalance;
        uint256 maxPositionSize; // Basis points
        uint256 minPositionSize; // Basis points
        uint256 maxAssets;
        uint256 riskTolerance; // 1-10 scale
        bool allowLeverage;
        uint256 maxLeverage;
        bool allowShortSelling;
        RebalanceStrategy rebalanceStrategy;
    }
    
    struct PerformanceMetrics {
        uint256 totalReturn;
        uint256 annualizedReturn;
        uint256 volatility;
        uint256 sharpeRatio;
        uint256 informationRatio;
        uint256 calmarRatio;
        uint256 sortinoRatio;
        uint256 treynorRatio;
        uint256 jensenAlpha;
        uint256 trackingError;
        uint256 maxDrawdown;
        uint256 winRate;
        uint256 averageWin;
        uint256 averageLoss;
        uint256 profitFactor;
        uint256 lastUpdate;
    }
    
    struct RiskMetrics {
        uint256 valueAtRisk; // 95% confidence
        uint256 conditionalVaR;
        uint256 beta;
        uint256 correlation;
        uint256 concentrationRisk;
        uint256 liquidityRisk;
        uint256 creditRisk;
        uint256 marketRisk;
        uint256 diversificationRatio;
        uint256 riskBudget;
        uint256 riskContribution;
        uint256 lastUpdate;
    }
    
    struct InvestmentStrategy {
        bytes32 strategyId;
        string name;
        StrategyType strategyType;
        address creator;
        StrategyParameters parameters;
        StrategyRules rules;
        PerformanceMetrics performance;
        bool isActive;
        bool isPublic;
        uint256 createdAt;
        uint256 subscriberCount;
        uint256 totalAUM;
    }
    
    struct StrategyParameters {
        uint256 riskTolerance;
        uint256 returnTarget;
        uint256 timeHorizon;
        uint256 rebalanceFrequency;
        uint256 maxDrawdown;
        uint256 maxVolatility;
        bool allowLeverage;
        bool allowDerivatives;
        string[] allowedAssets;
        string[] excludedAssets;
    }
    
    struct StrategyRules {
        AllocationRule[] allocationRules;
        RiskRule[] riskRules;
        RebalanceRule[] rebalanceRules;
        TradingRule[] tradingRules;
    }
    
    struct AllocationRule {
        string assetClass;
        uint256 minWeight;
        uint256 maxWeight;
        uint256 targetWeight;
        bool isDynamic;
    }
    
    struct RiskRule {
        RiskType riskType;
        uint256 maxExposure;
        uint256 alertThreshold;
        bool isHardLimit;
    }
    
    struct RebalanceRule {
        RebalanceTrigger trigger;
        uint256 threshold;
        uint256 frequency;
        bool isActive;
    }
    
    struct TradingRule {
        TradingCondition condition;
        TradingAction action;
        uint256 threshold;
        bool isActive;
    }
    
    struct OptimizationResult {
        bytes32 optimizationId;
        bytes32 portfolioId;
        OptimizationType optimizationType;
        uint256[] currentWeights;
        uint256[] optimizedWeights;
        uint256 expectedReturn;
        uint256 expectedRisk;
        uint256 sharpeRatio;
        uint256 improvementScore;
        uint256 implementationCost;
        uint256 timestamp;
        bool isImplemented;
    }
    
    struct Benchmark {
        bytes32 benchmarkId;
        string name;
        BenchmarkType benchmarkType;
        address[] components;
        uint256[] weights;
        uint256 totalReturn;
        uint256 volatility;
        uint256 sharpeRatio;
        uint256 lastUpdate;
        bool isActive;
    }
    
    struct PortfolioComparison {
        bytes32 portfolioId1;
        bytes32 portfolioId2;
        uint256 returnDifference;
        uint256 riskDifference;
        uint256 sharpeDifference;
        uint256 correlationCoefficient;
        uint256 trackingError;
        uint256 informationRatio;
        ComparisonMetrics metrics;
    }
    
    struct ComparisonMetrics {
        uint256 outperformancePeriods;
        uint256 totalPeriods;
        uint256 maxOutperformance;
        uint256 maxUnderperformance;
        uint256 averageOutperformance;
        uint256 volatilityOfOutperformance;
        uint256 hitRatio;
    }
    
    struct RebalanceProposal {
        bytes32 proposalId;
        bytes32 portfolioId;
        uint256[] currentWeights;
        uint256[] proposedWeights;
        Trade[] requiredTrades;
        uint256 estimatedCost;
        uint256 expectedBenefit;
        uint256 riskImpact;
        uint256 createdAt;
        uint256 expiresAt;
        bool isExecuted;
    }
    
    struct Trade {
        address asset;
        TradeType tradeType;
        uint256 amount;
        uint256 estimatedPrice;
        uint256 estimatedCost;
        uint256 priority;
    }
    
    struct PortfolioAlert {
        bytes32 alertId;
        bytes32 portfolioId;
        AlertType alertType;
        uint256 threshold;
        uint256 currentValue;
        uint256 severity;
        string message;
        uint256 timestamp;
        bool isAcknowledged;
        bool isResolved;
    }

    // Enums
    enum PortfolioType {
        CONSERVATIVE,
        MODERATE,
        AGGRESSIVE,
        BALANCED,
        GROWTH,
        INCOME,
        CUSTOM
    }
    
    enum StrategyType {
        BUY_AND_HOLD,
        MOMENTUM,
        MEAN_REVERSION,
        RISK_PARITY,
        MINIMUM_VARIANCE,
        MAXIMUM_DIVERSIFICATION,
        FACTOR_BASED,
        TACTICAL_ALLOCATION,
        DYNAMIC_HEDGING
    }
    
    enum OptimizationType {
        MEAN_VARIANCE,
        RISK_PARITY,
        MINIMUM_VARIANCE,
        MAXIMUM_SHARPE,
        MAXIMUM_RETURN,
        MINIMUM_RISK,
        BLACK_LITTERMAN,
        ROBUST_OPTIMIZATION
    }
    
    enum RebalanceStrategy {
        THRESHOLD_BASED,
        TIME_BASED,
        VOLATILITY_BASED,
        MOMENTUM_BASED,
        CALENDAR_BASED,
        DYNAMIC
    }
    
    enum RiskType {
        CONCENTRATION,
        VOLATILITY,
        DRAWDOWN,
        VAR,
        BETA,
        CORRELATION
    }
    
    enum RebalanceTrigger {
        WEIGHT_DEVIATION,
        TIME_INTERVAL,
        VOLATILITY_CHANGE,
        PERFORMANCE_THRESHOLD,
        RISK_LIMIT,
        MARKET_CONDITION
    }
    
    enum TradingCondition {
        PRICE_THRESHOLD,
        VOLUME_THRESHOLD,
        VOLATILITY_THRESHOLD,
        MOMENTUM_SIGNAL,
        TECHNICAL_INDICATOR,
        FUNDAMENTAL_METRIC
    }
    
    enum TradingAction {
        BUY,
        SELL,
        HOLD,
        REBALANCE,
        HEDGE,
        REDUCE_POSITION
    }
    
    enum BenchmarkType {
        MARKET_INDEX,
        CUSTOM_BASKET,
        PEER_GROUP,
        ABSOLUTE_RETURN,
        RISK_FREE_RATE
    }
    
    enum TradeType {
        BUY,
        SELL,
        SWAP
    }
    
    enum AlertType {
        PERFORMANCE_ALERT,
        RISK_ALERT,
        REBALANCE_ALERT,
        DRAWDOWN_ALERT,
        CONCENTRATION_ALERT,
        BENCHMARK_ALERT
    }

    enum RiskLevel {
        VERY_LOW,
        LOW,
        MEDIUM,
        HIGH,
        VERY_HIGH,
        CRITICAL
    }

    enum OptimizationObjective {
        MAXIMIZE_YIELD,
        MINIMIZE_RISK,
        BALANCED_APPROACH,
        MAXIMIZE_LIQUIDITY,
        MINIMIZE_GAS,
        CUSTOM_OBJECTIVE
    }

    struct SystemMetrics {
        uint256 totalPortfolios;
        uint256 activePortfolios;
        uint256 totalAssets;
        uint256 totalValue;
        uint256 totalRebalances;
        uint256 averagePerformance;
        uint256 systemHealth;
        uint256 lastUpdate;
    }

    struct PortfolioSettings {
        bool autoRebalance;
        uint256 rebalanceThreshold;
        uint256 maxSlippage;
        bool emergencyStop;
        uint256 maxDrawdown;
        uint256 riskTolerance;
        bool allowLeverage;
        uint256 maxLeverage;
        bool notifications;
        uint256 lastUpdate;
    }

    struct FeeStructure {
        uint256 managementFee;
        uint256 performanceFee;
        uint256 lastFeeCollection;
        uint256 totalFeesCollected;
        uint256 entryFee;
        uint256 exitFee;
        uint256 highWaterMark;
        bool feeOnProfit;
        address feeRecipient;
        uint256 lastUpdate;
    }

    struct PortfolioAnalytics {
        uint256 totalValue;
        uint256 totalReturn;
        uint256 annualizedReturn;
        uint256 volatility;
        uint256 sharpeRatio;
        uint256 maxDrawdown;
        uint256 calmarRatio;
        uint256 sortinoRatio;
        uint256 informationRatio;
        uint256 trackingError;
        uint256 beta;
        uint256 alpha;
        uint256 correlation;
        uint256 valueAtRisk;
        uint256 conditionalVaR;
        uint256 winRate;
        uint256 profitFactor;
        uint256 averageWin;
        uint256 averageLoss;
        uint256 totalTrades;
        uint256 successfulTrades;
        uint256 lastUpdate;
    }

    struct RebalanceExecution {
        bytes32 rebalanceId;
        address portfolioId;
        uint256 timestamp;
        address executor;
        bool success;
        uint256 gasUsed;
        uint256 totalValue;
        uint256 slippage;
        string failureReason;
        uint256[] preAllocations;
        uint256[] postAllocations;
        address[] assetsRebalanced;
        uint256[] amountsTraded;
    }

    // Core portfolio management functions
    function createPortfolio(
        string calldata name,
        PortfolioType portfolioType,
        PortfolioConfig calldata config
    ) external returns (bytes32 portfolioId);
    
    function addAsset(
        bytes32 portfolioId,
        address asset,
        uint256 amount,
        uint256 targetWeight
    ) external;
    
    function removeAsset(
        bytes32 portfolioId,
        address asset,
        uint256 amount
    ) external;
    
    function updateTargetAllocation(
        bytes32 portfolioId,
        address[] calldata assets,
        uint256[] calldata targetWeights
    ) external;
    
    function rebalancePortfolio(
        bytes32 portfolioId
    ) external returns (bool success);
    
    // Advanced portfolio functions
    function optimizePortfolio(
        bytes32 portfolioId,
        OptimizationType optimizationType
    ) external returns (OptimizationResult memory result);
    
    function implementOptimization(
        bytes32 optimizationId
    ) external returns (bool success);
    
    function createRebalanceProposal(
        bytes32 portfolioId
    ) external returns (RebalanceProposal memory proposal);
    
    function executeRebalanceProposal(
        bytes32 proposalId
    ) external returns (bool success);
    
    function clonePortfolio(
        bytes32 sourcePortfolioId,
        string calldata newName
    ) external returns (bytes32 newPortfolioId);
    
    // Strategy management functions
    function createStrategy(
        string calldata name,
        StrategyType strategyType,
        StrategyParameters calldata parameters,
        StrategyRules calldata rules
    ) external returns (bytes32 strategyId);
    
    function applyStrategy(
        bytes32 portfolioId,
        bytes32 strategyId
    ) external returns (bool success);
    
    function updateStrategy(
        bytes32 strategyId,
        StrategyParameters calldata parameters,
        StrategyRules calldata rules
    ) external;
    
    function subscribeToStrategy(
        bytes32 portfolioId,
        bytes32 strategyId
    ) external;
    
    function unsubscribeFromStrategy(
        bytes32 portfolioId,
        bytes32 strategyId
    ) external;
    
    // Performance analysis functions
    function calculatePerformance(
        bytes32 portfolioId,
        uint256 timeframe
    ) external returns (PerformanceMetrics memory metrics);
    
    function calculateRiskMetrics(
        bytes32 portfolioId,
        uint256 timeframe
    ) external returns (RiskMetrics memory metrics);
    
    function comparePortfolios(
        bytes32 portfolioId1,
        bytes32 portfolioId2,
        uint256 timeframe
    ) external view returns (PortfolioComparison memory comparison);
    
    function benchmarkPerformance(
        bytes32 portfolioId,
        bytes32 benchmarkId,
        uint256 timeframe
    ) external view returns (
        uint256 alpha,
        uint256 beta,
        uint256 trackingError,
        uint256 informationRatio
    );
    
    function attributePerformance(
        bytes32 portfolioId,
        uint256 timeframe
    ) external view returns (
        uint256 assetSelection,
        uint256 assetAllocation,
        uint256 interaction,
        uint256 total
    );
    
    // Risk management functions
    function assessPortfolioRisk(
        bytes32 portfolioId
    ) external returns (RiskMetrics memory risk);
    
    function calculateVaR(
        bytes32 portfolioId,
        uint256 confidence,
        uint256 timeHorizon
    ) external view returns (uint256 valueAtRisk);
    
    function stressTestPortfolio(
        bytes32 portfolioId,
        int256[] calldata shocks
    ) external view returns (uint256 portfolioImpact);
    
    function checkRiskLimits(
        bytes32 portfolioId
    ) external view returns (bool withinLimits, string[] memory violations);
    
    function hedgePortfolio(
        bytes32 portfolioId,
        address hedgeInstrument,
        uint256 hedgeRatio
    ) external returns (bool success);
    
    // Benchmark management functions
    function createBenchmark(
        string calldata name,
        BenchmarkType benchmarkType,
        address[] calldata components,
        uint256[] calldata weights
    ) external returns (bytes32 benchmarkId);
    
    function setBenchmark(
        bytes32 portfolioId,
        bytes32 benchmarkId
    ) external;
    
    function updateBenchmark(
        bytes32 benchmarkId,
        address[] calldata components,
        uint256[] calldata weights
    ) external;
    
    function calculateBenchmarkReturn(
        bytes32 benchmarkId,
        uint256 timeframe
    ) external view returns (uint256 totalReturn);
    
    // Alert management functions
    function createAlert(
        bytes32 portfolioId,
        AlertType alertType,
        uint256 threshold
    ) external returns (bytes32 alertId);
    
    function updateAlert(
        bytes32 alertId,
        uint256 newThreshold
    ) external;
    
    function acknowledgeAlert(
        bytes32 alertId
    ) external;
    
    function resolveAlert(
        bytes32 alertId
    ) external;
    
    function checkAlerts(
        bytes32 portfolioId
    ) external returns (PortfolioAlert[] memory triggeredAlerts);
    
    // Dividend and income functions
    function recordDividend(
        bytes32 portfolioId,
        address asset,
        uint256 amount
    ) external;
    
    function reinvestDividends(
        bytes32 portfolioId
    ) external returns (bool success);
    
    function withdrawDividends(
        bytes32 portfolioId,
        uint256 amount
    ) external returns (bool success);
    
    function calculateYield(
        bytes32 portfolioId,
        uint256 timeframe
    ) external view returns (uint256 dividendYield, uint256 totalYield);
    
    // Configuration functions
    function updatePortfolioConfig(
        bytes32 portfolioId,
        PortfolioConfig calldata newConfig
    ) external;
    
    function setRebalanceThreshold(
        bytes32 portfolioId,
        uint256 threshold
    ) external;
    
    function setRiskTolerance(
        bytes32 portfolioId,
        uint256 riskTolerance
    ) external;
    
    function enableAutoRebalance(
        bytes32 portfolioId,
        bool enabled
    ) external;
    
    function setMaxPositionSize(
        bytes32 portfolioId,
        uint256 maxSize
    ) external;
    
    // Emergency functions
    function pausePortfolio(
        bytes32 portfolioId
    ) external;
    
    function unpausePortfolio(
        bytes32 portfolioId
    ) external;
    
    function emergencyLiquidate(
        bytes32 portfolioId,
        uint256 percentage
    ) external returns (uint256 liquidatedValue);
    
    function freezeAsset(
        bytes32 portfolioId,
        address asset
    ) external;
    
    function unfreezeAsset(
        bytes32 portfolioId,
        address asset
    ) external;
    
    // View functions - Portfolio information
    function getPortfolio(
        bytes32 portfolioId
    ) external view returns (Portfolio memory);
    
    function getUserPortfolios(
        address user
    ) external view returns (bytes32[] memory);
    
    function getPortfolioValue(
        bytes32 portfolioId
    ) external view returns (uint256 totalValue);
    
    function getPortfolioHoldings(
        bytes32 portfolioId
    ) external view returns (AssetHolding[] memory);
    
    function getAssetWeight(
        bytes32 portfolioId,
        address asset
    ) external view returns (uint256 currentWeight, uint256 targetWeight);
    
    function getPortfolioConfig(
        bytes32 portfolioId
    ) external view returns (PortfolioConfig memory);
    
    function isPortfolioActive(
        bytes32 portfolioId
    ) external view returns (bool);
    
    // View functions - Performance
    function getPerformanceMetrics(
        bytes32 portfolioId
    ) external view returns (PerformanceMetrics memory);
    
    function getRiskMetrics(
        bytes32 portfolioId
    ) external view returns (RiskMetrics memory);
    
    function getTotalReturn(
        bytes32 portfolioId,
        uint256 timeframe
    ) external view returns (uint256 totalReturn);
    
    function getAnnualizedReturn(
        bytes32 portfolioId,
        uint256 timeframe
    ) external view returns (uint256 annualizedReturn);
    
    function getVolatility(
        bytes32 portfolioId,
        uint256 timeframe
    ) external view returns (uint256 volatility);
    
    function getSharpeRatio(
        bytes32 portfolioId,
        uint256 timeframe
    ) external view returns (uint256 sharpeRatio);
    
    function getMaxDrawdown(
        bytes32 portfolioId,
        uint256 timeframe
    ) external view returns (uint256 maxDrawdown);
    
    // View functions - Strategies
    function getStrategy(
        bytes32 strategyId
    ) external view returns (InvestmentStrategy memory);
    
    function getAllStrategies() external view returns (bytes32[] memory);
    
    function getPublicStrategies() external view returns (bytes32[] memory);
    
    function getStrategyPerformance(
        bytes32 strategyId
    ) external view returns (PerformanceMetrics memory);
    
    function getPortfolioStrategies(
        bytes32 portfolioId
    ) external view returns (bytes32[] memory);
    
    // View functions - Benchmarks
    function getBenchmark(
        bytes32 benchmarkId
    ) external view returns (Benchmark memory);
    
    function getAllBenchmarks() external view returns (bytes32[] memory);
    
    function getPortfolioBenchmark(
        bytes32 portfolioId
    ) external view returns (bytes32 benchmarkId);
    
    function getBenchmarkPerformance(
        bytes32 benchmarkId,
        uint256 timeframe
    ) external view returns (uint256 totalReturn, uint256 volatility);
    
    // View functions - Optimization
    function getOptimizationResult(
        bytes32 optimizationId
    ) external view returns (OptimizationResult memory);
    
    function getRebalanceProposal(
        bytes32 proposalId
    ) external view returns (RebalanceProposal memory);
    
    function needsRebalancing(
        bytes32 portfolioId
    ) external view returns (bool needs, uint256 deviation);
    
    function getOptimalWeights(
        bytes32 portfolioId,
        OptimizationType optimizationType
    ) external view returns (uint256[] memory weights);
    
    // View functions - Alerts
    function getAlert(
        bytes32 alertId
    ) external view returns (PortfolioAlert memory);
    
    function getPortfolioAlerts(
        bytes32 portfolioId
    ) external view returns (bytes32[] memory);
    
    function getActiveAlerts(
        bytes32 portfolioId
    ) external view returns (bytes32[] memory);
    
    function getUnacknowledgedAlerts(
        bytes32 portfolioId
    ) external view returns (bytes32[] memory);
    
    // View functions - Analytics
    function getPortfolioAnalytics(
        address portfolioId
    ) external view returns (PortfolioAnalytics memory);
    
    function getPortfolioCount() external view returns (uint256);
    
    function getTotalAUM() external view returns (uint256);
    
    function getAveragePortfolioSize() external view returns (uint256);
    
    function getTopPerformingPortfolios(
        uint256 count,
        uint256 timeframe
    ) external view returns (bytes32[] memory portfolios, uint256[] memory returnValues);
    
    function getAssetAllocation(
        address asset
    ) external view returns (uint256 totalAllocation, uint256 portfolioCount);
    
    function getSystemHealth() external view returns (
        bool isHealthy,
        uint256 totalPortfolios,
        uint256 activePortfolios,
        uint256 averagePerformance
    );
}