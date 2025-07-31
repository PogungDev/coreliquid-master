'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Droplets, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown, 
  Coins, 
  Gift, 
  Target, 
  Award, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Activity, 
  Zap, 
  Shield, 
  Star, 
  Timer, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Minus, 
  RefreshCw, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download, 
  Upload, 
  Settings, 
  HelpCircle, 
  ExternalLink, 
  Copy, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Users, 
  Globe, 
  Database, 
  Network, 
  Cpu, 
  Server, 
  Code, 
  Package, 
  Layers, 
  Monitor,
  Lock,
  Unlock,
  DollarSign,
  Percent,
  Clock,
  TrendingDown as TrendDown,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Maximize2,
  Minimize2
} from 'lucide-react';

export default function LiquidityPage() {
  const [activeTab, setActiveTab] = useState('pools');
  const [selectedPool, setSelectedPool] = useState(null);
  const [addLiquidityAmount1, setAddLiquidityAmount1] = useState('');
  const [addLiquidityAmount2, setAddLiquidityAmount2] = useState('');
  const [removeLiquidityAmount, setRemoveLiquidityAmount] = useState('');
  const [isAddLiquidityDialogOpen, setIsAddLiquidityDialogOpen] = useState(false);
  const [isRemoveLiquidityDialogOpen, setIsRemoveLiquidityDialogOpen] = useState(false);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [userBalances, setUserBalances] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [slippageTolerance, setSlippageTolerance] = useState('0.5');
  const [deadline, setDeadline] = useState('20');

  // Liquidity data
  const [liquidityData] = useState({
    overview: {
      totalValueLocked: 125600000,
      totalVolume24h: 8900000,
      totalFees24h: 26700,
      totalPools: 12,
      activeFarms: 8,
      totalRewards: 1890000,
      averageAPR: 45.8,
      totalLiquidityProviders: 3420
    },
    userStats: {
      totalLiquidity: 45000,
      pendingRewards: 234.56,
      claimedRewards: 1567.89,
      totalFees: 89.45,
      impermanentLoss: -12.34,
      portfolioValue: 47890,
      lpTokens: 12.456,
      activePools: 3
    },
    liquidityPools: [
      {
        id: 'core-eth',
        name: 'CORE/ETH',
        token0: 'CORE',
        token1: 'ETH',
        token0Reserve: 2500000,
        token1Reserve: 1250,
        token0Price: 0.85,
        token1Price: 2125.50,
        totalLiquidity: 5312500,
        volume24h: 1890000,
        fees24h: 5670,
        apr: 67.5,
        userLiquidity: 15000,
        userLpTokens: 4.567,
        pendingRewards: 89.45,
        poolShare: 0.28,
        status: 'Active',
        multiplier: 2.5,
        farmingRewards: true,
        impermanentLoss: -5.67,
        feeTier: 0.3,
        protocol: 'CoreLiquid',
        created: '2023-06-01T00:00:00Z'
      },
      {
        id: 'core-usdc',
        name: 'CORE/USDC',
        token0: 'CORE',
        token1: 'USDC',
        token0Reserve: 3200000,
        token1Reserve: 2720000,
        token0Price: 0.85,
        token1Price: 1.00,
        totalLiquidity: 5440000,
        volume24h: 2340000,
        fees24h: 7020,
        apr: 52.3,
        userLiquidity: 20000,
        userLpTokens: 6.789,
        pendingRewards: 123.78,
        poolShare: 0.37,
        status: 'Active',
        multiplier: 2.0,
        farmingRewards: true,
        impermanentLoss: -2.34,
        feeTier: 0.3,
        protocol: 'CoreLiquid',
        created: '2023-06-15T00:00:00Z'
      },
      {
        id: 'core-btc',
        name: 'CORE/WBTC',
        token0: 'CORE',
        token1: 'WBTC',
        token0Reserve: 1800000,
        token1Reserve: 36.5,
        token0Price: 0.85,
        token1Price: 42150.00,
        totalLiquidity: 3069750,
        volume24h: 890000,
        fees24h: 2670,
        apr: 38.9,
        userLiquidity: 10000,
        userLpTokens: 1.234,
        pendingRewards: 21.33,
        poolShare: 0.33,
        status: 'Active',
        multiplier: 1.8,
        farmingRewards: true,
        impermanentLoss: -8.91,
        feeTier: 0.3,
        protocol: 'CoreLiquid',
        created: '2023-07-01T00:00:00Z'
      },
      {
        id: 'eth-usdc',
        name: 'ETH/USDC',
        token0: 'ETH',
        token1: 'USDC',
        token0Reserve: 1890,
        token1Reserve: 4017225,
        token0Price: 2125.50,
        token1Price: 1.00,
        totalLiquidity: 8034450,
        volume24h: 3450000,
        fees24h: 10350,
        apr: 47.2,
        userLiquidity: 0,
        userLpTokens: 0,
        pendingRewards: 0,
        poolShare: 0,
        status: 'Active',
        multiplier: 1.5,
        farmingRewards: true,
        impermanentLoss: 0,
        feeTier: 0.3,
        protocol: 'CoreLiquid',
        created: '2023-06-10T00:00:00Z'
      },
      {
        id: 'core-dai',
        name: 'CORE/DAI',
        token0: 'CORE',
        token1: 'DAI',
        token0Reserve: 2100000,
        token1Reserve: 1785000,
        token0Price: 0.85,
        token1Price: 1.00,
        totalLiquidity: 3570000,
        volume24h: 567000,
        fees24h: 1701,
        apr: 28.5,
        userLiquidity: 0,
        userLpTokens: 0,
        pendingRewards: 0,
        poolShare: 0,
        status: 'Active',
        multiplier: 1.2,
        farmingRewards: false,
        impermanentLoss: 0,
        feeTier: 0.3,
        protocol: 'CoreLiquid',
        created: '2023-08-01T00:00:00Z'
      },
      {
        id: 'core-link',
        name: 'CORE/LINK',
        token0: 'CORE',
        token1: 'LINK',
        token0Reserve: 1500000,
        token1Reserve: 89250,
        token0Price: 0.85,
        token1Price: 14.25,
        totalLiquidity: 2546875,
        volume24h: 234000,
        fees24h: 702,
        apr: 19.8,
        userLiquidity: 0,
        userLpTokens: 0,
        pendingRewards: 0,
        poolShare: 0,
        status: 'Active',
        multiplier: 1.0,
        farmingRewards: false,
        impermanentLoss: 0,
        feeTier: 0.3,
        protocol: 'CoreLiquid',
        created: '2023-09-01T00:00:00Z'
      }
    ],
    farmingPools: [
      {
        id: 'farm-core-eth',
        poolId: 'core-eth',
        name: 'CORE/ETH Farm',
        rewardToken: 'CORE',
        apr: 45.2,
        totalStaked: 2890000,
        userStaked: 15000,
        pendingRewards: 89.45,
        multiplier: 2.5,
        allocPoint: 250,
        lastRewardBlock: 18567890,
        rewardPerBlock: 0.5,
        status: 'Active',
        startBlock: 18000000,
        endBlock: 19000000,
        lockPeriod: 0
      },
      {
        id: 'farm-core-usdc',
        poolId: 'core-usdc',
        name: 'CORE/USDC Farm',
        rewardToken: 'CORE',
        apr: 38.7,
        totalStaked: 3450000,
        userStaked: 20000,
        pendingRewards: 123.78,
        multiplier: 2.0,
        allocPoint: 200,
        lastRewardBlock: 18567890,
        rewardPerBlock: 0.4,
        status: 'Active',
        startBlock: 18000000,
        endBlock: 19000000,
        lockPeriod: 0
      },
      {
        id: 'farm-core-btc',
        poolId: 'core-btc',
        name: 'CORE/WBTC Farm',
        rewardToken: 'CORE',
        apr: 29.1,
        totalStaked: 1890000,
        userStaked: 10000,
        pendingRewards: 21.33,
        multiplier: 1.8,
        allocPoint: 180,
        lastRewardBlock: 18567890,
        rewardPerBlock: 0.36,
        status: 'Active',
        startBlock: 18000000,
        endBlock: 19000000,
        lockPeriod: 0
      }
    ],
    transactions: [
      {
        id: '1',
        type: 'Add Liquidity',
        pool: 'CORE/ETH',
        amount1: 5000,
        amount2: 2.35,
        token1: 'CORE',
        token2: 'ETH',
        lpTokens: 1.567,
        timestamp: '2024-01-15T10:30:00Z',
        txHash: '0x1234...5678',
        status: 'Confirmed'
      },
      {
        id: '2',
        type: 'Remove Liquidity',
        pool: 'CORE/USDC',
        amount1: 2000,
        amount2: 1700,
        token1: 'CORE',
        token2: 'USDC',
        lpTokens: 0.789,
        timestamp: '2024-01-12T14:20:00Z',
        txHash: '0x2345...6789',
        status: 'Confirmed'
      },
      {
        id: '3',
        type: 'Claim Rewards',
        pool: 'CORE/ETH',
        amount1: 45.67,
        token1: 'CORE',
        timestamp: '2024-01-10T09:15:00Z',
        txHash: '0x3456...7890',
        status: 'Confirmed'
      },
      {
        id: '4',
        type: 'Add Liquidity',
        pool: 'CORE/WBTC',
        amount1: 8000,
        amount2: 0.19,
        token1: 'CORE',
        token2: 'WBTC',
        lpTokens: 0.456,
        timestamp: '2024-01-08T16:45:00Z',
        txHash: '0x4567...8901',
        status: 'Confirmed'
      }
    ],
    analytics: {
      volumeTrends: {
        daily: [
          { date: '2024-01-10', volume: 8200000, fees: 24600 },
          { date: '2024-01-11', volume: 8500000, fees: 25500 },
          { date: '2024-01-12', volume: 8800000, fees: 26400 },
          { date: '2024-01-13', volume: 8600000, fees: 25800 },
          { date: '2024-01-14', volume: 8900000, fees: 26700 },
          { date: '2024-01-15', volume: 8900000, fees: 26700 }
        ],
        weekly: [
          { week: 'Week 1', volume: 56000000, tvl: 118000000 },
          { week: 'Week 2', volume: 58500000, tvl: 121000000 },
          { week: 'Week 3', volume: 61200000, tvl: 123500000 },
          { week: 'Week 4', volume: 62300000, tvl: 125600000 }
        ]
      },
      poolPerformance: [
        { pool: 'CORE/ETH', volume: 1890000, fees: 5670, apr: 67.5, tvl: 5312500 },
        { pool: 'CORE/USDC', volume: 2340000, fees: 7020, apr: 52.3, tvl: 5440000 },
        { pool: 'ETH/USDC', volume: 3450000, fees: 10350, apr: 47.2, tvl: 8034450 },
        { pool: 'CORE/WBTC', volume: 890000, fees: 2670, apr: 38.9, tvl: 3069750 },
        { pool: 'CORE/DAI', volume: 567000, fees: 1701, apr: 28.5, tvl: 3570000 }
      ],
      topProviders: [
        { address: '0x1111...1111', liquidity: 890000, pools: 5, rewards: 2340 },
        { address: '0x2222...2222', liquidity: 670000, pools: 3, rewards: 1890 },
        { address: '0x3333...3333', liquidity: 540000, pools: 4, rewards: 1560 },
        { address: '0x4444...4444', liquidity: 450000, pools: 2, rewards: 1230 },
        { address: '0x5555...5555', liquidity: 380000, pools: 3, rewards: 980 }
      ]
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Paused': return 'bg-yellow-100 text-yellow-800';
      case 'Ended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatTokens = (value: number, decimals: number = 2) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(decimals);
  };

  const calculatePoolRatio = (pool: any) => {
    const total = pool.token0Reserve * pool.token0Price + pool.token1Reserve * pool.token1Price;
    const ratio1 = (pool.token0Reserve * pool.token0Price / total) * 100;
    const ratio2 = (pool.token1Reserve * pool.token1Price / total) * 100;
    return { ratio1: ratio1.toFixed(1), ratio2: ratio2.toFixed(1) };
  };

  const handleAddLiquidity = async (poolId: string, amount1: string, amount2: string) => {
    setIsLoading(true);
    try {
      // Simulate add liquidity transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`Added liquidity: ${amount1} + ${amount2} to pool ${poolId}`);
      
      setIsAddLiquidityDialogOpen(false);
      setAddLiquidityAmount1('');
      setAddLiquidityAmount2('');
      setSelectedPool(null);
    } catch (error) {
      console.error('Add liquidity failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLiquidity = async (poolId: string, amount: string) => {
    setIsLoading(true);
    try {
      // Simulate remove liquidity transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`Removed ${amount} LP tokens from pool ${poolId}`);
      
      setIsRemoveLiquidityDialogOpen(false);
      setRemoveLiquidityAmount('');
      setSelectedPool(null);
    } catch (error) {
      console.error('Remove liquidity failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimRewards = async (poolId: string) => {
    setIsLoading(true);
    try {
      // Simulate claim transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`Claimed rewards from pool ${poolId}`);
      
      setIsClaimDialogOpen(false);
      setSelectedPool(null);
    } catch (error) {
      console.error('Claim failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Liquidity Mining</h1>
              <p className="text-slate-300">Provide liquidity and earn trading fees + farming rewards</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-slate-400 text-sm">Portfolio Value</p>
                <p className="text-white font-bold text-lg">{formatCurrency(liquidityData.userStats.portfolioValue)}</p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Value Locked</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(liquidityData.overview.totalValueLocked)}</p>
                  <p className="text-green-400 text-sm">+8.5% this month</p>
                </div>
                <Droplets className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">24h Volume</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(liquidityData.overview.totalVolume24h)}</p>
                  <p className="text-green-400 text-sm">+12.3% vs yesterday</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">24h Fees</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(liquidityData.overview.totalFees24h)}</p>
                  <p className="text-blue-400 text-sm">Trading fees earned</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Average APR</p>
                  <p className="text-2xl font-bold text-white">{liquidityData.overview.averageAPR}%</p>
                  <p className="text-purple-400 text-sm">Across all pools</p>
                </div>
                <Percent className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Stats */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Your Liquidity Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{formatCurrency(liquidityData.userStats.totalLiquidity)}</p>
                <p className="text-slate-400">Total Liquidity</p>
                <p className="text-blue-400 text-sm">{liquidityData.userStats.activePools} active pools</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">{formatTokens(liquidityData.userStats.pendingRewards)}</p>
                <p className="text-slate-400">Pending Rewards</p>
                <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700">
                  Claim All
                </Button>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">{formatCurrency(liquidityData.userStats.totalFees)}</p>
                <p className="text-slate-400">Fees Earned</p>
                <p className="text-slate-500 text-sm">All time</p>
              </div>
              <div className="text-center">
                <p className={`text-3xl font-bold ${liquidityData.userStats.impermanentLoss < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {liquidityData.userStats.impermanentLoss > 0 ? '+' : ''}{liquidityData.userStats.impermanentLoss.toFixed(2)}%
                </p>
                <p className="text-slate-400">Impermanent Loss</p>
                <p className="text-slate-500 text-sm">Current estimate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="pools" className="data-[state=active]:bg-purple-600">Pools</TabsTrigger>
            <TabsTrigger value="farming" className="data-[state=active]:bg-purple-600">Farming</TabsTrigger>
            <TabsTrigger value="positions" className="data-[state=active]:bg-purple-600">Positions</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">Analytics</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">History</TabsTrigger>
          </TabsList>

          {/* Liquidity Pools Tab */}
          <TabsContent value="pools" className="space-y-6">
            <div className="grid gap-6">
              {liquidityData.liquidityPools.map((pool) => {
                const ratios = calculatePoolRatio(pool);
                return (
                  <Card key={pool.id} className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-medium text-xl">{pool.name}</h3>
                            <Badge className={getStatusColor(pool.status)}>
                              {pool.status}
                            </Badge>
                            <Badge variant="outline" className="border-blue-500 text-blue-400">
                              {pool.feeTier}% Fee
                            </Badge>
                            {pool.farmingRewards && (
                              <Badge variant="outline" className="border-green-500 text-green-400">
                                <Gift className="w-3 h-3 mr-1" />
                                Farming
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-400 mb-3">
                            <span>{pool.token0}: {ratios.ratio1}%</span>
                            <span>{pool.token1}: {ratios.ratio2}%</span>
                            <span>Protocol: {pool.protocol}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-green-400">{pool.apr}%</p>
                          <p className="text-slate-400 text-sm">APR</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-slate-400 text-sm">Total Liquidity</p>
                          <p className="text-white font-medium">{formatCurrency(pool.totalLiquidity)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">24h Volume</p>
                          <p className="text-white font-medium">{formatCurrency(pool.volume24h)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">24h Fees</p>
                          <p className="text-green-400 font-medium">{formatCurrency(pool.fees24h)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Your Share</p>
                          <p className="text-purple-400 font-medium">{pool.poolShare.toFixed(3)}%</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-slate-700/30 rounded-lg">
                          <p className="text-slate-400 text-sm mb-1">{pool.token0} Reserve</p>
                          <p className="text-white font-medium">{formatTokens(pool.token0Reserve)} {pool.token0}</p>
                          <p className="text-slate-500 text-xs">${pool.token0Price.toFixed(4)} per token</p>
                        </div>
                        <div className="p-3 bg-slate-700/30 rounded-lg">
                          <p className="text-slate-400 text-sm mb-1">{pool.token1} Reserve</p>
                          <p className="text-white font-medium">{formatTokens(pool.token1Reserve)} {pool.token1}</p>
                          <p className="text-slate-500 text-xs">${pool.token1Price.toFixed(2)} per token</p>
                        </div>
                      </div>

                      {pool.userLiquidity > 0 && (
                        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 mb-4">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-slate-400 text-sm">Your Liquidity</p>
                              <p className="text-white font-medium">{formatCurrency(pool.userLiquidity)}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-sm">LP Tokens</p>
                              <p className="text-white font-medium">{pool.userLpTokens.toFixed(3)}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-sm">Pending Rewards</p>
                              <p className="text-green-400 font-medium">{formatTokens(pool.pendingRewards)} CORE</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                          <p>Created: {new Date(pool.created).toLocaleDateString()}</p>
                          {pool.userLiquidity > 0 && pool.impermanentLoss !== 0 && (
                            <p className={pool.impermanentLoss < 0 ? 'text-red-400' : 'text-green-400'}>
                              IL: {pool.impermanentLoss > 0 ? '+' : ''}{pool.impermanentLoss.toFixed(2)}%
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {pool.pendingRewards > 0 && (
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedPool(pool);
                                setIsClaimDialogOpen(true);
                              }}
                            >
                              <Gift className="w-4 h-4 mr-1" />
                              Claim
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              setSelectedPool(pool);
                              setIsAddLiquidityDialogOpen(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                          {pool.userLiquidity > 0 && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-slate-600"
                              onClick={() => {
                                setSelectedPool(pool);
                                setIsRemoveLiquidityDialogOpen(true);
                              }}
                            >
                              <Minus className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="border-slate-600">
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Farming Tab */}
          <TabsContent value="farming" className="space-y-6">
            <div className="grid gap-6">
              {liquidityData.farmingPools.map((farm) => {
                const pool = liquidityData.liquidityPools.find(p => p.id === farm.poolId);
                return (
                  <Card key={farm.id} className="bg-slate-800/50 border-slate-700 hover:border-green-500 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-medium text-xl">{farm.name}</h3>
                            <Badge className={getStatusColor(farm.status)}>
                              {farm.status}
                            </Badge>
                            <Badge variant="outline" className="border-green-500 text-green-400">
                              {farm.multiplier}x Multiplier
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm mb-3">Earn {farm.rewardToken} tokens by staking LP tokens</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-green-400">{farm.apr}%</p>
                          <p className="text-slate-400 text-sm">Farm APR</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-slate-400 text-sm">Total Staked</p>
                          <p className="text-white font-medium">{formatCurrency(farm.totalStaked)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Your Stake</p>
                          <p className="text-white font-medium">{formatCurrency(farm.userStaked)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Pending Rewards</p>
                          <p className="text-green-400 font-medium">{formatTokens(farm.pendingRewards)} {farm.rewardToken}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Reward/Block</p>
                          <p className="text-purple-400 font-medium">{farm.rewardPerBlock} {farm.rewardToken}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Farm Progress</span>
                          <span className="text-slate-300">
                            Block {farm.lastRewardBlock.toLocaleString()} / {farm.endBlock.toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={((farm.lastRewardBlock - farm.startBlock) / (farm.endBlock - farm.startBlock)) * 100} 
                          className="h-2" 
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                          <p>Alloc Point: {farm.allocPoint}</p>
                          <p>Lock Period: {farm.lockPeriod} blocks</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {farm.pendingRewards > 0 && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <Gift className="w-4 h-4 mr-1" />
                              Harvest
                            </Button>
                          )}
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-1" />
                            Stake
                          </Button>
                          {farm.userStaked > 0 && (
                            <Button size="sm" variant="outline" className="border-slate-600">
                              <Minus className="w-4 h-4 mr-1" />
                              Unstake
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Positions Tab */}
          <TabsContent value="positions" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Your Liquidity Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {liquidityData.liquidityPools
                    .filter(pool => pool.userLiquidity > 0)
                    .map((pool) => (
                      <div key={pool.id} className="p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <Droplets className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{pool.name}</h4>
                              <p className="text-slate-400 text-sm">{pool.apr}% APR</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">{formatCurrency(pool.userLiquidity)}</p>
                            <p className="text-slate-400 text-sm">{pool.userLpTokens.toFixed(3)} LP</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div className="text-center">
                            <p className="text-slate-400 text-sm">Pool Share</p>
                            <p className="text-white">{pool.poolShare.toFixed(3)}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-400 text-sm">Pending Rewards</p>
                            <p className="text-green-400">{formatTokens(pool.pendingRewards)} CORE</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-400 text-sm">Impermanent Loss</p>
                            <p className={pool.impermanentLoss < 0 ? 'text-red-400' : 'text-green-400'}>
                              {pool.impermanentLoss > 0 ? '+' : ''}{pool.impermanentLoss.toFixed(2)}%
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Gift className="w-4 h-4 mr-1" />
                            Claim
                          </Button>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                          <Button size="sm" variant="outline" className="border-slate-600">
                            <Minus className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))
                  }
                  {liquidityData.liquidityPools.filter(pool => pool.userLiquidity > 0).length === 0 && (
                    <div className="text-center py-8">
                      <Droplets className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No liquidity positions found</p>
                      <p className="text-slate-500 text-sm">Add liquidity to pools to start earning fees and rewards</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Pool Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {liquidityData.analytics.poolPerformance.map((pool, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-blue-400' :
                            index === 1 ? 'bg-green-400' :
                            index === 2 ? 'bg-purple-400' :
                            index === 3 ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`}></div>
                          <span className="text-slate-300">{pool.pool}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-white">{pool.apr}% APR</p>
                          <p className="text-slate-400 text-sm">{formatCurrency(pool.volume)} vol</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Volume Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">Volume trends chart would be rendered here</p>
                      <p className="text-slate-500 text-sm">Showing trading volume over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Top Liquidity Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {liquidityData.analytics.topProviders.map((provider, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-full">
                          <span className="text-white font-bold text-sm">#{index + 1}</span>
                        </div>
                        <span className="text-slate-300 font-mono">{provider.address}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{formatCurrency(provider.liquidity)}</p>
                        <p className="text-slate-400 text-sm">{provider.pools} pools • {formatTokens(provider.rewards)} CORE</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {liquidityData.transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          tx.type === 'Add Liquidity' ? 'bg-green-500/20' :
                          tx.type === 'Remove Liquidity' ? 'bg-red-500/20' :
                          'bg-purple-500/20'
                        }`}>
                          {tx.type === 'Add Liquidity' ? (
                            <Plus className="w-4 h-4 text-green-400" />
                          ) : tx.type === 'Remove Liquidity' ? (
                            <Minus className="w-4 h-4 text-red-400" />
                          ) : (
                            <Gift className="w-4 h-4 text-purple-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{tx.type}</p>
                          <p className="text-slate-400 text-sm">{tx.pool}</p>
                          {tx.amount2 && (
                            <p className="text-slate-500 text-xs">
                              {formatTokens(tx.amount1)} {tx.token1} + {formatTokens(tx.amount2)} {tx.token2}
                            </p>
                          )}
                          {!tx.amount2 && (
                            <p className="text-slate-500 text-xs">
                              {formatTokens(tx.amount1)} {tx.token1}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-300">{new Date(tx.timestamp).toLocaleDateString()}</p>
                        <p className="text-slate-500 text-xs">{tx.txHash.slice(0, 10)}...</p>
                        <Badge className={getStatusColor(tx.status)} size="sm">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Liquidity Dialog */}
        <Dialog open={isAddLiquidityDialogOpen} onOpenChange={setIsAddLiquidityDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Add Liquidity</DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedPool && `Add liquidity to ${selectedPool.name} pool`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm font-medium">{selectedPool?.token0} Amount</label>
                <Input
                  type="number"
                  placeholder={`Enter ${selectedPool?.token0} amount`}
                  value={addLiquidityAmount1}
                  onChange={(e) => setAddLiquidityAmount1(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="flex justify-center">
                <Plus className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium">{selectedPool?.token1} Amount</label>
                <Input
                  type="number"
                  placeholder={`Enter ${selectedPool?.token1} amount`}
                  value={addLiquidityAmount2}
                  onChange={(e) => setAddLiquidityAmount2(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Slippage Tolerance:</span>
                  <span className="text-white">{slippageTolerance}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Transaction Deadline:</span>
                  <span className="text-white">{deadline} minutes</span>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddLiquidityDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => selectedPool && handleAddLiquidity(selectedPool.id, addLiquidityAmount1, addLiquidityAmount2)}
                  disabled={isLoading || !addLiquidityAmount1 || !addLiquidityAmount2}
                >
                  {isLoading ? 'Adding...' : 'Add Liquidity'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Remove Liquidity Dialog */}
        <Dialog open={isRemoveLiquidityDialogOpen} onOpenChange={setIsRemoveLiquidityDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Remove Liquidity</DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedPool && `Remove liquidity from ${selectedPool.name} pool`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm font-medium">LP Tokens to Remove</label>
                <Input
                  type="number"
                  placeholder="Enter LP token amount"
                  value={removeLiquidityAmount}
                  onChange={(e) => setRemoveLiquidityAmount(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                {selectedPool && (
                  <p className="text-slate-400 text-sm mt-1">
                    Available: {selectedPool.userLpTokens.toFixed(3)} LP tokens
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsRemoveLiquidityDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => selectedPool && handleRemoveLiquidity(selectedPool.id, removeLiquidityAmount)}
                  disabled={isLoading || !removeLiquidityAmount}
                >
                  {isLoading ? 'Removing...' : 'Remove Liquidity'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Claim Dialog */}
        <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Claim Rewards</DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedPool && `Claim pending rewards from ${selectedPool.name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedPool && (
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-400">{formatTokens(selectedPool.pendingRewards)}</p>
                    <p className="text-slate-400">CORE Rewards</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsClaimDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => selectedPool && handleClaimRewards(selectedPool.id)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Claiming...' : 'Claim Rewards'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}