// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../common/OracleRouter.sol";
// import "./CollateralAdapter.sol"; // CollateralAdapter functionality integrated into CollateralManager

contract LendingMarket is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    struct MarketInfo {
        uint256 totalBorrows;
        uint256 totalReserves;
        uint256 borrowIndex;
        uint256 lastUpdateTime;
        uint256 baseRate;
        uint256 multiplier;
        uint256 reserveFactor;
    }
    
    mapping(address => MarketInfo) public markets;
    mapping(address => mapping(address => uint256)) public borrowBalances;
    mapping(address => bool) public supportedTokens;
    
    OracleRouter public immutable oracle;
    // CollateralAdapter public immutable collateralAdapter; // Functionality integrated into CollateralManager
    
    uint256 public constant BORROW_RATE_PRECISION = 1e18;
    uint256 public constant SECONDS_PER_YEAR = 31536000;
    
    event Borrow(address indexed user, address indexed token, uint256 amount);
    event Repay(address indexed user, address indexed token, uint256 amount);
    event MarketAdded(address indexed token);
    
    constructor(address _oracle) { // CollateralAdapter functionality integrated
        oracle = OracleRouter(_oracle);
        // collateralAdapter = CollateralAdapter(_collateralAdapter); // Functionality integrated
    }
    
    function addMarket(
        address token,
        uint256 baseRate,
        uint256 multiplier,
        uint256 reserveFactor
    ) external {
        require(!supportedTokens[token], "Market already exists");
        
        markets[token] = MarketInfo({
            totalBorrows: 0,
            totalReserves: 0,
            borrowIndex: BORROW_RATE_PRECISION,
            lastUpdateTime: block.timestamp,
            baseRate: baseRate,
            multiplier: multiplier,
            reserveFactor: reserveFactor
        });
        
        supportedTokens[token] = true;
        emit MarketAdded(token);
    }
    
    function borrow(address token, uint256 amount) external nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        // Check borrowing capacity
        uint256 borrowableAmount = getBorrowableAmount(msg.sender, token);
        require(amount <= borrowableAmount, "Insufficient collateral");
        
        // Update market state
        _updateMarket(token);
        
        // Update user borrow balance
        borrowBalances[msg.sender][token] += amount;
        markets[token].totalBorrows += amount;
        
        // Transfer tokens to user
        IERC20(token).safeTransfer(msg.sender, amount);
        
        emit Borrow(msg.sender, token, amount);
    }
    
    function repay(address token, uint256 amount) external nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 borrowBalance = borrowBalances[msg.sender][token];
        require(borrowBalance > 0, "No borrow balance");
        
        // Calculate actual repay amount
        uint256 repayAmount = amount > borrowBalance ? borrowBalance : amount;
        
        // Update market state
        _updateMarket(token);
        
        // Update user borrow balance
        borrowBalances[msg.sender][token] -= repayAmount;
        markets[token].totalBorrows -= repayAmount;
        
        // Transfer tokens from user
        IERC20(token).safeTransferFrom(msg.sender, address(this), repayAmount);
        
        emit Repay(msg.sender, token, repayAmount);
    }
    
    function getBorrowableAmount(address user, address collateralToken) 
        public 
        pure 
        returns (uint256) 
    {
        // return collateralAdapter.getBorrowableAmount(user, collateralToken); // Use CollateralManager instead
        return 0; // Placeholder - implement with CollateralManager
    }
    
    function getBorrowRate(address token) public view returns (uint256) {
        MarketInfo memory market = markets[token];
        uint256 utilizationRate = _getUtilizationRate(token);
        
        return market.baseRate + (utilizationRate * market.multiplier) / BORROW_RATE_PRECISION;
    }
    
    function _updateMarket(address token) internal {
        MarketInfo storage market = markets[token];
        uint256 timeDelta = block.timestamp - market.lastUpdateTime;
        
        if (timeDelta > 0) {
            uint256 borrowRate = getBorrowRate(token);
            uint256 interestAccumulated = (market.totalBorrows * borrowRate * timeDelta) / 
                                        (BORROW_RATE_PRECISION * SECONDS_PER_YEAR);
            
            market.totalBorrows += interestAccumulated;
            market.totalReserves += (interestAccumulated * market.reserveFactor) / BORROW_RATE_PRECISION;
            market.lastUpdateTime = block.timestamp;
        }
    }
    
    function _getUtilizationRate(address token) internal view returns (uint256) {
        MarketInfo memory market = markets[token];
        uint256 totalSupply = IERC20(token).balanceOf(address(this)) + market.totalBorrows;
        
        if (totalSupply == 0) return 0;
        return (market.totalBorrows * BORROW_RATE_PRECISION) / totalSupply;
    }
}
