// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/INonfungiblePositionManager.sol";
import "./DepositGuard.sol";
import "./TransferProxy.sol";
import "./RatioCalculator.sol";
import "./RangeCalculator.sol";
import "./UniswapV3Router.sol";
import "./DepositLPToken.sol";
import "./PositionNFT.sol";

/**
 * @title DepositManager
 * @dev Main contract for managing deposit flow
 */
contract DepositManager is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    struct DepositParams {
        address token0;
        address token1;
        uint24 fee;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
        bool useOptimalRange;
        int24 tickLower;
        int24 tickUpper;
    }
    
    struct DepositResult {
        uint256 tokenId;
        uint256 nftTokenId;
        uint128 liquidity;
        uint256 amount0;
        uint256 amount1;
        uint256 lpTokens;
    }
    
    DepositGuard public immutable depositGuard;
    TransferProxy public immutable transferProxy;
    RatioCalculator public immutable ratioCalculator;
    RangeCalculator public immutable rangeCalculator;
    INonfungiblePositionManager public immutable positionManager;
    DepositLPToken public immutable lpToken;
    PositionNFT public immutable positionNFT;
    
    uint256 public constant PRECISION = 1e18;
    uint256 public depositFee = 30; // 0.3% in basis points
    uint256 public constant MAX_FEE = 1000; // 10% max fee
    
    address public feeRecipient;
    
    mapping(address => mapping(address => uint256)) public userDeposits;
    mapping(uint256 => address) public positionOwners;
    
    event Deposit(
        address indexed user,
        address indexed token0,
        address indexed token1,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidity,
        uint256 tokenId,
        uint256 nftTokenId
    );
    
    event DepositFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    
    constructor(
        address _depositGuard,
        address _transferProxy,
        address _ratioCalculator,
        address _rangeCalculator,
        address _positionManager,
        address _lpToken,
        address _positionNFT,
        address _feeRecipient
    ) {
        require(_depositGuard != address(0), "Invalid deposit guard");
        require(_transferProxy != address(0), "Invalid transfer proxy");
        require(_ratioCalculator != address(0), "Invalid ratio calculator");
        require(_rangeCalculator != address(0), "Invalid range calculator");
        require(_positionManager != address(0), "Invalid position manager");
        require(_lpToken != address(0), "Invalid LP token");
        require(_positionNFT != address(0), "Invalid position NFT");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        
        depositGuard = DepositGuard(_depositGuard);
        transferProxy = TransferProxy(_transferProxy);
        ratioCalculator = RatioCalculator(_ratioCalculator);
        rangeCalculator = RangeCalculator(_rangeCalculator);
        positionManager = INonfungiblePositionManager(_positionManager);
        lpToken = DepositLPToken(_lpToken);
        positionNFT = PositionNFT(_positionNFT);
        feeRecipient = _feeRecipient;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }
    
    function deposit(DepositParams calldata params) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (DepositResult memory result) 
    {
        require(params.deadline >= block.timestamp, "Deadline expired");
        require(params.recipient != address(0), "Invalid recipient");
        require(params.amount0Desired > 0 || params.amount1Desired > 0, "Invalid amounts");
        
        // Validate deposit through guard
        require(
            depositGuard.validateDeposit(
                params.token0,
                params.token1,
                params.amount0Desired,
                params.amount1Desired
            ),
            "Deposit validation failed"
        );
        
        // Calculate optimal amounts and range
        (uint256 amount0, uint256 amount1, int24 tickLower, int24 tickUpper) = 
            _calculateOptimalDeposit(params);
        
        // Transfer tokens from user
        if (amount0 > 0) {
            transferProxy.safeTransferFrom(
                params.token0,
                msg.sender,
                address(this),
                amount0
            );
        }
        
        if (amount1 > 0) {
            transferProxy.safeTransferFrom(
                params.token1,
                msg.sender,
                address(this),
                amount1
            );
        }
        
        // Deduct fees
        (uint256 netAmount0, uint256 netAmount1) = _deductFees(
            params.token0,
            params.token1,
            amount0,
            amount1
        );
        
        // Approve tokens for Uniswap
        if (netAmount0 > 0) {
            IERC20(params.token0).forceApprove(address(positionManager), netAmount0);
        }
        if (netAmount1 > 0) {
            IERC20(params.token1).forceApprove(address(positionManager), netAmount1);
        }
        
        // Mint position on Uniswap
        INonfungiblePositionManager.MintParams memory mintParams = INonfungiblePositionManager.MintParams({
            token0: params.token0,
            token1: params.token1,
            fee: params.fee,
            tickLower: tickLower,
            tickUpper: tickUpper,
            amount0Desired: netAmount0,
            amount1Desired: netAmount1,
            amount0Min: params.amount0Min,
            amount1Min: params.amount1Min,
            recipient: address(this),
            deadline: params.deadline
        });
        
        (uint256 tokenId, uint128 liquidity, uint256 actualAmount0, uint256 actualAmount1) = 
            positionManager.mint(mintParams);
        
        // Mint position NFT
        uint256 nftTokenId = positionNFT.mintPosition(
            params.recipient,
            tokenId,
            params.token0,
            params.token1,
            params.fee,
            tickLower,
            tickUpper,
            liquidity,
            actualAmount0,
            actualAmount1
        );
        
        // Calculate LP tokens to mint
        uint256 lpTokensToMint = _calculateLPTokens(liquidity, params.token0, params.token1);
        
        // Mint LP tokens
        uint256 underlyingValue = actualAmount0 + actualAmount1; // Simplified calculation
        lpToken.mint(params.recipient, lpTokensToMint, underlyingValue);
        
        // Update user deposits
        userDeposits[params.recipient][params.token0] += actualAmount0;
        userDeposits[params.recipient][params.token1] += actualAmount1;
        positionOwners[tokenId] = params.recipient;
        
        // Refund excess tokens
        _refundExcess(
            params.token0,
            params.token1,
            netAmount0 - actualAmount0,
            netAmount1 - actualAmount1,
            params.recipient
        );
        
        result = DepositResult({
            tokenId: tokenId,
            nftTokenId: nftTokenId,
            liquidity: liquidity,
            amount0: actualAmount0,
            amount1: actualAmount1,
            lpTokens: lpTokensToMint
        });
        
        emit Deposit(
            params.recipient,
            params.token0,
            params.token1,
            actualAmount0,
            actualAmount1,
            liquidity,
            tokenId,
            nftTokenId
        );
    }
    
    function _calculateOptimalDeposit(DepositParams calldata params)
        internal
        returns (uint256 amount0, uint256 amount1, int24 tickLower, int24 tickUpper)
    {
        if (params.useOptimalRange) {
            // Calculate optimal range
            address pool = _getPool(params.token0, params.token1, params.fee);
            uint256 currentPrice = _getCurrentPrice(pool);
            (tickLower, tickUpper) = rangeCalculator.selectTicks(
                currentPrice,
                pool,
                _getTickSpacing(params.fee)
            );
        } else {
            tickLower = params.tickLower;
            tickUpper = params.tickUpper;
        }
        
        // Calculate optimal amounts
        (amount0, amount1) = ratioCalculator.computeOptimalAmounts(
            params.amount0Desired,
            params.amount1Desired,
            1000000, // reserveA placeholder
            1000000  // reserveB placeholder
        );
    }
    
    function _deductFees(address token0, address token1, uint256 amount0, uint256 amount1)
        internal
        returns (uint256 netAmount0, uint256 netAmount1)
    {
        uint256 fee0 = (amount0 * depositFee) / 10000;
        uint256 fee1 = (amount1 * depositFee) / 10000;
        
        netAmount0 = amount0 - fee0;
        netAmount1 = amount1 - fee1;
        
        // Transfer fees to fee recipient
        if (fee0 > 0) {
            IERC20(token0).safeTransfer(feeRecipient, fee0);
        }
        if (fee1 > 0) {
            IERC20(token1).safeTransfer(feeRecipient, fee1);
        }
    }
    
    function _calculateLPTokens(uint128 liquidity, address /* _token0 */, address /* _token1 */)
        internal
        pure
        returns (uint256)
    {
        // Simple calculation based on liquidity
        // In production, this should consider token prices and pool ratios
        return uint256(liquidity);
    }
    
    function _refundExcess(
        address token0,
        address token1,
        uint256 excess0,
        uint256 excess1,
        address recipient
    ) internal {
        if (excess0 > 0) {
            IERC20(token0).safeTransfer(recipient, excess0);
        }
        if (excess1 > 0) {
            IERC20(token1).safeTransfer(recipient, excess1);
        }
    }
    
    function getUserPositions(address user) external view returns (uint256[] memory) {
        return positionNFT.getUserPositions(user);
    }
    
    function getPositionDetails(uint256 tokenId) external view returns (PositionNFT.PositionData memory) {
        return positionNFT.getPosition(tokenId);
    }
    
    function setDepositFee(uint256 _fee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_fee <= MAX_FEE, "Fee too high");
        uint256 oldFee = depositFee;
        depositFee = _fee;
        emit DepositFeeUpdated(oldFee, _fee);
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        address oldRecipient = feeRecipient;
        feeRecipient = _feeRecipient;
        emit FeeRecipientUpdated(oldRecipient, _feeRecipient);
    }
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    function emergencyWithdraw(address token, uint256 amount) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        IERC20(token).safeTransfer(msg.sender, amount);
    }
    
    function _getPool(address token0, address token1, uint24 fee) internal pure returns (address) {
        // Simple pool address calculation - in production use Uniswap factory
        return address(uint160(uint256(keccak256(abi.encodePacked(token0, token1, fee)))));
    }
    
    function _getCurrentPrice(address /* _pool */) internal pure returns (uint256) {
        // Placeholder - in production get from Uniswap pool
        return 1e18; // 1:1 price
    }
    
    function _getTickSpacing(uint24 fee) internal pure returns (int24) {
        if (fee == 100) return 1;
        if (fee == 500) return 10;
        if (fee == 3000) return 60;
        if (fee == 10000) return 200;
        return 60; // Default
    }
}