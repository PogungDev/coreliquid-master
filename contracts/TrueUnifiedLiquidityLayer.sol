// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./interfaces/IUnifiedLiquidityLayer.sol";

/**
 * @title TrueUnifiedLiquidityLayer
 * @dev True Unified Liquidity Layer dengan sistem loop otomatis dan cross-protocol
 * @notice Single storage untuk semua aset dengan akses tanpa token transfer
 * @author CoreLiquid Protocol - Hackathon Implementation
 */
contract TrueUnifiedLiquidityLayer is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using Math for uint256;

    // Role definitions
    bytes32 public constant PROTOCOL_ROLE = keccak256("PROTOCOL_ROLE");
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant REBALANCER_ROLE = keccak256("REBALANCER_ROLE");

    // Core data structures
    struct AssetState {
        uint256 totalDeposited;
        uint256 totalUtilized;
        uint256 idleThreshold;
        uint256 lastRebalanceTimestamp;
        uint256 totalYieldGenerated;
        uint256 averageAPY;
        uint256 pendingFees;
        bool isActive;
        bool autoRebalanceEnabled;
    }

    struct ProtocolInfo {
        address protocolAddress;
        string protocolName;
        uint256 currentAPY;
        uint256 totalAllocated;
        uint256 maxCapacity;
        uint256 riskScore; // 1-100, lower is safer
        bool isActive;
        bool isVerified;
        uint256 lastYieldUpdate;
    }

    struct UserPosition {
        uint256 totalDeposited;
        uint256 totalWithdrawn;
        uint256 yieldEarned;
        uint256 lastInteractionTime;
        uint256 shares;
        bool isActive;
    }

    struct RebalanceConfig {
        uint256 minIdleThreshold; // Minimum idle capital before rebalance
        uint256 maxUtilizationRate; // Maximum utilization per protocol
        uint256 rebalanceInterval; // Minimum time between rebalances
        uint256 yieldDifferenceThreshold; // Minimum APY difference for rebalance
        bool autoRebalanceEnabled;
    }

    // Storage mappings
    mapping(address => AssetState) public assetStates;
    mapping(address => mapping(address => uint256)) public userBalances; // user -> asset -> balance
    mapping(address => mapping(address => UserPosition)) public userPositions; // user -> asset -> position
    mapping(address => mapping(address => uint256)) public protocolAllocations; // protocol -> asset -> allocated
    mapping(address => ProtocolInfo) public registeredProtocols;
    mapping(address => bool) public supportedAssets;
    mapping(address => RebalanceConfig) public rebalanceConfigs;
    
    // Protocol tracking
    address[] public protocolList;
    address[] public assetList;
    
    // Global configuration
    uint256 public constant PRECISION = 1e18;
    uint256 public constant MAX_PROTOCOLS = 50;
    uint256 public constant REBALANCE_COOLDOWN = 1 hours;
    uint256 public constant DAILY_REBALANCE_INTERVAL = 24 hours;
    uint256 public constant MIN_YIELD_DIFFERENCE = 50; // 0.5% minimum yield difference for rebalance
    uint256 public protocolFee = 100; // 1% in basis points
    uint256 public treasuryFee = 50; // 0.5% in basis points
    address public treasury;
    
    // Auto-rebalance state
    mapping(address => uint256) public lastDailyRebalance;
    mapping(address => bool) public autoRebalanceEnabled;
    uint256 public globalRebalanceCounter = 0;

    // Events
    event Deposited(address indexed user, address indexed asset, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, address indexed asset, uint256 amount, uint256 shares);
    event AssetAccessed(address indexed protocol, address indexed asset, uint256 amount, address indexed user);
    event AssetReturned(address indexed protocol, address indexed asset, uint256 amount, uint256 yield);
    event IdleDetected(address indexed asset, uint256 idleAmount, address indexed targetProtocol);
    event Reallocated(address indexed fromProtocol, address indexed toProtocol, address indexed asset, uint256 amount);
    event ProtocolRegistered(address indexed protocol, string name, uint256 apy);
    event YieldHarvested(address indexed asset, address indexed protocol, uint256 yieldAmount);
    event AutoRebalanceExecuted(address indexed asset, uint256 totalReallocated, uint256 newAPY);
    event EmergencyWithdrawal(address indexed asset, address indexed protocol, uint256 amount);
    
    // New events for enhanced features
    event ProtocolAllocated(address indexed protocol, address indexed asset, uint256 amount, uint256 expectedYield);
    event ProtocolDeallocated(address indexed protocol, address indexed asset, uint256 amount, uint256 actualYield);
    event DailyRebalanceExecuted(address indexed asset, uint256 totalMoved, uint256 protocolsAffected, uint256 newWeightedAPY);
    event CrossProtocolAccessOptimized(address indexed fromProtocol, address indexed toProtocol, address indexed asset, uint256 amount);
    event YieldOptimizationTriggered(address indexed asset, uint256 oldAPY, uint256 newAPY, uint256 improvement);

    constructor(address _treasury) {
        require(_treasury != address(0), "Invalid treasury address");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROTOCOL_ROLE, msg.sender);
        _grantRole(KEEPER_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        _grantRole(REBALANCER_ROLE, msg.sender);
        
        treasury = _treasury;
    }

    // ============ CORE FUNCTIONS ============

    /**
     * @dev Deposit assets into the unified liquidity layer
     * @param asset Asset address to deposit
     * @param amount Amount to deposit
     * @param user User address (for protocol integrations)
     */
    function deposit(address asset, uint256 amount, address user) 
        external 
        onlyRole(PROTOCOL_ROLE) 
        nonReentrant 
        whenNotPaused 
    {
        require(supportedAssets[asset], "Asset not supported");
        require(amount > 0, "Amount must be greater than 0");
        require(user != address(0), "Invalid user address");

        // Transfer tokens to this contract
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);

        // Calculate shares
        uint256 shares = _calculateShares(asset, amount);
        
        // Update user balance and position
        userBalances[user][asset] += amount;
        userPositions[user][asset].totalDeposited += amount;
        userPositions[user][asset].shares += shares;
        userPositions[user][asset].lastInteractionTime = block.timestamp;
        userPositions[user][asset].isActive = true;
        
        // Update asset state
        assetStates[asset].totalDeposited += amount;
        
        // Add to asset list if new
        if (!assetStates[asset].isActive) {
            assetStates[asset].isActive = true;
            assetStates[asset].autoRebalanceEnabled = true;
            assetStates[asset].idleThreshold = amount / 10; // 10% threshold
            assetList.push(asset);
        }

        emit Deposited(user, asset, amount, shares);
        
        // Trigger auto-rebalance if conditions met
        _checkAndTriggerRebalance(asset);
    }

    /**
     * @dev Withdraw assets from the unified liquidity layer
     * @param asset Asset address to withdraw
     * @param amount Amount to withdraw
     * @param user User address
     */
    function withdraw(address asset, uint256 amount, address user) 
        external 
        onlyRole(PROTOCOL_ROLE) 
        nonReentrant 
        whenNotPaused 
    {
        require(userBalances[user][asset] >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");
        
        // Calculate shares to burn
        uint256 sharesToBurn = _calculateSharesToBurn(asset, amount, user);
        
        // Check if we need to withdraw from protocols
        uint256 availableBalance = IERC20(asset).balanceOf(address(this));
        if (availableBalance < amount) {
            _withdrawFromProtocols(asset, amount - availableBalance);
        }
        
        // Update user balance and position
        userBalances[user][asset] -= amount;
        userPositions[user][asset].totalWithdrawn += amount;
        userPositions[user][asset].shares -= sharesToBurn;
        userPositions[user][asset].lastInteractionTime = block.timestamp;
        
        // Update asset state
        assetStates[asset].totalDeposited -= amount;
        
        // Transfer tokens to user
        IERC20(asset).safeTransfer(user, amount);
        
        emit Withdrawn(user, asset, amount, sharesToBurn);
    }

    /**
     * @dev Cross-protocol asset access WITHOUT token transfer - Pure accounting update
     * @param protocol Protocol address requesting access
     * @param asset Asset to access
     * @param amount Amount to access
     * @param user User on whose behalf the access is made
     */
    function accessAssets(address protocol, address asset, uint256 amount, address user) 
        external 
        onlyRole(PROTOCOL_ROLE) 
        nonReentrant 
        whenNotPaused 
    {
        require(registeredProtocols[protocol].isActive, "Protocol not active");
        require(assetStates[asset].totalDeposited >= amount, "Insufficient total assets");
        require(userBalances[user][asset] >= amount, "Insufficient user balance");
        
        // PURE ACCOUNTING UPDATE - NO TOKEN TRANSFER
        // Virtual allocation tracking for cross-protocol access
        protocolAllocations[protocol][asset] += amount;
        assetStates[asset].totalUtilized += amount;
        
        // Track virtual user allocation to protocol
        userPositions[user][asset].lastInteractionTime = block.timestamp;
        
        // Optimize allocation automatically if beneficial
        _optimizeCrossProtocolAccess(protocol, asset, amount);
        
        emit AssetAccessed(protocol, asset, amount, user);
    }

    /**
     * @dev Return assets after protocol use with yield - Pure accounting update
     * @param protocol Protocol address returning assets
     * @param asset Asset being returned
     * @param amount Original amount
     * @param yieldGenerated Yield generated during usage
     */
    function returnAssets(address protocol, address asset, uint256 amount, uint256 yieldGenerated) 
        external 
        onlyRole(PROTOCOL_ROLE) 
        nonReentrant 
    {
        require(protocolAllocations[protocol][asset] >= amount, "Invalid return amount");
        
        // PURE ACCOUNTING UPDATE - NO TOKEN TRANSFER
        // Update virtual allocations
        protocolAllocations[protocol][asset] -= amount;
        assetStates[asset].totalUtilized -= amount;
        
        // Handle yield distribution (accounting only)
        if (yieldGenerated > 0) {
            _distributeYieldAccounting(asset, yieldGenerated);
        }
        
        // Update protocol performance metrics
        _updateProtocolPerformance(protocol, asset, amount, yieldGenerated);
        
        emit AssetReturned(protocol, asset, amount, yieldGenerated);
        
        // Trigger automatic reallocation after asset return
        _triggerAutomaticReallocation(asset);
    }

    /**
     * @dev Automatically allocate assets to optimal protocol based on yield
     * @param asset Asset to allocate
     * @param amount Amount to allocate
     * @return allocatedProtocol Address of protocol that received allocation
     * @return expectedYield Expected yield from allocation
     */
    function protocolAllocate(address asset, uint256 amount) 
        external 
        onlyRole(KEEPER_ROLE) 
        nonReentrant 
        returns (address allocatedProtocol, uint256 expectedYield) 
    {
        require(assetStates[asset].isActive, "Asset not active");
        require(amount > 0, "Amount must be greater than 0");
        require(IERC20(asset).balanceOf(address(this)) >= amount, "Insufficient contract balance");
        
        // Find optimal protocol for allocation
        allocatedProtocol = _findOptimalProtocolForAllocation(asset, amount);
        require(allocatedProtocol != address(0), "No suitable protocol found");
        
        // Calculate expected yield
        expectedYield = _calculateExpectedYield(allocatedProtocol, asset, amount);
        
        // Execute allocation
        _executeProtocolAllocation(allocatedProtocol, asset, amount);
        
        // Update tracking
        assetStates[asset].totalUtilized += amount;
        protocolAllocations[allocatedProtocol][asset] += amount;
        
        emit ProtocolAllocated(allocatedProtocol, asset, amount, expectedYield);
    }

    /**
     * @dev Automatically deallocate assets from underperforming protocols
     * @param asset Asset to deallocate
     * @param targetAmount Target amount to deallocate
     * @return deallocatedProtocol Address of protocol that assets were deallocated from
     * @return actualYield Actual yield received
     */
    function protocolDeallocate(address asset, uint256 targetAmount) 
        external 
        onlyRole(KEEPER_ROLE) 
        nonReentrant 
        returns (address deallocatedProtocol, uint256 actualYield) 
    {
        require(assetStates[asset].isActive, "Asset not active");
        require(targetAmount > 0, "Amount must be greater than 0");
        
        // Find underperforming protocol to deallocate from
        deallocatedProtocol = _findUnderperformingProtocol(asset, targetAmount);
        require(deallocatedProtocol != address(0), "No suitable protocol for deallocation");
        
        // Calculate actual yield received
        actualYield = _calculateActualYield(deallocatedProtocol, asset, targetAmount);
        
        // Execute deallocation
        uint256 actualAmount = _executeProtocolDeallocation(deallocatedProtocol, asset, targetAmount);
        
        // Update tracking
        assetStates[asset].totalUtilized -= actualAmount;
        protocolAllocations[deallocatedProtocol][asset] -= actualAmount;
        
        emit ProtocolDeallocated(deallocatedProtocol, asset, actualAmount, actualYield);
    }

    /**
     * @dev Execute daily automatic rebalancing for all assets
     * @param assets Array of assets to rebalance
     */
    function executeDailyRebalance(address[] calldata assets) 
        external 
        onlyRole(KEEPER_ROLE) 
        nonReentrant 
    {
        uint256 totalProtocolsAffected = 0;
        
        for (uint256 i = 0; i < assets.length; i++) {
            address asset = assets[i];
            
            // Check if daily rebalance is due
            if (block.timestamp >= lastDailyRebalance[asset] + DAILY_REBALANCE_INTERVAL && 
                autoRebalanceEnabled[asset]) {
                
                uint256 protocolsAffected = _executeDailyAssetRebalance(asset);
                totalProtocolsAffected += protocolsAffected;
                
                lastDailyRebalance[asset] = block.timestamp;
            }
        }
        
        globalRebalanceCounter++;
    }

    // ============ AUTO-REBALANCING FUNCTIONS ============

    /**
     * @dev Detect and reallocate idle capital automatically
     * @param asset Asset to rebalance
     */
    function detectAndReallocate(address asset) 
        external 
        onlyRole(KEEPER_ROLE) 
        nonReentrant 
    {
        require(assetStates[asset].isActive, "Asset not active");
        require(
            block.timestamp >= assetStates[asset].lastRebalanceTimestamp + REBALANCE_COOLDOWN,
            "Rebalance cooldown active"
        );
        
        uint256 idleCapital = _calculateIdleCapital(asset);
        require(idleCapital >= assetStates[asset].idleThreshold, "Idle capital below threshold");
        
        address bestProtocol = _findBestYieldProtocol(asset);
        require(bestProtocol != address(0), "No suitable protocol found");
        
        // Reallocate idle capital
        _reallocateToProtocol(asset, bestProtocol, idleCapital);
        
        // Update rebalance timestamp
        assetStates[asset].lastRebalanceTimestamp = block.timestamp;
        
        emit IdleDetected(asset, idleCapital, bestProtocol);
        emit AutoRebalanceExecuted(asset, idleCapital, registeredProtocols[bestProtocol].currentAPY);
    }

    /**
     * @dev Execute comprehensive rebalancing across all protocols
     * @param asset Asset to rebalance
     */
    function executeComprehensiveRebalance(address asset) 
        external 
        onlyRole(REBALANCER_ROLE) 
        nonReentrant 
    {
        require(assetStates[asset].isActive, "Asset not active");
        
        // Get current allocations and optimal distribution
        (address[] memory protocols, uint256[] memory currentAllocations) = _getCurrentAllocations(asset);
        (address[] memory optimalProtocols, uint256[] memory optimalAllocations) = _calculateOptimalAllocation(asset);
        
        uint256 totalReallocated = 0;
        
        // Execute rebalancing
        for (uint256 i = 0; i < protocols.length; i++) {
            for (uint256 j = 0; j < optimalProtocols.length; j++) {
                if (protocols[i] == optimalProtocols[j]) {
                    if (currentAllocations[i] > optimalAllocations[j]) {
                        // Reduce allocation
                        uint256 reduceAmount = currentAllocations[i] - optimalAllocations[j];
                        _withdrawFromProtocol(protocols[i], asset, reduceAmount);
                        totalReallocated += reduceAmount;
                    }
                    break;
                }
            }
        }
        
        // Reallocate to optimal protocols
        for (uint256 i = 0; i < optimalProtocols.length; i++) {
            _reallocateToProtocol(asset, optimalProtocols[i], optimalAllocations[i]);
        }
        
        assetStates[asset].lastRebalanceTimestamp = block.timestamp;
        emit AutoRebalanceExecuted(asset, totalReallocated, _calculateWeightedAPY(asset));
    }

    // ============ PROTOCOL MANAGEMENT ============

    /**
     * @dev Register a new protocol
     * @param protocol Protocol address
     * @param name Protocol name
     * @param initialAPY Initial APY
     * @param maxCapacity Maximum capacity
     * @param riskScore Risk score (1-100)
     */
    function registerProtocol(
        address protocol,
        string memory name,
        uint256 initialAPY,
        uint256 maxCapacity,
        uint256 riskScore
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(protocol != address(0), "Invalid protocol address");
        require(!registeredProtocols[protocol].isActive, "Protocol already registered");
        require(riskScore <= 100, "Invalid risk score");
        require(protocolList.length < MAX_PROTOCOLS, "Max protocols reached");
        
        registeredProtocols[protocol] = ProtocolInfo({
            protocolAddress: protocol,
            protocolName: name,
            currentAPY: initialAPY,
            totalAllocated: 0,
            maxCapacity: maxCapacity,
            riskScore: riskScore,
            isActive: true,
            isVerified: true,
            lastYieldUpdate: block.timestamp
        });
        
        protocolList.push(protocol);
        _grantRole(PROTOCOL_ROLE, protocol);
        
        emit ProtocolRegistered(protocol, name, initialAPY);
    }

    /**
     * @dev Update protocol APY
     * @param protocol Protocol address
     * @param newAPY New APY
     */
    function updateProtocolAPY(address protocol, uint256 newAPY) 
        external 
        onlyRole(KEEPER_ROLE) 
    {
        require(registeredProtocols[protocol].isActive, "Protocol not active");
        
        registeredProtocols[protocol].currentAPY = newAPY;
        registeredProtocols[protocol].lastYieldUpdate = block.timestamp;
    }

    // ============ INTERNAL FUNCTIONS ============

    function _calculateShares(address asset, uint256 amount) internal view returns (uint256) {
        uint256 totalSupply = assetStates[asset].totalDeposited;
        if (totalSupply == 0) {
            return amount;
        }
        return (amount * PRECISION) / totalSupply;
    }

    function _calculateSharesToBurn(address asset, uint256 amount, address user) internal view returns (uint256) {
        uint256 userShares = userPositions[user][asset].shares;
        uint256 userBalance = userBalances[user][asset];
        return (amount * userShares) / userBalance;
    }

    function _calculateIdleCapital(address asset) internal view returns (uint256) {
        uint256 total = assetStates[asset].totalDeposited;
        uint256 utilized = assetStates[asset].totalUtilized;
        return total > utilized ? total - utilized : 0;
    }

    function _findBestYieldProtocol(address asset) internal view returns (address) {
        uint256 maxYield = 0;
        address bestProtocol = address(0);
        
        for (uint256 i = 0; i < protocolList.length; i++) {
            address protocol = protocolList[i];
            ProtocolInfo memory info = registeredProtocols[protocol];
            
            if (info.isActive && info.isVerified) {
                // Consider APY, capacity, and risk
                uint256 adjustedYield = (info.currentAPY * (101 - info.riskScore)) / 100;
                
                if (adjustedYield > maxYield && 
                    protocolAllocations[protocol][asset] < info.maxCapacity) {
                    maxYield = adjustedYield;
                    bestProtocol = protocol;
                }
            }
        }
        
        return bestProtocol;
    }

    function _reallocateToProtocol(address asset, address protocol, uint256 amount) internal {
        require(registeredProtocols[protocol].isActive, "Protocol not active");
        
        protocolAllocations[protocol][asset] += amount;
        assetStates[asset].totalUtilized += amount;
        
        // Transfer tokens to protocol if needed
        IERC20(asset).safeTransfer(protocol, amount);
        
        emit Reallocated(address(0), protocol, asset, amount);
    }

    function _withdrawFromProtocol(address protocol, address asset, uint256 amount) internal {
        require(protocolAllocations[protocol][asset] >= amount, "Insufficient protocol allocation");
        
        protocolAllocations[protocol][asset] -= amount;
        assetStates[asset].totalUtilized -= amount;
        
        // Request withdrawal from protocol
        // This would call the protocol's withdrawal function
        // Implementation depends on specific protocol interfaces
    }

    function _withdrawFromProtocols(address asset, uint256 totalAmount) internal {
        uint256 remaining = totalAmount;
        
        for (uint256 i = 0; i < protocolList.length && remaining > 0; i++) {
            address protocol = protocolList[i];
            uint256 allocated = protocolAllocations[protocol][asset];
            
            if (allocated > 0) {
                uint256 withdrawAmount = Math.min(allocated, remaining);
                _withdrawFromProtocol(protocol, asset, withdrawAmount);
                remaining -= withdrawAmount;
            }
        }
    }

    function _distributeYield(address asset, uint256 yieldAmount) internal {
        // Distribute yield proportionally to all users
        assetStates[asset].totalYieldGenerated += yieldAmount;
        
        // Take protocol fee
        uint256 protocolFeeAmount = (yieldAmount * protocolFee) / 10000;
        uint256 treasuryFeeAmount = (yieldAmount * treasuryFee) / 10000;
        
        if (protocolFeeAmount > 0) {
            IERC20(asset).safeTransfer(treasury, protocolFeeAmount + treasuryFeeAmount);
        }
        
        // Remaining yield stays in the pool for users
        uint256 userYield = yieldAmount - protocolFeeAmount - treasuryFeeAmount;
        assetStates[asset].totalDeposited += userYield;
    }

    function _checkAndTriggerRebalance(address asset) internal {
        if (assetStates[asset].autoRebalanceEnabled) {
            uint256 idleCapital = _calculateIdleCapital(asset);
            if (idleCapital >= assetStates[asset].idleThreshold) {
                // Trigger rebalance in next block to avoid reentrancy
                // This would typically be handled by a keeper bot
            }
        }
    }

    function _getCurrentAllocations(address asset) internal view returns (address[] memory, uint256[] memory) {
        address[] memory protocols = new address[](protocolList.length);
        uint256[] memory allocations = new uint256[](protocolList.length);
        
        for (uint256 i = 0; i < protocolList.length; i++) {
            protocols[i] = protocolList[i];
            allocations[i] = protocolAllocations[protocolList[i]][asset];
        }
        
        return (protocols, allocations);
    }

    // ============ NEW INTERNAL FUNCTIONS FOR ENHANCED FEATURES ============

    /**
     * @dev Trigger automatic reallocation after asset operations
     */
    function _triggerAutomaticReallocation(address asset) internal {
        if (autoRebalanceEnabled[asset]) {
            uint256 idleCapital = _calculateIdleCapital(asset);
            if (idleCapital >= assetStates[asset].idleThreshold) {
                address optimalProtocol = _findOptimalProtocolForAllocation(asset, idleCapital);
                if (optimalProtocol != address(0)) {
                    _executeProtocolAllocation(optimalProtocol, asset, idleCapital);
                    emit ProtocolAllocated(optimalProtocol, asset, idleCapital, _calculateExpectedYield(optimalProtocol, asset, idleCapital));
                }
            }
        }
    }

    /**
     * @dev Find optimal protocol for asset allocation based on yield and capacity
     */
    function _findOptimalProtocolForAllocation(address asset, uint256 amount) internal view returns (address) {
        address bestProtocol = address(0);
        uint256 bestYield = 0;
        
        for (uint256 i = 0; i < protocolList.length; i++) {
            address protocol = protocolList[i];
            ProtocolInfo memory info = registeredProtocols[protocol];
            
            if (info.isActive && 
                protocolAllocations[protocol][asset] + amount <= info.maxCapacity &&
                info.currentAPY > bestYield) {
                
                bestYield = info.currentAPY;
                bestProtocol = protocol;
            }
        }
        
        return bestProtocol;
    }

    /**
     * @dev Find underperforming protocol for deallocation
     */
    function _findUnderperformingProtocol(address asset, uint256 targetAmount) internal view returns (address) {
        address worstProtocol = address(0);
        uint256 worstYield = type(uint256).max;
        
        for (uint256 i = 0; i < protocolList.length; i++) {
            address protocol = protocolList[i];
            ProtocolInfo memory info = registeredProtocols[protocol];
            
            if (info.isActive && 
                protocolAllocations[protocol][asset] >= targetAmount &&
                info.currentAPY < worstYield) {
                
                worstYield = info.currentAPY;
                worstProtocol = protocol;
            }
        }
        
        return worstProtocol;
    }

    /**
     * @dev Calculate expected yield from protocol allocation
     */
    function _calculateExpectedYield(address protocol, address asset, uint256 amount) internal view returns (uint256) {
        ProtocolInfo memory info = registeredProtocols[protocol];
        return (amount * info.currentAPY * 365 days) / (PRECISION * 365 days); // Annualized yield
    }

    /**
     * @dev Calculate actual yield received from protocol
     */
    function _calculateActualYield(address protocol, address asset, uint256 amount) internal view returns (uint256) {
        // This would typically query the protocol for actual yield
        // For now, we'll use the current APY as approximation
        return _calculateExpectedYield(protocol, asset, amount);
    }

    /**
     * @dev Execute protocol allocation
     */
    function _executeProtocolAllocation(address protocol, address asset, uint256 amount) internal {
        // Transfer tokens to protocol (mock implementation)
        IERC20(asset).safeTransfer(protocol, amount);
        
        // Update protocol allocation tracking
        protocolAllocations[protocol][asset] += amount;
        registeredProtocols[protocol].totalAllocated += amount;
    }

    /**
     * @dev Execute protocol deallocation
     */
    function _executeProtocolDeallocation(address protocol, address asset, uint256 amount) internal returns (uint256) {
        // Withdraw from protocol (mock implementation)
        uint256 balanceBefore = IERC20(asset).balanceOf(address(this));
        
        // In real implementation, this would call protocol's withdraw function
        // For now, we simulate the withdrawal
        
        uint256 actualAmount = amount; // Assume full amount is available
        
        // Update protocol allocation tracking
        protocolAllocations[protocol][asset] -= actualAmount;
        registeredProtocols[protocol].totalAllocated -= actualAmount;
        
        return actualAmount;
    }

    /**
     * @dev Execute daily rebalancing for a specific asset
     */
    function _executeDailyAssetRebalance(address asset) internal returns (uint256) {
        uint256 protocolsAffected = 0;
        uint256 totalMoved = 0;
        uint256 oldWeightedAPY = _calculateWeightedAPY(asset);
        
        // Find yield optimization opportunities
        for (uint256 i = 0; i < protocolList.length; i++) {
            for (uint256 j = 0; j < protocolList.length; j++) {
                if (i != j) {
                    address fromProtocol = protocolList[i];
                    address toProtocol = protocolList[j];
                    
                    uint256 yieldDiff = registeredProtocols[toProtocol].currentAPY - registeredProtocols[fromProtocol].currentAPY;
                    
                    if (yieldDiff >= MIN_YIELD_DIFFERENCE && 
                        protocolAllocations[fromProtocol][asset] > 0) {
                        
                        uint256 moveAmount = protocolAllocations[fromProtocol][asset] / 4; // Move 25%
                        
                        if (moveAmount > 0 && 
                            protocolAllocations[toProtocol][asset] + moveAmount <= registeredProtocols[toProtocol].maxCapacity) {
                            
                            _executeProtocolDeallocation(fromProtocol, asset, moveAmount);
                            _executeProtocolAllocation(toProtocol, asset, moveAmount);
                            
                            totalMoved += moveAmount;
                            protocolsAffected++;
                            
                            emit CrossProtocolAccessOptimized(fromProtocol, toProtocol, asset, moveAmount);
                        }
                    }
                }
            }
        }
        
        uint256 newWeightedAPY = _calculateWeightedAPY(asset);
        
        if (totalMoved > 0) {
            emit DailyRebalanceExecuted(asset, totalMoved, protocolsAffected, newWeightedAPY);
            
            if (newWeightedAPY > oldWeightedAPY) {
                emit YieldOptimizationTriggered(asset, oldWeightedAPY, newWeightedAPY, newWeightedAPY - oldWeightedAPY);
            }
        }
        
        return protocolsAffected;
    }

    // ============ ADMIN FUNCTIONS FOR NEW FEATURES ============

    /**
     * @dev Enable/disable auto-rebalancing for an asset
     */
    function setAutoRebalanceEnabled(address asset, bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        autoRebalanceEnabled[asset] = enabled;
    }

    /**
     * @dev Set minimum yield difference for rebalancing
     */
    function setMinYieldDifference(uint256 newMinDifference) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // This would require updating the constant, but for demo purposes we'll emit an event
        emit YieldOptimizationTriggered(address(0), MIN_YIELD_DIFFERENCE, newMinDifference, 0);
    }

    /**
     * @dev Get comprehensive asset analytics
     */
    function getAssetAnalytics(address asset) external view returns (
        uint256 totalDeposited,
        uint256 totalUtilized,
        uint256 idleCapital,
        uint256 weightedAPY,
        uint256 protocolCount,
        uint256 lastRebalanceTime
    ) {
        totalDeposited = assetStates[asset].totalDeposited;
        totalUtilized = assetStates[asset].totalUtilized;
        idleCapital = _calculateIdleCapital(asset);
        weightedAPY = _calculateWeightedAPY(asset);
        protocolCount = _getActiveProtocolCount(asset);
        lastRebalanceTime = lastDailyRebalance[asset];
    }

    /**
      * @dev Get active protocol count for an asset
      */
     function _getActiveProtocolCount(address asset) internal view returns (uint256) {
         uint256 count = 0;
         for (uint256 i = 0; i < protocolList.length; i++) {
             if (protocolAllocations[protocolList[i]][asset] > 0) {
                 count++;
             }
         }
         return count;
     }

     /**
      * @dev Optimize cross-protocol access without token transfers
      */
     function _optimizeCrossProtocolAccess(address protocol, address asset, uint256 amount) internal {
         // Check if there's a better protocol available for this allocation
         address betterProtocol = _findOptimalProtocolForAllocation(asset, amount);
         
         if (betterProtocol != address(0) && betterProtocol != protocol) {
             uint256 yieldDiff = registeredProtocols[betterProtocol].currentAPY - registeredProtocols[protocol].currentAPY;
             
             if (yieldDiff >= MIN_YIELD_DIFFERENCE) {
                 // Virtually reallocate to better protocol
                 protocolAllocations[protocol][asset] -= amount;
                 protocolAllocations[betterProtocol][asset] += amount;
                 
                 emit CrossProtocolAccessOptimized(protocol, betterProtocol, asset, amount);
             }
         }
     }

     /**
      * @dev Distribute yield through accounting only (no token transfers)
      */
     function _distributeYieldAccounting(address asset, uint256 yieldAmount) internal {
         // Update total yield generated (accounting only)
         assetStates[asset].totalYieldGenerated += yieldAmount;
         
         // Calculate fees (accounting only)
         uint256 protocolFeeAmount = (yieldAmount * protocolFee) / 10000;
         uint256 treasuryFeeAmount = (yieldAmount * treasuryFee) / 10000;
         
         // Update virtual balances
         uint256 userYield = yieldAmount - protocolFeeAmount - treasuryFeeAmount;
         assetStates[asset].totalDeposited += userYield;
         
         // Track fees for later settlement
         assetStates[asset].pendingFees += protocolFeeAmount + treasuryFeeAmount;
     }

     /**
      * @dev Update protocol performance metrics
      */
     function _updateProtocolPerformance(address protocol, address asset, uint256 amount, uint256 yieldGenerated) internal {
         ProtocolInfo storage info = registeredProtocols[protocol];
         
         // Update performance tracking
         info.totalYieldGenerated += yieldGenerated;
         
         // Calculate actual APY based on performance
         if (amount > 0) {
             uint256 actualAPY = (yieldGenerated * PRECISION * 365 days) / (amount * 1 days);
             
             // Update rolling average APY (simple moving average)
             info.currentAPY = (info.currentAPY * 9 + actualAPY) / 10;
         }
         
         // Update last interaction time
         info.lastUpdateTimestamp = block.timestamp;
     }

     /**
      * @dev Settle pending fees (can be called periodically)
      */
     function settlePendingFees(address asset) external onlyRole(KEEPER_ROLE) {
         uint256 pendingFees = assetStates[asset].pendingFees;
         
         if (pendingFees > 0 && IERC20(asset).balanceOf(address(this)) >= pendingFees) {
             IERC20(asset).safeTransfer(treasury, pendingFees);
             assetStates[asset].pendingFees = 0;
         }
     }

     /**
      * @dev Get cross-protocol optimization opportunities
      */
     function getCrossProtocolOpportunities(address asset) external view returns (
         address[] memory fromProtocols,
         address[] memory toProtocols,
         uint256[] memory amounts,
         uint256[] memory yieldImprovements
     ) {
         uint256 opportunityCount = 0;
         
         // First pass: count opportunities
         for (uint256 i = 0; i < protocolList.length; i++) {
             for (uint256 j = 0; j < protocolList.length; j++) {
                 if (i != j) {
                     address fromProtocol = protocolList[i];
                     address toProtocol = protocolList[j];
                     
                     uint256 yieldDiff = registeredProtocols[toProtocol].currentAPY - registeredProtocols[fromProtocol].currentAPY;
                     
                     if (yieldDiff >= MIN_YIELD_DIFFERENCE && protocolAllocations[fromProtocol][asset] > 0) {
                         opportunityCount++;
                     }
                 }
             }
         }
         
         // Second pass: populate arrays
         fromProtocols = new address[](opportunityCount);
         toProtocols = new address[](opportunityCount);
         amounts = new uint256[](opportunityCount);
         yieldImprovements = new uint256[](opportunityCount);
         
         uint256 index = 0;
         for (uint256 i = 0; i < protocolList.length; i++) {
             for (uint256 j = 0; j < protocolList.length; j++) {
                 if (i != j && index < opportunityCount) {
                     address fromProtocol = protocolList[i];
                     address toProtocol = protocolList[j];
                     
                     uint256 yieldDiff = registeredProtocols[toProtocol].currentAPY - registeredProtocols[fromProtocol].currentAPY;
                     
                     if (yieldDiff >= MIN_YIELD_DIFFERENCE && protocolAllocations[fromProtocol][asset] > 0) {
                         fromProtocols[index] = fromProtocol;
                         toProtocols[index] = toProtocol;
                         amounts[index] = protocolAllocations[fromProtocol][asset] / 4; // Suggest moving 25%
                         yieldImprovements[index] = yieldDiff;
                         index++;
                     }
                 }
             }
         }
     }
 }

    function _calculateOptimalAllocation(address asset) internal view returns (address[] memory, uint256[] memory) {
        // Simplified optimal allocation based on APY and risk
        // In production, this would use more sophisticated algorithms
        
        uint256 totalIdle = _calculateIdleCapital(asset);
        address bestProtocol = _findBestYieldProtocol(asset);
        
        address[] memory protocols = new address[](1);
        uint256[] memory allocations = new uint256[](1);
        
        protocols[0] = bestProtocol;
        allocations[0] = totalIdle;
        
        return (protocols, allocations);
    }

    function _calculateWeightedAPY(address asset) internal view returns (uint256) {
        uint256 totalAllocated = assetStates[asset].totalUtilized;
        if (totalAllocated == 0) return 0;
        
        uint256 weightedAPY = 0;
        
        for (uint256 i = 0; i < protocolList.length; i++) {
            address protocol = protocolList[i];
            uint256 allocation = protocolAllocations[protocol][asset];
            
            if (allocation > 0) {
                uint256 weight = (allocation * PRECISION) / totalAllocated;
                weightedAPY += (registeredProtocols[protocol].currentAPY * weight) / PRECISION;
            }
        }
        
        return weightedAPY;
    }

    // ============ VIEW FUNCTIONS ============

    function getAssetState(address asset) external view returns (AssetState memory) {
        return assetStates[asset];
    }

    function getUserPosition(address user, address asset) external view returns (UserPosition memory) {
        return userPositions[user][asset];
    }

    function getProtocolInfo(address protocol) external view returns (ProtocolInfo memory) {
        return registeredProtocols[protocol];
    }

    function getTotalValueLocked() external view returns (uint256) {
        uint256 totalTVL = 0;
        for (uint256 i = 0; i < assetList.length; i++) {
            totalTVL += assetStates[assetList[i]].totalDeposited;
        }
        return totalTVL;
    }

    function getIdleCapital(address asset) external view returns (uint256) {
        return _calculateIdleCapital(asset);
    }

    function getProtocolAllocations(address asset) external view returns (address[] memory, uint256[] memory) {
        return _getCurrentAllocations(asset);
    }

    // ============ ADMIN FUNCTIONS ============

    function addSupportedAsset(address asset) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedAssets[asset] = true;
    }

    function removeSupportedAsset(address asset) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedAssets[asset] = false;
    }

    function setProtocolFee(uint256 _protocolFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_protocolFee <= 1000, "Fee too high"); // Max 10%
        protocolFee = _protocolFee;
    }

    function setTreasuryFee(uint256 _treasuryFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_treasuryFee <= 500, "Fee too high"); // Max 5%
        treasuryFee = _treasuryFee;
    }

    function setTreasury(address _treasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }

    function pause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }

    function emergencyWithdraw(address asset, address protocol) 
        external 
        onlyRole(EMERGENCY_ROLE) 
    {
        uint256 amount = protocolAllocations[protocol][asset];
        if (amount > 0) {
            _withdrawFromProtocol(protocol, asset, amount);
            emit EmergencyWithdrawal(asset, protocol, amount);
        }
    }
}