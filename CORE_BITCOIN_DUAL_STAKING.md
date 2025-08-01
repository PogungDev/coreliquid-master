# CoreBitcoinDualStaking - Core-Native Bitcoin Dual Staking Protocol

## 🚀 Overview

**CoreBitcoinDualStaking** is a revolutionary staking protocol that enables users to stake CORE and Bitcoin simultaneously with Satoshi Plus-based validator delegation mechanisms. This protocol integrates advanced features to maximize yield and provide a seamless staking experience.

## 🎯 Key Features

### 1. **Dual Asset Staking**
- ✅ Simultaneous CORE and BTC staking
- ✅ 1.5x bonus reward for dual staking
- ✅ Minimum stake: 1,000 CORE + 0.01 BTC
- ✅ Flexible staking amounts

### 2. **Satoshi Plus Validator Integration**
- ✅ Validator delegation mechanism
- ✅ Commission-based reward distribution
- ✅ Reputation scoring system (0-100)
- ✅ Multi-validator support

### 3. **Advanced Reward System**
- ✅ Daily reward calculation (1% base rate)
- ✅ Commission deduction (validator-specific)
- ✅ Reputation multiplier
- ✅ Compound reward accumulation

### 4. **Epoch-Based System**
- ✅ 24-hour epoch duration
- ✅ Stake snapshots per epoch
- ✅ Historical tracking
- ✅ Automatic epoch advancement

### 5. **Governance & Security**
- ✅ Role-based access control
- ✅ Emergency pause/unpause
- ✅ Validator management
- ✅ Reward pool management

## 🏗️ Architecture

### Core Contracts

```solidity
CoreB itcoinDualStaking
├── ReentrancyGuard     // Protection against reentrancy attacks
├── AccessControl       // Role-based permissions
└── Pausable           // Emergency controls
```

### Key Data Structures

#### ValidatorInfo
```solidity
struct ValidatorInfo {
    address validatorAddress;    // Validator's address
    uint256 totalCoreStaked;    // Total CORE delegated
    uint256 totalBtcStaked;     // Total BTC delegated
    uint256 commission;         // Commission rate (basis points)
    bool isActive;              // Validator status
    uint256 reputationScore;    // Reputation (0-100)
    uint256 lastRewardDistribution; // Last reward timestamp
}
```

#### DualStakeInfo
```solidity
struct DualStakeInfo {
    uint256 coreAmount;         // Staked CORE amount
    uint256 btcAmount;          // Staked BTC amount
    uint256 validatorId;        // Delegated validator ID
    uint256 startTime;          // Staking start timestamp
    uint256 lastRewardClaim;    // Last reward claim timestamp
    uint256 accumulatedCoreRewards; // Total CORE rewards
    uint256 accumulatedBtcRewards;  // Total BTC rewards
    bool isActive;              // Stake status
}
```

## 🔧 Core Functions

### User Functions

#### `activateDualStake(uint256 coreAmount, uint256 btcAmount, uint256 validatorId)`
**Mengaktifkan dual staking dengan delegasi validator**

```solidity
// Example usage
coreToken.approve(dualStakingAddress, 5000 * 1e18);
btcToken.approve(dualStakingAddress, 2 * 1e18);
dualStaking.activateDualStake(5000 * 1e18, 2 * 1e18, 1);
```

**Requirements:**
- CORE amount ≥ 1,000 CORE
- BTC amount ≥ 0.01 BTC
- Validator must be active
- User tidak sedang staking

#### `harvestRewards()`
**Mengklaim reward yang telah terakumulasi**

```solidity
// Harvest accumulated rewards
dualStaking.harvestRewards();
```

**Features:**
- Automatic reward calculation
- Commission deduction
- Reputation multiplier
- Dual asset rewards

#### `unstake()`
**Menarik stake dan mengklaim reward terakhir**

```solidity
// Unstake and withdraw all assets
dualStaking.unstake();
```

### Admin Functions

#### `registerValidator(address validatorAddress, uint256 commission)`
**Mendaftarkan validator baru**

```solidity
// Register validator with 5% commission
dualStaking.registerValidator(validatorAddress, 500);
```

#### `updateValidatorReputation(uint256 validatorId, uint256 newScore)`
**Update reputation score validator**

```solidity
// Update validator reputation to 95%
dualStaking.updateValidatorReputation(1, 95);
```

## 📊 Reward Calculation

### Formula Reward

```
Base Reward = (Stake Amount × Daily Rate × Days) / 10000
Dual Bonus = Base Reward × 1.5
After Commission = Dual Bonus × (10000 - Commission) / 10000
Final Reward = After Commission × (Reputation Score / 100)
```

### Example Calculation

**Stake:** 5,000 CORE + 2 BTC  
**Validator Commission:** 5%  
**Validator Reputation:** 95%  
**Duration:** 1 day  
**Daily Rate:** 1%  

```
CORE Base Reward = 5000 × 100 × 1 / 10000 = 50 CORE
CORE Dual Bonus = 50 × 1.5 = 75 CORE
CORE After Commission = 75 × 9500 / 10000 = 71.25 CORE
CORE Final Reward = 71.25 × 95 / 100 = 67.69 CORE

BTC Base Reward = 2 × 100 × 1 / 10000 = 0.02 BTC
BTC Dual Bonus = 0.02 × 1.5 = 0.03 BTC
BTC After Commission = 0.03 × 9500 / 10000 = 0.0285 BTC
BTC Final Reward = 0.0285 × 95 / 100 = 0.027075 BTC
```

## 🔐 Security Features

### Access Control
- **DEFAULT_ADMIN_ROLE**: Contract deployment dan role management
- **OPERATOR_ROLE**: Validator management dan reward pools
- **VALIDATOR_ROLE**: Validator-specific functions
- **EMERGENCY_ROLE**: Emergency controls

### Protection Mechanisms
- **ReentrancyGuard**: Mencegah reentrancy attacks
- **Pausable**: Emergency pause untuk situasi darurat
- **SafeERC20**: Safe token transfers
- **SafeMath**: Overflow protection

### Validation Checks
- Minimum stake amounts
- Validator activity status
- User staking status
- Commission limits (max 20%)
- Reputation score bounds (0-100)

## 📈 Analytics & Monitoring

### Global Statistics
```solidity
function getTotalStats() external view returns (
    uint256 totalCoreStaked,
    uint256 totalBtcStaked,
    uint256 totalActiveStakers
);
```

### User Information
```solidity
function getUserStakeInfo(address user) external view returns (DualStakeInfo memory);
function getPendingRewards(address user) external view returns (uint256 coreRewards, uint256 btcRewards);
function getUserValidatorHistory(address user) external view returns (uint256[] memory);
```

### Validator Analytics
```solidity
function getValidatorInfo(uint256 validatorId) external view returns (ValidatorInfo memory);
```

### Epoch Tracking
```solidity
function getCurrentEpochInfo() external view returns (uint256 currentEpoch, uint256 lastUpdate);
function getEpochStakeSnapshot(uint256 epoch, address user) external view returns (uint256);
function getEpochTotalStake(uint256 epoch) external view returns (uint256);
```

## 🚀 Deployment Guide

### Prerequisites
- CORE token contract
- BTC token contract (wrapped BTC)
- Sufficient reward pools

### Deployment Steps

1. **Deploy Contract**
```bash
npx hardhat run scripts/deploy-dual-staking.js --network core_testnet
```

2. **Setup Validators**
```javascript
// Register validators
await dualStaking.registerValidator(validator1Address, 500); // 5%
await dualStaking.registerValidator(validator2Address, 300); // 3%
```

3. **Add Reward Pools**
```javascript
// Add rewards
await coreToken.approve(dualStaking.address, rewardAmount);
await btcToken.approve(dualStaking.address, rewardAmount);
await dualStaking.addRewards(coreRewardAmount, btcRewardAmount);
```

4. **Grant Roles**
```javascript
// Grant operator role
await dualStaking.grantRole(OPERATOR_ROLE, operatorAddress);
```

## 🧪 Testing

### Run Tests
```bash
# Foundry tests
forge test -vv

# Hardhat tests
npx hardhat test
```

### Test Coverage
- ✅ Dual staking activation
- ✅ Reward calculation dan harvesting
- ✅ Validator delegation
- ✅ Epoch advancement
- ✅ Admin functions
- ✅ Emergency controls
- ✅ Edge cases dan error handling

## 🎯 Use Cases

### 1. **Individual Stakers**
- Maksimalkan yield dengan dual asset staking
- Diversifikasi risk dengan multiple validators
- Compound rewards untuk long-term growth

### 2. **Institutional Investors**
- Large-scale dual staking operations
- Validator delegation strategies
- Portfolio optimization

### 3. **Validators**
- Attract delegations dengan competitive commission
- Build reputation untuk higher rewards
- Manage validator operations

### 4. **DeFi Protocols**
- Integrate dual staking sebagai yield source
- Build on top untuk advanced strategies
- Liquidity provision dengan staked assets

## 🔮 Future Enhancements

### Planned Features
- **Liquid Staking**: Tokenized stake positions
- **Auto-Compounding**: Automatic reward reinvestment
- **Slashing Protection**: Insurance mechanisms
- **Cross-Chain**: Multi-chain validator support
- **Governance**: Decentralized protocol governance

### Integration Opportunities
- **TrueUnifiedLiquidityLayer**: Liquidity optimization
- **CoreDEX**: Trading dengan staked assets
- **Lending Protocols**: Collateralized borrowing
- **Insurance**: Stake protection products

## 📞 Support

### Documentation
- [Core Blockchain Docs](https://docs.coredao.org/)
- [Satoshi Plus Consensus](https://docs.coredao.org/docs/Learn/introduction/satoshi-plus-consensus)

### Community
- [Core Discord](https://discord.gg/coredaoofficial)
- [Core Telegram](https://t.me/CoreDAOTelegram)
- [Core Twitter](https://twitter.com/Coredao_Org)

---

## 🏆 Competitive Advantages

### 1. **First-of-its-Kind**
- Pertama dual CORE+BTC staking protocol
- Native integration dengan Core blockchain
- Satoshi Plus validator mechanism

### 2. **Superior Yields**
- 1.5x bonus untuk dual staking
- Compound reward accumulation
- Validator competition untuk best rates

### 3. **Enterprise-Ready**
- Robust security measures
- Comprehensive analytics
- Scalable architecture

### 4. **User-Centric Design**
- Simple activation process
- Flexible unstaking
- Real-time reward tracking

**CoreBitcoinDualStaking** represents the future of cross-asset staking, combining the security of Bitcoin with the innovation of Core blockchain untuk create a truly revolutionary DeFi primitive. 🚀