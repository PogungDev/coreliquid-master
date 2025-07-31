// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title LendingMarket
 * @dev Core lending and borrowing functionality
 */
contract LendingMarket is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using Math for uint256;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant LIQUIDATOR_ROLE = keccak256("LIQUIDATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    uint256 public constant PRECISION = 1e18;
    uint256 public constant MAX_UTILIZATION_RATE = 95e16; // 95%
    uint256 public constant LIQUIDATION_THRESHOLD = 80e16; // 80%
    uint256 public constant LIQUIDATION_BONUS = 5e16; // 5%
    
    struct Market {
        IERC20 asset;
        uint256 totalSupply;
        uint256 totalBorrow;
        uint256 supplyRate;
        uint256 borrowRate;
        uint256 utilizationRate;
        uint256 reserveFactor;
        uint256 collateralFactor;
        bool isActive;
        uint256 lastUpdateTimestamp;
    }
    
    struct UserAccount {
        uint256 supplied;
        uint256 borrowed;
        uint256 collateralValue;
        uint256 borrowPower;
        uint256 lastInterestIndex;
    }
    
    mapping(address => Market) public markets;
    mapping(address => mapping(address => UserAccount)) public userAccounts;
    mapping(address => bool) public supportedAssets;
    address[] public assetList;
    
    // Interest rate model parameters
    uint256 public baseRate = 2e16; // 2%
    uint256 public multiplier = 18e16; // 18%
    uint256 public jumpMultiplier = 109e16; // 109%
    uint256 public kink = 80e16; // 80%
    
    event MarketAdded(address indexed asset, uint256 collateralFactor);
    event Supply(address indexed user, address indexed asset, uint256 amount);
    event Withdraw(address indexed user, address indexed asset, uint256 amount);
    event Borrow(address indexed user, address indexed asset, uint256 amount);
    event Repay(address indexed user, address indexed asset, uint256 amount);
    event Liquidation(
        address indexed liquidator,
        address indexed borrower,
        address indexed asset,
        uint256 amount
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }
    
    /**
     * @dev Add a new market
     */
    function addMarket(
        address asset,
        uint256 collateralFactor,
        uint256 reserveFactor
    ) external onlyRole(ADMIN_ROLE) {
        require(!supportedAssets[asset], "LendingMarket: market already exists");
        require(collateralFactor <= PRECISION, "LendingMarket: invalid collateral factor");
        
        markets[asset] = Market({
            asset: IERC20(asset),
            totalSupply: 0,
            totalBorrow: 0,
            supplyRate: 0,
            borrowRate: 0,
            utilizationRate: 0,
            reserveFactor: reserveFactor,
            collateralFactor: collateralFactor,
            isActive: true,
            lastUpdateTimestamp: block.timestamp
        });
        
        supportedAssets[asset] = true;
        assetList.push(asset);
        
        emit MarketAdded(asset, collateralFactor);
    }
    
    /**
     * @dev Supply assets to the market
     */
    function supply(
        address asset,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(supportedAssets[asset], "LendingMarket: unsupported asset");
        require(amount > 0, "LendingMarket: invalid amount");
        
        Market storage market = markets[asset];
        require(market.isActive, "LendingMarket: market not active");
        
        _updateMarket(asset);
        
        // Transfer tokens from user
        market.asset.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update user account
        UserAccount storage account = userAccounts[asset][msg.sender];
        account.supplied += amount;
        
        // Update market totals
        market.totalSupply += amount;
        
        _updateInterestRates(asset);
        
        emit Supply(msg.sender, asset, amount);
    }
    
    /**
     * @dev Withdraw supplied assets
     */
    function withdraw(
        address asset,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(supportedAssets[asset], "LendingMarket: unsupported asset");
        
        Market storage market = markets[asset];
        UserAccount storage account = userAccounts[asset][msg.sender];
        
        require(account.supplied >= amount, "LendingMarket: insufficient balance");
        
        _updateMarket(asset);
        
        // Check if withdrawal would leave user undercollateralized
        uint256 newCollateralValue = _calculateCollateralValue(msg.sender) - 
            (amount * market.collateralFactor / PRECISION);
        uint256 totalBorrowed = _calculateTotalBorrowed(msg.sender);
        
        require(
            newCollateralValue >= totalBorrowed,
            "LendingMarket: insufficient collateral"
        );
        
        // Update user account
        account.supplied -= amount;
        
        // Update market totals
        market.totalSupply -= amount;
        
        // Transfer tokens to user
        market.asset.safeTransfer(msg.sender, amount);
        
        _updateInterestRates(asset);
        
        emit Withdraw(msg.sender, asset, amount);
    }
    
    /**
     * @dev Borrow assets from the market
     */
    function borrow(
        address asset,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(supportedAssets[asset], "LendingMarket: unsupported asset");
        require(amount > 0, "LendingMarket: invalid amount");
        
        Market storage market = markets[asset];
        require(market.isActive, "LendingMarket: market not active");
        
        _updateMarket(asset);
        
        // Check borrowing capacity
        uint256 collateralValue = _calculateCollateralValue(msg.sender);
        uint256 currentBorrowed = _calculateTotalBorrowed(msg.sender);
        uint256 newBorrowed = currentBorrowed + amount;
        
        require(
            collateralValue >= newBorrowed,
            "LendingMarket: insufficient collateral"
        );
        
        // Check market liquidity
        require(
            market.totalSupply >= market.totalBorrow + amount,
            "LendingMarket: insufficient liquidity"
        );
        
        // Update user account
        UserAccount storage account = userAccounts[asset][msg.sender];
        account.borrowed += amount;
        
        // Update market totals
        market.totalBorrow += amount;
        
        // Transfer tokens to user
        market.asset.safeTransfer(msg.sender, amount);
        
        _updateInterestRates(asset);
        
        emit Borrow(msg.sender, asset, amount);
    }
    
    /**
     * @dev Repay borrowed assets
     */
    function repay(
        address asset,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(supportedAssets[asset], "LendingMarket: unsupported asset");
        
        Market storage market = markets[asset];
        UserAccount storage account = userAccounts[asset][msg.sender];
        
        uint256 repayAmount = Math.min(amount, account.borrowed);
        require(repayAmount > 0, "LendingMarket: nothing to repay");
        
        _updateMarket(asset);
        
        // Transfer tokens from user
        market.asset.safeTransferFrom(msg.sender, address(this), repayAmount);
        
        // Update user account
        account.borrowed -= repayAmount;
        
        // Update market totals
        market.totalBorrow -= repayAmount;
        
        _updateInterestRates(asset);
        
        emit Repay(msg.sender, asset, repayAmount);
    }
    
    /**
     * @dev Liquidate an undercollateralized position
     */
    function liquidate(
        address borrower,
        address asset,
        uint256 amount
    ) external onlyRole(LIQUIDATOR_ROLE) nonReentrant {
        require(supportedAssets[asset], "LendingMarket: unsupported asset");
        
        _updateMarket(asset);
        
        // Check if borrower is liquidatable
        uint256 collateralValue = _calculateCollateralValue(borrower);
        uint256 totalBorrowed = _calculateTotalBorrowed(borrower);
        
        require(
            collateralValue < (totalBorrowed * LIQUIDATION_THRESHOLD / PRECISION),
            "LendingMarket: position not liquidatable"
        );
        
        Market storage market = markets[asset];
        UserAccount storage account = userAccounts[asset][borrower];
        
        uint256 liquidateAmount = Math.min(amount, account.borrowed);
        uint256 collateralSeized = liquidateAmount * (PRECISION + LIQUIDATION_BONUS) / PRECISION;
        
        // Transfer repayment from liquidator
        market.asset.safeTransferFrom(msg.sender, address(this), liquidateAmount);
        
        // Update borrower account
        account.borrowed -= liquidateAmount;
        account.supplied -= Math.min(collateralSeized, account.supplied);
        
        // Update market totals
        market.totalBorrow -= liquidateAmount;
        market.totalSupply -= Math.min(collateralSeized, market.totalSupply);
        
        // Transfer collateral to liquidator
        market.asset.safeTransfer(msg.sender, collateralSeized);
        
        emit Liquidation(msg.sender, borrower, asset, liquidateAmount);
    }
    
    /**
     * @dev Update market interest rates and indices
     */
    function _updateMarket(address asset) internal {
        Market storage market = markets[asset];
        
        if (block.timestamp == market.lastUpdateTimestamp) {
            return;
        }
        
        uint256 timeElapsed = block.timestamp - market.lastUpdateTimestamp;
        
        if (market.totalBorrow > 0) {
            uint256 interestAccrued = market.totalBorrow * market.borrowRate * timeElapsed / (365 * 86400 * PRECISION);
            market.totalBorrow += interestAccrued;
            market.totalSupply += interestAccrued * (PRECISION - market.reserveFactor) / PRECISION;
        }
        
        market.lastUpdateTimestamp = block.timestamp;
    }
    
    /**
     * @dev Update interest rates based on utilization
     */
    function _updateInterestRates(address asset) internal {
        Market storage market = markets[asset];
        
        if (market.totalSupply == 0) {
            market.utilizationRate = 0;
            market.borrowRate = baseRate;
            market.supplyRate = 0;
            return;
        }
        
        market.utilizationRate = market.totalBorrow * PRECISION / market.totalSupply;
        
        if (market.utilizationRate <= kink) {
            market.borrowRate = baseRate + (market.utilizationRate * multiplier / PRECISION);
        } else {
            market.borrowRate = baseRate + (kink * multiplier / PRECISION) + 
                ((market.utilizationRate - kink) * jumpMultiplier / PRECISION);
        }
        
        market.supplyRate = market.borrowRate * market.utilizationRate * 
            (PRECISION - market.reserveFactor) / (PRECISION * PRECISION);
    }
    
    /**
     * @dev Calculate total collateral value for a user
     */
    function _calculateCollateralValue(address user) internal view returns (uint256) {
        uint256 totalValue = 0;
        
        for (uint256 i = 0; i < assetList.length; i++) {
            address asset = assetList[i];
            Market storage market = markets[asset];
            UserAccount storage account = userAccounts[asset][user];
            
            if (account.supplied > 0) {
                totalValue += account.supplied * market.collateralFactor / PRECISION;
            }
        }
        
        return totalValue;
    }
    
    /**
     * @dev Calculate total borrowed value for a user
     */
    function _calculateTotalBorrowed(address user) internal view returns (uint256) {
        uint256 totalBorrowed = 0;
        
        for (uint256 i = 0; i < assetList.length; i++) {
            address asset = assetList[i];
            UserAccount storage account = userAccounts[asset][user];
            totalBorrowed += account.borrowed;
        }
        
        return totalBorrowed;
    }
    
    /**
     * @dev Get user account info
     */
    function getUserAccount(
        address asset,
        address user
    ) external view returns (UserAccount memory) {
        return userAccounts[asset][user];
    }
    
    /**
     * @dev Get market info
     */
    function getMarket(address asset) external view returns (Market memory) {
        return markets[asset];
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}