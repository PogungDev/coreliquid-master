// Token data and utilities for CoreLiquid Protocol

export interface TokenData {
  symbol: string;
  name: string;
  icon: string;
  price: number;
  decimals: number;
  address?: string;
  isNative?: boolean;
}

export const tokens: Record<string, TokenData> = {
  CORE: {
    symbol: 'CORE',
    name: 'Core',
    icon: '🔥',
    price: 1.25,
    decimals: 18,
    isNative: true,
  },
  CLT: {
    symbol: 'CLT',
    name: 'CoreLiquid Token',
    icon: '💧',
    price: 0.85,
    decimals: 18,
    address: '0x63A3F54b45094aB13294584babA15a60Cf7678a8',
  },
  stCORE: {
    symbol: 'stCORE',
    name: 'Staked CORE',
    icon: '🔒',
    price: 1.32,
    decimals: 18,
    address: '0xBb2180ebd78ce97360503434eD37fcf4a1Df61c3',
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: '⟠',
    price: 2450.00,
    decimals: 18,
  },
  WBTC: {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    icon: '₿',
    price: 43250.00,
    decimals: 8,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: '💵',
    price: 1.00,
    decimals: 6,
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    icon: '💰',
    price: 1.00,
    decimals: 6,
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    icon: '🏛️',
    price: 1.00,
    decimals: 18,
  },
};

export function getTokenData(symbol: string): TokenData {
  return tokens[symbol] || {
    symbol,
    name: 'Unknown Token',
    icon: '❓',
    price: 0,
    decimals: 18,
  };
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatTokenAmount(amount: number, decimals = 18): string {
  if (amount === 0) return '0.00';
  if (amount < 0.01) return '<0.01';
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(2) + 'M';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(2) + 'K';
  }
  return amount.toFixed(decimals >= 6 ? 6 : 2);
}

export function parseTokenAmount(amount: string, decimals = 18): bigint {
  try {
    const factor = BigInt(10 ** decimals);
    const [whole, fraction = ''] = amount.split('.');
    const wholeBigInt = BigInt(whole || '0') * factor;
    const fractionBigInt = BigInt(fraction.padEnd(decimals, '0').slice(0, decimals));
    return wholeBigInt + fractionBigInt;
  } catch {
    return BigInt(0);
  }
}

export function formatTokenAmountFromWei(amount: bigint, decimals = 18): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  
  if (fraction === BigInt(0)) {
    return whole.toString();
  }
  
  const fractionStr = fraction.toString().padStart(decimals, '0');
  const trimmedFraction = fractionStr.replace(/0+$/, '');
  
  return `${whole}.${trimmedFraction}`;
}

// APY calculation utilities
export function calculateDailyEarnings(principal: number, apy: number): number {
  return (principal * apy) / 365 / 100;
}

export function calculateMonthlyEarnings(principal: number, apy: number): number {
  return (principal * apy) / 12 / 100;
}

export function calculateYearlyEarnings(principal: number, apy: number): number {
  return (principal * apy) / 100;
}

// Price impact calculation
export function calculatePriceImpact(amount: number, liquidity: number): number {
  if (liquidity === 0) return 0;
  return (amount / liquidity) * 100;
}

// Slippage calculation
export function calculateSlippage(expectedPrice: number, actualPrice: number): number {
  if (expectedPrice === 0) return 0;
  return Math.abs((actualPrice - expectedPrice) / expectedPrice) * 100;
}

// Gas estimation utilities
export function estimateGasCost(gasUsed: number, gasPrice: number): number {
  return (gasUsed * gasPrice) / 1e18; // Convert from wei to ETH
}

// Portfolio utilities
export function calculatePortfolioValue(positions: Array<{ amount: number; price: number }>): number {
  return positions.reduce((total, position) => total + (position.amount * position.price), 0);
}

export function calculatePortfolioAPY(positions: Array<{ amount: number; price: number; apy: number }>): number {
  const totalValue = calculatePortfolioValue(positions);
  if (totalValue === 0) return 0;
  
  const weightedAPY = positions.reduce((total, position) => {
    const weight = (position.amount * position.price) / totalValue;
    return total + (position.apy * weight);
  }, 0);
  
  return weightedAPY;
}