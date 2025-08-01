// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/TrueUnifiedLiquidityLayer.sol";
import "../contracts/SimpleToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TrueUnifiedLiquidityLayerTest
 * @dev Comprehensive test suite for TrueUnifiedLiquidityLayer
 */
contract TrueUnifiedLiquidityLayerTest is Test {
    TrueUnifiedLiquidityLayer public liquidityLayer;
    SimpleToken public testToken;
    SimpleToken public testToken2;
    
    address public treasury = address(0x1234);
    address public user1 = address(0x5678);
    address public user2 = address(0x9ABC);
    address public protocol1 = address(0xDEF0);
    address public protocol2 = address(0x1111);
    address public keeper = address(0x2222);
    
    uint256 public constant INITIAL_SUPPLY = 1000000 * 1e18;
    uint256 public constant DEPOSIT_AMOUNT = 1000 * 1e18;
    
    event Deposited(address indexed user, address indexed asset, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, address indexed asset, uint256 amount, uint256 shares);
    event AssetAccessed(address indexed protocol, address indexed asset, uint256 amount, address indexed user);
    event AssetReturned(address indexed protocol, address indexed asset, uint256 amount, uint256 yield);
    event IdleDetected(address indexed asset, uint256 idleAmount, address indexed targetProtocol);
    event Reallocated(address indexed fromProtocol, address indexed toProtocol, address indexed asset, uint256 amount);
    event ProtocolRegistered(address indexed protocol, string name, uint256 apy);
    event AutoRebalanceExecuted(address indexed asset, uint256 totalReallocated, uint256 newAPY);
    
    function setUp() public {
        // Deploy contracts
        liquidityLayer = new TrueUnifiedLiquidityLayer(treasury);
        testToken = new SimpleToken("Test Token", "TEST", 18, INITIAL_SUPPLY);
        testToken2 = new SimpleToken("Test Token 2", "TEST2", 18, INITIAL_SUPPLY);
        
        // Setup roles
        liquidityLayer.grantRole(liquidityLayer.PROTOCOL_ROLE(), protocol1);
        liquidityLayer.grantRole(liquidityLayer.PROTOCOL_ROLE(), protocol2);
        liquidityLayer.grantRole(liquidityLayer.KEEPER_ROLE(), keeper);
        
        // Add supported assets
        liquidityLayer.addSupportedAsset(address(testToken));
        liquidityLayer.addSupportedAsset(address(testToken2));
        
        // Distribute tokens to users
        testToken.transfer(user1, DEPOSIT_AMOUNT * 10);
        testToken.transfer(user2, DEPOSIT_AMOUNT * 10);
        testToken.transfer(protocol1, DEPOSIT_AMOUNT * 5);
        testToken.transfer(protocol2, DEPOSIT_AMOUNT * 5);
        
        testToken2.transfer(user1, DEPOSIT_AMOUNT * 10);
        testToken2.transfer(user2, DEPOSIT_AMOUNT * 10);
        
        // Register protocols
        liquidityLayer.registerProtocol(
            protocol1,
            "Protocol 1",
            500, // 5% APY
            DEPOSIT_AMOUNT * 100,
            20 // Low risk
        );
        
        liquidityLayer.registerProtocol(
            protocol2,
            "Protocol 2",
            800, // 8% APY
            DEPOSIT_AMOUNT * 50,
            40 // Medium risk
        );
    }
    
    function testInitialSetup() public {
        assertEq(liquidityLayer.treasury(), treasury);
        assertTrue(liquidityLayer.hasRole(liquidityLayer.DEFAULT_ADMIN_ROLE(), address(this)));
        assertTrue(liquidityLayer.hasRole(liquidityLayer.PROTOCOL_ROLE(), protocol1));
        assertTrue(liquidityLayer.hasRole(liquidityLayer.KEEPER_ROLE(), keeper));
    }
    
    function testDepositSuccess() public {
        // Approve and deposit
        vm.startPrank(protocol1);
        testToken.approve(address(liquidityLayer), DEPOSIT_AMOUNT);
        
        vm.expectEmit(true, true, false, true);
        emit Deposited(user1, address(testToken), DEPOSIT_AMOUNT, DEPOSIT_AMOUNT);
        
        liquidityLayer.deposit(address(testToken), DEPOSIT_AMOUNT, user1);
        vm.stopPrank();
        
        // Check balances
        assertEq(liquidityLayer.userBalances(user1, address(testToken)), DEPOSIT_AMOUNT);
        
        TrueUnifiedLiquidityLayer.AssetState memory assetState = liquidityLayer.getAssetState(address(testToken));
        assertEq(assetState.totalDeposited, DEPOSIT_AMOUNT);
        assertTrue(assetState.isActive);
        
        TrueUnifiedLiquidityLayer.UserPosition memory userPos = liquidityLayer.getUserPosition(user1, address(testToken));
        assertEq(userPos.totalDeposited, DEPOSIT_AMOUNT);
        assertEq(userPos.shares, DEPOSIT_AMOUNT);
        assertTrue(userPos.isActive);
    }
    
    function testDepositMultipleUsers() public {
        // User 1 deposit
        vm.startPrank(protocol1);
        testToken.approve(address(liquidityLayer), DEPOSIT_AMOUNT);
        liquidityLayer.deposit(address(testToken), DEPOSIT_AMOUNT, user1);
        vm.stopPrank();
        
        // User 2 deposit
        vm.startPrank(protocol2);
        testToken.approve(address(liquidityLayer), DEPOSIT_AMOUNT * 2);
        liquidityLayer.deposit(address(testToken), DEPOSIT_AMOUNT * 2, user2);
        vm.stopPrank();
        
        // Check total deposits
        TrueUnifiedLiquidityLayer.AssetState memory assetState = liquidityLayer.getAssetState(address(testToken));
        assertEq(assetState.totalDeposited, DEPOSIT_AMOUNT * 3);
        
        // Check individual balances
        assertEq(liquidityLayer.userBalances(user1, address(testToken)), DEPOSIT_AMOUNT);
        assertEq(liquidityLayer.userBalances(user2, address(testToken)), DEPOSIT_AMOUNT * 2);
    }
    
    function testCrossProtocolAssetAccess() public {
        // First deposit some assets
        vm.startPrank(protocol1);
        testToken.approve(address(liquidityLayer), DEPOSIT_AMOUNT);
        liquidityLayer.deposit(address(testToken), DEPOSIT_AMOUNT, user1);
        vm.stopPrank();
        
        // Protocol 2 accesses assets without token transfer
        uint256 accessAmount = DEPOSIT_AMOUNT / 2;
        
        vm.startPrank(protocol2);
        vm.expectEmit(true, true, false, true);
        emit AssetAccessed(protocol2, address(testToken), accessAmount, user1);
        
        liquidityLayer.accessAssets(protocol2, address(testToken), accessAmount, user1);
        vm.stopPrank();
        
        // Check allocations
        assertEq(liquidityLayer.protocolAllocations(protocol2, address(testToken)), accessAmount);
        
        TrueUnifiedLiquidityLayer.AssetState memory assetState = liquidityLayer.getAssetState(address(testToken));
        assertEq(assetState.totalUtilized, accessAmount);
    }
    
    function testReturnAssetsWithYield() public {
        // Setup: deposit and access assets
        vm.startPrank(protocol1);
        testToken.approve(address(liquidityLayer), DEPOSIT_AMOUNT);
        liquidityLayer.deposit(address(testToken), DEPOSIT_AMOUNT, user1);
        vm.stopPrank();
        
        uint256 accessAmount = DEPOSIT_AMOUNT / 2;
        vm.startPrank(protocol2);
        liquidityLayer.accessAssets(protocol2, address(testToken), accessAmount, user1);
        vm.stopPrank();
        
        // Return assets with yield
        uint256 yieldAmount = accessAmount / 10; // 10% yield
        
        vm.startPrank(protocol2);
        vm.expectEmit(true, true, false, true);
        emit AssetReturned(protocol2, address(testToken), accessAmount, yieldAmount);
        
        liquidityLayer.returnAssets(protocol2, address(testToken), accessAmount, yieldAmount);
        vm.stopPrank();
        
        // Check that allocation is reduced
        assertEq(liquidityLayer.protocolAllocations(protocol2, address(testToken)), 0);
        
        TrueUnifiedLiquidityLayer.AssetState memory assetState = liquidityLayer.getAssetState(address(testToken));
        assertEq(assetState.totalUtilized, 0);
        assertGt(assetState.totalYieldGenerated, 0);
    }
    
    function testWithdrawSuccess() public {
        // Setup: deposit first
        vm.startPrank(protocol1);
        testToken.approve(address(liquidityLayer), DEPOSIT_AMOUNT);
        liquidityLayer.deposit(address(testToken), DEPOSIT_AMOUNT, user1);
        vm.stopPrank();
        
        uint256 withdrawAmount = DEPOSIT_AMOUNT / 2;
        uint256 initialBalance = testToken.balanceOf(user1);
        
        // Withdraw
        vm.startPrank(protocol1);
        vm.expectEmit(true, true, false, true);
        emit Withdrawn(user1, address(testToken), withdrawAmount, withdrawAmount);
        
        liquidityLayer.withdraw(address(testToken), withdrawAmount, user1);
        vm.stopPrank();
        
        // Check balances
        assertEq(liquidityLayer.userBalances(user1, address(testToken)), DEPOSIT_AMOUNT - withdrawAmount);
        assertEq(testToken.balanceOf(user1), initialBalance + withdrawAmount);
        
        TrueUnifiedLiquidityLayer.AssetState memory assetState = liquidityLayer.getAssetState(address(testToken));
        assertEq(assetState.totalDeposited, DEPOSIT_AMOUNT - withdrawAmount);
    }
    
    function testIdleCapitalDetection() public {
        // Setup: large deposit to trigger idle detection
        uint256 largeDeposit = DEPOSIT_AMOUNT * 5;
        
        vm.startPrank(protocol1);
        testToken.approve(address(liquidityLayer), largeDeposit);
        liquidityLayer.deposit(address(testToken), largeDeposit, user1);
        vm.stopPrank();
        
        // Check idle capital
        uint256 idleCapital = liquidityLayer.getIdleCapital(address(testToken));
        assertEq(idleCapital, largeDeposit); // All capital is idle initially
        
        // Trigger rebalance
        vm.startPrank(keeper);
        vm.expectEmit(true, false, false, false);
        emit IdleDetected(address(testToken), idleCapital, protocol2); // Protocol 2 has higher APY
        
        liquidityLayer.detectAndReallocate(address(testToken));
        vm.stopPrank();
        
        // Check that assets were reallocated
        assertGt(liquidityLayer.protocolAllocations(protocol2, address(testToken)), 0);
    }
    
    function testComprehensiveRebalance() public {
        // Setup: deposit and allocate to suboptimal protocol
        vm.startPrank(protocol1);
        testToken.approve(address(liquidityLayer), DEPOSIT_AMOUNT);
        liquidityLayer.deposit(address(testToken), DEPOSIT_AMOUNT, user1);
        vm.stopPrank();
        
        // Manually allocate to protocol1 (lower APY)
        vm.startPrank(protocol1);
        liquidityLayer.accessAssets(protocol1, address(testToken), DEPOSIT_AMOUNT / 2, user1);
        vm.stopPrank();
        
        // Execute comprehensive rebalance
        vm.startPrank(address(this)); // Admin role
        liquidityLayer.grantRole(liquidityLayer.REBALANCER_ROLE(), address(this));
        
        vm.expectEmit(true, false, false, false);
        emit AutoRebalanceExecuted(address(testToken), 0, 0); // Values will be calculated
        
        liquidityLayer.executeComprehensiveRebalance(address(testToken));
        vm.stopPrank();
    }
    
    function testProtocolManagement() public {
        address newProtocol = address(0x3333);
        
        vm.expectEmit(true, false, false, true);
        emit ProtocolRegistered(newProtocol, "New Protocol", 1000);
        
        liquidityLayer.registerProtocol(
            newProtocol,
            "New Protocol",
            1000, // 10% APY
            DEPOSIT_AMOUNT * 200,
            60 // Higher risk
        );
        
        TrueUnifiedLiquidityLayer.ProtocolInfo memory protocolInfo = liquidityLayer.getProtocolInfo(newProtocol);
        assertEq(protocolInfo.currentAPY, 1000);
        assertEq(protocolInfo.riskScore, 60);
        assertTrue(protocolInfo.isActive);
        assertTrue(protocolInfo.isVerified);
        
        // Update APY
        vm.startPrank(keeper);
        liquidityLayer.updateProtocolAPY(newProtocol, 1200);
        vm.stopPrank();
        
        protocolInfo = liquidityLayer.getProtocolInfo(newProtocol);
        assertEq(protocolInfo.currentAPY, 1200);
    }
    
    function testTotalValueLocked() public {
        // Deposit to multiple assets
        vm.startPrank(protocol1);
        testToken.approve(address(liquidityLayer), DEPOSIT_AMOUNT);
        liquidityLayer.deposit(address(testToken), DEPOSIT_AMOUNT, user1);
        
        testToken2.approve(address(liquidityLayer), DEPOSIT_AMOUNT * 2);
        liquidityLayer.deposit(address(testToken2), DEPOSIT_AMOUNT * 2, user1);
        vm.stopPrank();
        
        uint256 totalTVL = liquidityLayer.getTotalValueLocked();
        assertEq(totalTVL, DEPOSIT_AMOUNT * 3);
    }
    
    function testAdminFunctions() public {
        // Test fee setting
        liquidityLayer.setProtocolFee(200); // 2%
        assertEq(liquidityLayer.protocolFee(), 200);
        
        liquidityLayer.setTreasuryFee(100); // 1%
        assertEq(liquidityLayer.treasuryFee(), 100);
        
        // Test treasury change
        address newTreasury = address(0x4444);
        liquidityLayer.setTreasury(newTreasury);
        assertEq(liquidityLayer.treasury(), newTreasury);
        
        // Test asset management
        address newAsset = address(0x5555);
        liquidityLayer.addSupportedAsset(newAsset);
        assertTrue(liquidityLayer.supportedAssets(newAsset));
        
        liquidityLayer.removeSupportedAsset(newAsset);
        assertFalse(liquidityLayer.supportedAssets(newAsset));
    }
    
    function testEmergencyFunctions() public {
        // Setup: deposit and allocate
        vm.startPrank(protocol1);
        testToken.approve(address(liquidityLayer), DEPOSIT_AMOUNT);
        liquidityLayer.deposit(address(testToken), DEPOSIT_AMOUNT, user1);
        liquidityLayer.accessAssets(protocol1, address(testToken), DEPOSIT_AMOUNT / 2, user1);
        vm.stopPrank();
        
        // Test pause
        liquidityLayer.pause();
        assertTrue(liquidityLayer.paused());
        
        // Test that operations fail when paused
        vm.startPrank(protocol1);
        vm.expectRevert("Pausable: paused");
        liquidityLayer.deposit(address(testToken), 100, user1);
        vm.stopPrank();
        
        // Test unpause
        liquidityLayer.unpause();
        assertFalse(liquidityLayer.paused());
        
        // Test emergency withdrawal
        uint256 allocatedBefore = liquidityLayer.protocolAllocations(protocol1, address(testToken));
        
        liquidityLayer.emergencyWithdraw(address(testToken), protocol1);
        
        uint256 allocatedAfter = liquidityLayer.protocolAllocations(protocol1, address(testToken));
        assertLt(allocatedAfter, allocatedBefore);
    }
    
    function testFailDepositUnsupportedAsset() public {
        SimpleToken unsupportedToken = new SimpleToken("Unsupported", "UNSUP", 18, 1000);
        
        vm.startPrank(protocol1);
        unsupportedToken.approve(address(liquidityLayer), 100);
        
        vm.expectRevert("Asset not supported");
        liquidityLayer.deposit(address(unsupportedToken), 100, user1);
        vm.stopPrank();
    }
    
    function testFailWithdrawInsufficientBalance() public {
        vm.startPrank(protocol1);
        vm.expectRevert("Insufficient balance");
        liquidityLayer.withdraw(address(testToken), DEPOSIT_AMOUNT, user1);
        vm.stopPrank();
    }
    
    function testFailAccessAssetsInactiveProtocol() public {
        address inactiveProtocol = address(0x6666);
        
        vm.startPrank(protocol1);
        testToken.approve(address(liquidityLayer), DEPOSIT_AMOUNT);
        liquidityLayer.deposit(address(testToken), DEPOSIT_AMOUNT, user1);
        vm.stopPrank();
        
        vm.startPrank(inactiveProtocol);
        vm.expectRevert("Protocol not active");
        liquidityLayer.accessAssets(inactiveProtocol, address(testToken), 100, user1);
        vm.stopPrank();
    }
    
    function testFailRebalanceCooldown() public {
        // Setup deposit
        vm.startPrank(protocol1);
        testToken.approve(address(liquidityLayer), DEPOSIT_AMOUNT);
        liquidityLayer.deposit(address(testToken), DEPOSIT_AMOUNT, user1);
        vm.stopPrank();
        
        // First rebalance
        vm.startPrank(keeper);
        liquidityLayer.detectAndReallocate(address(testToken));
        
        // Try immediate rebalance (should fail due to cooldown)
        vm.expectRevert("Rebalance cooldown active");
        liquidityLayer.detectAndReallocate(address(testToken));
        vm.stopPrank();
    }
    
    function testFailUnauthorizedAccess() public {
        vm.startPrank(user1);
        
        // Should fail - user1 doesn't have PROTOCOL_ROLE
        vm.expectRevert();
        liquidityLayer.deposit(address(testToken), 100, user1);
        
        // Should fail - user1 doesn't have KEEPER_ROLE
        vm.expectRevert();
        liquidityLayer.detectAndReallocate(address(testToken));
        
        // Should fail - user1 doesn't have DEFAULT_ADMIN_ROLE
        vm.expectRevert();
        liquidityLayer.registerProtocol(address(0x7777), "Test", 500, 1000, 50);
        
        vm.stopPrank();
    }
    
    function testGetProtocolAllocations() public {
        // Setup: deposit and allocate to multiple protocols
        vm.startPrank(protocol1);
        testToken.approve(address(liquidityLayer), DEPOSIT_AMOUNT);
        liquidityLayer.deposit(address(testToken), DEPOSIT_AMOUNT, user1);
        liquidityLayer.accessAssets(protocol1, address(testToken), DEPOSIT_AMOUNT / 3, user1);
        vm.stopPrank();
        
        vm.startPrank(protocol2);
        liquidityLayer.accessAssets(protocol2, address(testToken), DEPOSIT_AMOUNT / 3, user1);
        vm.stopPrank();
        
        (address[] memory protocols, uint256[] memory allocations) = liquidityLayer.getProtocolAllocations(address(testToken));
        
        assertEq(protocols.length, allocations.length);
        assertTrue(protocols.length >= 2); // At least our 2 registered protocols
        
        // Find our protocols in the results
        bool found1 = false;
        bool found2 = false;
        
        for (uint256 i = 0; i < protocols.length; i++) {
            if (protocols[i] == protocol1) {
                assertEq(allocations[i], DEPOSIT_AMOUNT / 3);
                found1 = true;
            } else if (protocols[i] == protocol2) {
                assertEq(allocations[i], DEPOSIT_AMOUNT / 3);
                found2 = true;
            }
        }
        
        assertTrue(found1 && found2);
    }
    
    function testComplexScenario() public {
        // Complex scenario: multiple users, multiple assets, multiple protocols
        
        // User 1 deposits TEST token
        vm.startPrank(protocol1);
        testToken.approve(address(liquidityLayer), DEPOSIT_AMOUNT);
        liquidityLayer.deposit(address(testToken), DEPOSIT_AMOUNT, user1);
        vm.stopPrank();
        
        // User 2 deposits TEST2 token
        vm.startPrank(protocol2);
        testToken2.approve(address(liquidityLayer), DEPOSIT_AMOUNT * 2);
        liquidityLayer.deposit(address(testToken2), DEPOSIT_AMOUNT * 2, user2);
        vm.stopPrank();
        
        // Protocol 1 accesses TEST token
        vm.startPrank(protocol1);
        liquidityLayer.accessAssets(protocol1, address(testToken), DEPOSIT_AMOUNT / 2, user1);
        vm.stopPrank();
        
        // Protocol 2 accesses TEST2 token
        vm.startPrank(protocol2);
        liquidityLayer.accessAssets(protocol2, address(testToken2), DEPOSIT_AMOUNT, user2);
        vm.stopPrank();
        
        // Check total TVL
        uint256 totalTVL = liquidityLayer.getTotalValueLocked();
        assertEq(totalTVL, DEPOSIT_AMOUNT * 3);
        
        // Return assets with yield
        vm.startPrank(protocol1);
        liquidityLayer.returnAssets(protocol1, address(testToken), DEPOSIT_AMOUNT / 2, DEPOSIT_AMOUNT / 20); // 5% yield
        vm.stopPrank();
        
        vm.startPrank(protocol2);
        liquidityLayer.returnAssets(protocol2, address(testToken2), DEPOSIT_AMOUNT, DEPOSIT_AMOUNT / 10); // 10% yield
        vm.stopPrank();
        
        // Check yield generation
        TrueUnifiedLiquidityLayer.AssetState memory testTokenState = liquidityLayer.getAssetState(address(testToken));
        TrueUnifiedLiquidityLayer.AssetState memory testToken2State = liquidityLayer.getAssetState(address(testToken2));
        
        assertGt(testTokenState.totalYieldGenerated, 0);
        assertGt(testToken2State.totalYieldGenerated, 0);
        
        // Trigger rebalancing for both assets
        vm.startPrank(keeper);
        
        // Skip time to avoid cooldown
        vm.warp(block.timestamp + 2 hours);
        
        liquidityLayer.detectAndReallocate(address(testToken));
        liquidityLayer.detectAndReallocate(address(testToken2));
        vm.stopPrank();
        
        // Partial withdrawals
        vm.startPrank(protocol1);
        liquidityLayer.withdraw(address(testToken), DEPOSIT_AMOUNT / 4, user1);
        vm.stopPrank();
        
        vm.startPrank(protocol2);
        liquidityLayer.withdraw(address(testToken2), DEPOSIT_AMOUNT, user2);
        vm.stopPrank();
        
        // Final checks
        assertEq(liquidityLayer.userBalances(user1, address(testToken)), DEPOSIT_AMOUNT * 3 / 4);
        assertEq(liquidityLayer.userBalances(user2, address(testToken2)), DEPOSIT_AMOUNT);
    }
}