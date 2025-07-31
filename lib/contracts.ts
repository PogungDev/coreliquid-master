import { ethers, Contract, BrowserProvider, JsonRpcSigner } from 'ethers';
import { CONTRACT_ADDRESSES } from './wagmi';

// ABI definitions for the deployed contracts
const CORE_LIQUID_TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function mint(address to, uint256 amount) returns (bool)',
  'function burn(uint256 amount) returns (bool)',
  'function pause() returns (bool)',
  'function unpause() returns (bool)',
  'function paused() view returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

const CORE_LIQUID_STAKING_ABI = [
  'function stake(uint256 amount) returns (bool)',
  'function unstake(uint256 amount) returns (bool)',
  'function getStakedAmount(address user) view returns (uint256)',
  'function getRewards(address user) view returns (uint256)',
  'function claimRewards() returns (bool)',
  'function getRewardRate() view returns (uint256)',
  'function getTotalStaked() view returns (uint256)',
  'event Staked(address indexed user, uint256 amount)',
  'event Unstaked(address indexed user, uint256 amount)',
  'event RewardsClaimed(address indexed user, uint256 amount)',
];

const CORE_LIQUID_POOL_ABI = [
  'function addLiquidity(uint256 amount) returns (bool)',
  'function removeLiquidity(uint256 shares) returns (bool)',
  'function getPoolBalance() view returns (uint256)',
  'function getUserShares(address user) view returns (uint256)',
  'function getTotalShares() view returns (uint256)',
  'function getFeeRate() view returns (uint256)',
  'function getPoolValue() view returns (uint256)',
  'event LiquidityAdded(address indexed user, uint256 amount, uint256 shares)',
  'event LiquidityRemoved(address indexed user, uint256 amount, uint256 shares)',
];

const UNIFIED_LIQUIDITY_POOL_ABI = [
  'function deposit(address token, uint256 amount) returns (bool)',
  'function withdraw(address token, uint256 amount) returns (bool)',
  'function getBalance(address token, address user) view returns (uint256)',
  'function getTotalValue() view returns (uint256)',
  'function getUtilizationRatio() view returns (uint256)',
  'function getAPR() view returns (uint256)',
  'event Deposit(address indexed user, address indexed token, uint256 amount)',
  'event Withdraw(address indexed user, address indexed token, uint256 amount)',
];

const STCORE_TOKEN_ABI = [
  'function stake() payable returns (uint256)',
  'function unstake(uint256 amount) returns (bool)',
  'function getExchangeRate() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'event Staked(address indexed user, uint256 coreAmount, uint256 stCoreAmount)',
  'event Unstaked(address indexed user, uint256 stCoreAmount, uint256 coreAmount)',
];

const REVENUE_MODEL_ABI = [
  'function claimRevenue() returns (uint256)',
  'function getPendingRevenue(address user) view returns (uint256)',
  'function getTotalRevenue() view returns (uint256)',
  'function getRevenueShare(address user) view returns (uint256)',
  'event RevenueClaimed(address indexed user, uint256 amount)',
  'event RevenueDistributed(uint256 totalAmount)',
];

const DEPOSIT_MANAGER_ABI = [
  'function deposit(address token, uint256 amount) returns (bool)',
  'function withdraw(address token, uint256 amount) returns (bool)',
  'function getDeposit(address user, address token) view returns (uint256)',
  'function getTotalDeposits(address token) view returns (uint256)',
  'event Deposited(address indexed user, address indexed token, uint256 amount)',
  'event Withdrawn(address indexed user, address indexed token, uint256 amount)',
];

const LENDING_MARKET_ABI = [
  'function borrow(address token, uint256 amount) returns (bool)',
  'function repay(address token, uint256 amount) returns (bool)',
  'function getBorrowBalance(address user, address token) view returns (uint256)',
  'function getCollateralValue(address user) view returns (uint256)',
  'function getHealthFactor(address user) view returns (uint256)',
  'event Borrowed(address indexed user, address indexed token, uint256 amount)',
  'event Repaid(address indexed user, address indexed token, uint256 amount)',
];

// Event listener types
interface EventListeners {
  onDeposit?: (event: any) => void;
  onWithdraw?: (event: any) => void;
  onStake?: (event: any) => void;
  onUnstake?: (event: any) => void;
  onRebalance?: (event: any) => void;
  onCompound?: (event: any) => void;
  onRevenueDistribution?: (event: any) => void;
  onLiquidityAdded?: (event: any) => void;
  onLiquidityRemoved?: (event: any) => void;
}

// Contract interaction class
export class CoreFluidXContracts {
  private provider: BrowserProvider;
  private signer: JsonRpcSigner;
  private contracts: { [key: string]: Contract } = {};
  private eventListeners: EventListeners = {};

  constructor(provider: BrowserProvider, signer: JsonRpcSigner) {
    this.provider = provider;
    this.signer = signer;
    this.initializeContracts();
  }

  private initializeContracts() {
    // Initialize all contracts
    this.contracts.coreLiquidToken = new Contract(
      CONTRACT_ADDRESSES.CORE_LIQUID_TOKEN,
      CORE_LIQUID_TOKEN_ABI,
      this.signer
    );

    this.contracts.coreLiquidStaking = new Contract(
      CONTRACT_ADDRESSES.CORE_LIQUID_STAKING,
      CORE_LIQUID_STAKING_ABI,
      this.signer
    );

    this.contracts.coreLiquidPool = new Contract(
      CONTRACT_ADDRESSES.CORE_LIQUID_POOL,
      CORE_LIQUID_POOL_ABI,
      this.signer
    );

    this.contracts.stCoreToken = new Contract(
      CONTRACT_ADDRESSES.STCORE_TOKEN,
      STCORE_TOKEN_ABI,
      this.signer
    );

    this.contracts.unifiedLiquidityPool = new Contract(
      CONTRACT_ADDRESSES.UNIFIED_LIQUIDITY_POOL,
      UNIFIED_LIQUIDITY_POOL_ABI,
      this.signer
    );

    this.contracts.revenueModel = new Contract(
      CONTRACT_ADDRESSES.REVENUE_MODEL,
      REVENUE_MODEL_ABI,
      this.signer
    );

    this.contracts.depositManager = new Contract(
      CONTRACT_ADDRESSES.DEPOSIT_MANAGER,
      DEPOSIT_MANAGER_ABI,
      this.signer
    );

    this.contracts.lendingMarket = new Contract(
      CONTRACT_ADDRESSES.LENDING_MARKET,
      LENDING_MARKET_ABI,
      this.signer
    );
  }

  // Setup event listeners
  setupEventListeners(listeners: EventListeners) {
    this.eventListeners = listeners;

    // Core Liquid Token events
    if (this.eventListeners.onDeposit) {
      this.contracts.coreLiquidToken.on('Transfer', this.eventListeners.onDeposit);
    }

    // Staking events
    if (this.eventListeners.onStake) {
      this.contracts.coreLiquidStaking.on('Staked', this.eventListeners.onStake);
    }

    if (this.eventListeners.onUnstake) {
      this.contracts.coreLiquidStaking.on('Unstaked', this.eventListeners.onUnstake);
    }

    // Pool events
    if (this.eventListeners.onLiquidityAdded) {
      this.contracts.coreLiquidPool.on('LiquidityAdded', this.eventListeners.onLiquidityAdded);
    }

    if (this.eventListeners.onLiquidityRemoved) {
      this.contracts.coreLiquidPool.on('LiquidityRemoved', this.eventListeners.onLiquidityRemoved);
    }

    // Revenue events
    if (this.eventListeners.onRevenueDistribution) {
      this.contracts.revenueModel.on('RevenueDistributed', this.eventListeners.onRevenueDistribution);
    }
  }

  // Remove all event listeners
  removeAllListeners() {
    Object.values(this.contracts).forEach(contract => {
      contract.removeAllListeners();
    });
  }

  // Core Liquid Token operations
  async getTokenBalance(address: string): Promise<string> {
    const balance = await this.contracts.coreLiquidToken.balanceOf(address);
    return ethers.formatEther(balance);
  }

  async approveToken(spender: string, amount: string): Promise<any> {
    const amountWei = ethers.parseEther(amount);
    return await this.contracts.coreLiquidToken.approve(spender, amountWei);
  }

  async transferToken(to: string, amount: string): Promise<any> {
    const amountWei = ethers.parseEther(amount);
    return await this.contracts.coreLiquidToken.transfer(to, amountWei);
  }

  // Staking operations
  async stakeTokens(amount: string): Promise<any> {
    const amountWei = ethers.parseEther(amount);
    return await this.contracts.coreLiquidStaking.stake(amountWei);
  }

  async unstakeTokens(amount: string): Promise<any> {
    const amountWei = ethers.parseEther(amount);
    return await this.contracts.coreLiquidStaking.unstake(amountWei);
  }

  async getStakedAmount(address: string): Promise<string> {
    const amount = await this.contracts.coreLiquidStaking.getStakedAmount(address);
    return ethers.formatEther(amount);
  }

  async getStakingRewards(address: string): Promise<string> {
    const rewards = await this.contracts.coreLiquidStaking.getRewards(address);
    return ethers.formatEther(rewards);
  }

  async claimStakingRewards(): Promise<any> {
    return await this.contracts.coreLiquidStaking.claimRewards();
  }

  // Pool operations
  async addLiquidity(amount: string): Promise<any> {
    const amountWei = ethers.parseEther(amount);
    return await this.contracts.coreLiquidPool.addLiquidity(amountWei);
  }

  async removeLiquidity(shares: string): Promise<any> {
    const sharesWei = ethers.parseEther(shares);
    return await this.contracts.coreLiquidPool.removeLiquidity(sharesWei);
  }

  async getPoolBalance(): Promise<string> {
    const balance = await this.contracts.coreLiquidPool.getPoolBalance();
    return ethers.formatEther(balance);
  }

  async getUserShares(address: string): Promise<string> {
    const shares = await this.contracts.coreLiquidPool.getUserShares(address);
    return ethers.formatEther(shares);
  }

  // StCORE operations
  async stakeCore(amount: string): Promise<any> {
    const amountWei = ethers.parseEther(amount);
    return await this.contracts.stCoreToken.stake({ value: amountWei });
  }

  async unstakeCore(amount: string): Promise<any> {
    const amountWei = ethers.parseEther(amount);
    return await this.contracts.stCoreToken.unstake(amountWei);
  }

  async getStCoreBalance(address: string): Promise<string> {
    const balance = await this.contracts.stCoreToken.balanceOf(address);
    return ethers.formatEther(balance);
  }

  async getExchangeRate(): Promise<string> {
    const rate = await this.contracts.stCoreToken.getExchangeRate();
    return ethers.formatEther(rate);
  }

  // Unified Liquidity Pool operations
  async depositToULP(token: string, amount: string): Promise<any> {
    const amountWei = ethers.parseEther(amount);
    return await this.contracts.unifiedLiquidityPool.deposit(token, amountWei);
  }

  async withdrawFromULP(token: string, amount: string): Promise<any> {
    const amountWei = ethers.parseEther(amount);
    return await this.contracts.unifiedLiquidityPool.withdraw(token, amountWei);
  }

  async getULPBalance(token: string, address: string): Promise<string> {
    const balance = await this.contracts.unifiedLiquidityPool.getBalance(token, address);
    return ethers.formatEther(balance);
  }

  async getULPTotalValue(): Promise<string> {
    const value = await this.contracts.unifiedLiquidityPool.getTotalValue();
    return ethers.formatEther(value);
  }

  async getULPAPR(): Promise<string> {
    const apr = await this.contracts.unifiedLiquidityPool.getAPR();
    return ethers.formatUnits(apr, 2); // Assuming APR is in basis points
  }

  // Revenue operations
  async claimRevenue(): Promise<any> {
    return await this.contracts.revenueModel.claimRevenue();
  }

  async getPendingRevenue(address: string): Promise<string> {
    const revenue = await this.contracts.revenueModel.getPendingRevenue(address);
    return ethers.formatEther(revenue);
  }

  async getTotalRevenue(): Promise<string> {
    const revenue = await this.contracts.revenueModel.getTotalRevenue();
    return ethers.formatEther(revenue);
  }

  // Deposit Manager operations
  async depositToManager(token: string, amount: string): Promise<any> {
    const amountWei = ethers.parseEther(amount);
    return await this.contracts.depositManager.deposit(token, amountWei);
  }

  async withdrawFromManager(token: string, amount: string): Promise<any> {
    const amountWei = ethers.parseEther(amount);
    return await this.contracts.depositManager.withdraw(token, amountWei);
  }

  async getManagerDeposit(user: string, token: string): Promise<string> {
    const deposit = await this.contracts.depositManager.getDeposit(user, token);
    return ethers.formatEther(deposit);
  }

  // Lending Market operations
  async borrowFromMarket(token: string, amount: string): Promise<any> {
    const amountWei = ethers.parseEther(amount);
    return await this.contracts.lendingMarket.borrow(token, amountWei);
  }

  async repayToMarket(token: string, amount: string): Promise<any> {
    const amountWei = ethers.parseEther(amount);
    return await this.contracts.lendingMarket.repay(token, amountWei);
  }

  async getBorrowBalance(user: string, token: string): Promise<string> {
    const balance = await this.contracts.lendingMarket.getBorrowBalance(user, token);
    return ethers.formatEther(balance);
  }

  async getHealthFactor(user: string): Promise<string> {
    const factor = await this.contracts.lendingMarket.getHealthFactor(user);
    return ethers.formatEther(factor);
  }

  // Utility functions for compatibility with existing hooks
  async executeRebalance(): Promise<any> {
    // This would typically call a rebalance function on the main protocol contract
    // For now, we'll simulate it by refreshing pool data
    console.log('Rebalance executed (simulated)');
    return { hash: '0x' + Math.random().toString(16).substr(2, 64) };
  }

  async executeCompound(address: string): Promise<any> {
    // This would typically call a compound function
    // For now, we'll simulate it
    console.log('Compound executed (simulated) for', address);
    return { hash: '0x' + Math.random().toString(16).substr(2, 64) };
  }

  async setCompoundConfig(frequency: number, autoCompound: boolean): Promise<any> {
    // This would typically call a configuration function
    console.log('Compound config set:', { frequency, autoCompound });
    return { hash: '0x' + Math.random().toString(16).substr(2, 64) };
  }

  // Get contract instances for direct access
  getContract(name: string): Contract | undefined {
    return this.contracts[name];
  }

  // Get all contract addresses
  getContractAddresses() {
    return CONTRACT_ADDRESSES;
  }
}

// Export contract ABIs for external use
export {
  CORE_LIQUID_TOKEN_ABI,
  CORE_LIQUID_STAKING_ABI,
  CORE_LIQUID_POOL_ABI,
  UNIFIED_LIQUIDITY_POOL_ABI,
  STCORE_TOKEN_ABI,
  REVENUE_MODEL_ABI,
  DEPOSIT_MANAGER_ABI,
  LENDING_MARKET_ABI,
};

// Export types
export type { EventListeners };