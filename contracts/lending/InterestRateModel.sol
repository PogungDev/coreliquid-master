// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title InterestRateModel
 * @dev Calculates interest rates for lending and borrowing
 */
contract InterestRateModel is AccessControl {
    using Math for uint256;
    
    bytes32 public constant RATE_ADMIN_ROLE = keccak256("RATE_ADMIN_ROLE");
    
    struct RateParams {
        uint256 baseRate; // Base interest rate (annual, in basis points)
        uint256 multiplier; // Rate multiplier (slope of interest rate curve)
        uint256 jumpMultiplier; // Jump rate multiplier after optimal utilization
        uint256 optimalUtilization; // Optimal utilization rate (basis points)
        uint256 reserveFactor; // Reserve factor (basis points)
        uint256 maxRate; // Maximum interest rate cap
        bool isActive; // Whether this rate model is active
    }
    
    struct MarketRates {
        uint256 borrowRate;
        uint256 supplyRate;
        uint256 utilizationRate;
        uint256 lastUpdateTime;
        uint256 totalBorrows;
        uint256 totalSupply;
        uint256 totalReserves;
    }
    
    struct RateHistory {
        uint256 timestamp;
        uint256 borrowRate;
        uint256 supplyRate;
        uint256 utilizationRate;
    }
    
    mapping(address => RateParams) public rateParams;
    mapping(address => MarketRates) public marketRates;
    mapping(address => RateHistory[]) public rateHistory;
    mapping(address => uint256) public lastRateUpdate;
    
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant MAX_RATE = 10000; // 100% APR
    uint256 public constant RATE_HISTORY_LIMIT = 1000;
    
    event RateParamsUpdated(
        address indexed token,
        uint256 baseRate,
        uint256 multiplier,
        uint256 jumpMultiplier,
        uint256 optimalUtilization
    );
    
    event RatesUpdated(
        address indexed token,
        uint256 borrowRate,
        uint256 supplyRate,
        uint256 utilizationRate
    );
    
    event MarketDataUpdated(
        address indexed token,
        uint256 totalBorrows,
        uint256 totalSupply,
        uint256 totalReserves
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RATE_ADMIN_ROLE, msg.sender);
    }
    
    function getBorrowRate(
        address token,
        uint256 utilizationRate
    ) external view returns (uint256 borrowRate) {
        RateParams memory params = rateParams[token];
        require(params.isActive, "Rate model not active");
        
        if (utilizationRate <= params.optimalUtilization) {
            // Normal rate: baseRate + (utilizationRate * multiplier / optimalUtilization)
            borrowRate = params.baseRate + 
                (utilizationRate * params.multiplier) / params.optimalUtilization;
        } else {
            // Jump rate: baseRate + multiplier + ((utilizationRate - optimalUtilization) * jumpMultiplier / (10000 - optimalUtilization))
            uint256 normalRate = params.baseRate + params.multiplier;
            uint256 excessUtilization = utilizationRate - params.optimalUtilization;
            uint256 jumpRate = (excessUtilization * params.jumpMultiplier) / 
                (BASIS_POINTS - params.optimalUtilization);
            
            borrowRate = normalRate + jumpRate;
        }
        
        // Apply rate cap
        if (borrowRate > params.maxRate) {
            borrowRate = params.maxRate;
        }
    }
    
    function getSupplyRate(
        address token,
        uint256 utilizationRate,
        uint256 reserveFactor
    ) external view returns (uint256 supplyRate) {
        uint256 borrowRate = this.getBorrowRate(token, utilizationRate);
        
        // Supply rate = borrowRate * utilizationRate * (1 - reserveFactor)
        uint256 rateToPool = (BASIS_POINTS - reserveFactor);
        supplyRate = (borrowRate * utilizationRate * rateToPool) / (BASIS_POINTS * BASIS_POINTS);
    }
    
    function updateMarketRates(
        address token,
        uint256 totalBorrows,
        uint256 totalSupply,
        uint256 totalReserves
    ) external onlyRole(RATE_ADMIN_ROLE) {
        require(rateParams[token].isActive, "Rate model not active");
        
        // Calculate utilization rate
        uint256 utilizationRate = 0;
        if (totalSupply > 0) {
            utilizationRate = (totalBorrows * BASIS_POINTS) / totalSupply;
        }
        
        // Get rates
        uint256 borrowRate = this.getBorrowRate(token, utilizationRate);
        uint256 supplyRate = this.getSupplyRate(token, utilizationRate, rateParams[token].reserveFactor);
        
        // Update market rates
        MarketRates storage market = marketRates[token];
        market.borrowRate = borrowRate;
        market.supplyRate = supplyRate;
        market.utilizationRate = utilizationRate;
        market.lastUpdateTime = block.timestamp;
        market.totalBorrows = totalBorrows;
        market.totalSupply = totalSupply;
        market.totalReserves = totalReserves;
        
        // Store rate history
        _storeRateHistory(token, borrowRate, supplyRate, utilizationRate);
        
        lastRateUpdate[token] = block.timestamp;
        
        emit RatesUpdated(token, borrowRate, supplyRate, utilizationRate);
        emit MarketDataUpdated(token, totalBorrows, totalSupply, totalReserves);
    }
    
    function calculateCompoundInterest(
        uint256 principal,
        uint256 rate,
        uint256 timeElapsed
    ) external pure returns (uint256 interest) {
        if (principal == 0 || rate == 0 || timeElapsed == 0) {
            return 0;
        }
        
        // Simple interest calculation: principal * rate * time / (BASIS_POINTS * SECONDS_PER_YEAR)
        interest = (principal * rate * timeElapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);
    }
    
    function calculateAPY(
        uint256 rate,
        uint256 compoundingFrequency
    ) external pure returns (uint256 apy) {
        if (rate == 0 || compoundingFrequency == 0) {
            return rate;
        }
        
        // APY = (1 + rate/frequency)^frequency - 1
        // Simplified calculation for demonstration
        uint256 ratePerPeriod = rate / compoundingFrequency;
        apy = rate + (rate * ratePerPeriod) / BASIS_POINTS; // Approximation
    }
    
    function getOptimalBorrowRate(address token) external view returns (uint256) {
        RateParams memory params = rateParams[token];
        require(params.isActive, "Rate model not active");
        
        // Rate at optimal utilization
        return params.baseRate + params.multiplier;
    }
    
    function getMaxBorrowRate(address token) external view returns (uint256) {
        RateParams memory params = rateParams[token];
        require(params.isActive, "Rate model not active");
        
        return params.maxRate;
    }
    
    function getRateAtUtilization(
        address token,
        uint256 utilizationRate
    ) external view returns (uint256 borrowRate, uint256 supplyRate) {
        borrowRate = this.getBorrowRate(token, utilizationRate);
        supplyRate = this.getSupplyRate(token, utilizationRate, rateParams[token].reserveFactor);
    }
    
    function getCurrentRates(address token) external view returns (
        uint256 borrowRate,
        uint256 supplyRate,
        uint256 utilizationRate,
        uint256 lastUpdate
    ) {
        MarketRates memory market = marketRates[token];
        return (market.borrowRate, market.supplyRate, market.utilizationRate, market.lastUpdateTime);
    }
    
    function getRateHistory(
        address token,
        uint256 limit
    ) external view returns (RateHistory[] memory history) {
        RateHistory[] storage fullHistory = rateHistory[token];
        uint256 length = fullHistory.length;
        
        if (limit == 0 || limit > length) {
            limit = length;
        }
        
        history = new RateHistory[](limit);
        
        // Return most recent entries
        for (uint256 i = 0; i < limit; i++) {
            history[i] = fullHistory[length - limit + i];
        }
    }
    
    function getAverageRates(
        address token,
        uint256 timeWindow
    ) external view returns (
        uint256 avgBorrowRate,
        uint256 avgSupplyRate,
        uint256 avgUtilizationRate
    ) {
        RateHistory[] storage history = rateHistory[token];
        uint256 cutoffTime = block.timestamp - timeWindow;
        
        uint256 count = 0;
        uint256 totalBorrowRate = 0;
        uint256 totalSupplyRate = 0;
        uint256 totalUtilizationRate = 0;
        
        // Calculate averages for the time window
        for (uint256 i = history.length; i > 0; i--) {
            RateHistory memory entry = history[i - 1];
            if (entry.timestamp < cutoffTime) {
                break;
            }
            
            totalBorrowRate += entry.borrowRate;
            totalSupplyRate += entry.supplyRate;
            totalUtilizationRate += entry.utilizationRate;
            count++;
        }
        
        if (count > 0) {
            avgBorrowRate = totalBorrowRate / count;
            avgSupplyRate = totalSupplyRate / count;
            avgUtilizationRate = totalUtilizationRate / count;
        }
    }
    
    function setRateParams(
        address token,
        RateParams memory params
    ) external onlyRole(RATE_ADMIN_ROLE) {
        require(token != address(0), "Invalid token");
        require(params.baseRate <= MAX_RATE, "Base rate too high");
        require(params.multiplier <= MAX_RATE, "Multiplier too high");
        require(params.jumpMultiplier <= MAX_RATE, "Jump multiplier too high");
        require(params.optimalUtilization <= BASIS_POINTS, "Invalid optimal utilization");
        require(params.reserveFactor <= BASIS_POINTS, "Invalid reserve factor");
        require(params.maxRate <= MAX_RATE, "Max rate too high");
        require(params.maxRate >= params.baseRate + params.multiplier, "Max rate too low");
        
        rateParams[token] = params;
        
        emit RateParamsUpdated(
            token,
            params.baseRate,
            params.multiplier,
            params.jumpMultiplier,
            params.optimalUtilization
        );
    }
    
    function setDefaultRateParams(address token) external onlyRole(RATE_ADMIN_ROLE) {
        RateParams memory defaultParams = RateParams({
            baseRate: 200, // 2% base rate
            multiplier: 1000, // 10% multiplier
            jumpMultiplier: 5000, // 50% jump multiplier
            optimalUtilization: 8000, // 80% optimal utilization
            reserveFactor: 1000, // 10% reserve factor
            maxRate: 10000, // 100% max rate
            isActive: true
        });
        
        rateParams[token] = defaultParams;
        
        emit RateParamsUpdated(
            token,
            defaultParams.baseRate,
            defaultParams.multiplier,
            defaultParams.jumpMultiplier,
            defaultParams.optimalUtilization
        );
    }
    
    function batchSetRateParams(
        address[] calldata tokens,
        RateParams[] calldata params
    ) external onlyRole(RATE_ADMIN_ROLE) {
        require(tokens.length == params.length, "Array length mismatch");
        
        for (uint256 i = 0; i < tokens.length; i++) {
            this.setRateParams(tokens[i], params[i]);
        }
    }
    
    function toggleRateModel(address token, bool isActive) external onlyRole(RATE_ADMIN_ROLE) {
        rateParams[token].isActive = isActive;
    }
    
    function _storeRateHistory(
        address token,
        uint256 borrowRate,
        uint256 supplyRate,
        uint256 utilizationRate
    ) internal {
        RateHistory[] storage history = rateHistory[token];
        
        // Add new entry
        history.push(RateHistory({
            timestamp: block.timestamp,
            borrowRate: borrowRate,
            supplyRate: supplyRate,
            utilizationRate: utilizationRate
        }));
        
        // Remove old entries if limit exceeded
        if (history.length > RATE_HISTORY_LIMIT) {
            // Shift array left (remove oldest entry)
            for (uint256 i = 0; i < history.length - 1; i++) {
                history[i] = history[i + 1];
            }
            history.pop();
        }
    }
    
    function simulateRateChange(
        address token,
        uint256 newTotalBorrows,
        uint256 newTotalSupply
    ) external view returns (
        uint256 newBorrowRate,
        uint256 newSupplyRate,
        uint256 newUtilizationRate
    ) {
        require(rateParams[token].isActive, "Rate model not active");
        
        // Calculate new utilization rate
        newUtilizationRate = 0;
        if (newTotalSupply > 0) {
            newUtilizationRate = (newTotalBorrows * BASIS_POINTS) / newTotalSupply;
        }
        
        // Calculate new rates
        newBorrowRate = this.getBorrowRate(token, newUtilizationRate);
        newSupplyRate = this.getSupplyRate(token, newUtilizationRate, rateParams[token].reserveFactor);
    }
    
    function getUtilizationBreakpoints(address token) external view returns (
        uint256 optimalUtilization,
        uint256 rateAtOptimal,
        uint256 maxUtilization,
        uint256 maxRate
    ) {
        RateParams memory params = rateParams[token];
        require(params.isActive, "Rate model not active");
        
        optimalUtilization = params.optimalUtilization;
        rateAtOptimal = params.baseRate + params.multiplier;
        maxUtilization = BASIS_POINTS; // 100%
        maxRate = params.maxRate;
    }
    
    function isRateModelActive(address token) external view returns (bool) {
        return rateParams[token].isActive;
    }
    
    function getRateParams(address token) external view returns (RateParams memory) {
        return rateParams[token];
    }
    
    function getMarketRates(address token) external view returns (MarketRates memory) {
        return marketRates[token];
    }
    
    function emergencySetRate(
        address token,
        uint256 borrowRate,
        uint256 supplyRate
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(borrowRate <= MAX_RATE, "Borrow rate too high");
        require(supplyRate <= borrowRate, "Supply rate too high");
        
        MarketRates storage market = marketRates[token];
        market.borrowRate = borrowRate;
        market.supplyRate = supplyRate;
        market.lastUpdateTime = block.timestamp;
        
        emit RatesUpdated(token, borrowRate, supplyRate, market.utilizationRate);
    }
}