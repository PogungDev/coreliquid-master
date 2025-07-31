"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Shield, Zap, Target, AlertTriangle, Settings, BarChart3, Layers, Bot, Lock, Separator, Droplets, RefreshCw, CheckCircle, Clock, Gauge } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { getTokenData } from "@/lib/token-data"
import { NeonCard } from "@/components/neon-card"
import { GlitchText } from "@/components/glitch-text"
import { CyberButton } from "@/components/cyber-button"

import { usePortfolio } from "@/contexts/portfolio-context"
import { useCoreFluidX } from "@/hooks/use-corefluidx"
import { useRealTimeData } from "@/hooks/useRealTimeData"
import { useConcentratedLiquidity } from "@/hooks/useConcentratedLiquidity"

export default function DashboardPage() {
  const { state } = usePortfolio()
  const {
    aprMetrics,
    revenueMetrics,
    automationStatus,
    riskMetrics,
    ulpData,
    performance,
    claimRevenue,
    emergencyStop,
    executeManualCompound,
    executeManualRebalance,
    pauseRebalancing,
    resumeRebalancing,
    getRebalancingData,
    loading,
    error
  } = useCoreFluidX()
  
  const { realTimeMetrics, isConnected: wsConnected } = useRealTimeData()
  const { 
    positionData, 
    concentratedLiquidityMetrics,
    updatePosition,
    optimizeRange 
  } = useConcentratedLiquidity()

  const [activeTab, setActiveTab] = useState("overview")
  const [rebalancingData, setRebalancingData] = useState<any>(null)
  const [autoRebalanceConfig, setAutoRebalanceConfig] = useState({
    enabled: true,
    priceBufferPercent: 5,
    narrowingFactor: 0.7,
    maxSlippage: 0.5,
    gasLimit: 500000
  })

  useEffect(() => {
    const loadRebalancingData = async () => {
      try {
        const data = await getRebalancingData()
        setRebalancingData(data)
      } catch (err) {
        console.error('Failed to load rebalancing data:', err)
      }
    }
    
    if (state.isWalletConnected) {
      loadRebalancingData()
    }
  }, [state.isWalletConnected, getRebalancingData])

  if (!state.isWalletConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <NeonCard className="max-w-md">
          <CardContent className="text-center p-8">
            <div className="text-6xl mb-4">🔒</div>
            <GlitchText text="WALLET_DISCONNECTED" className="text-xl font-bold text-cyan-400 mb-2" />
            <p className="text-gray-400 font-mono text-sm">Connect your wallet to access the dashboard</p>
          </CardContent>
        </NeonCard>
      </div>
    )
  }

  const deposits = state.positions.filter((p) => p.type === "deposit")
  const borrows = state.positions.filter((p) => p.type === "borrow")
  const vaults = state.positions.filter((p) => p.type === "vault")

  const getHealthFactorColor = (hf: number) => {
    if (hf >= 2) return "text-green-400"
    if (hf >= 1.5) return "text-yellow-400"
    return "text-red-400"
  }

  const getHealthFactorStatus = (hf: number) => {
    if (hf >= 2) return "SAFE"
    if (hf >= 1.5) return "MODERATE"
    return "AT_RISK"
  }

  const handleAutoRebalanceToggle = async () => {
    try {
      if (autoRebalanceConfig.enabled) {
        await pauseRebalancing()
      } else {
        await resumeRebalancing()
      }
      setAutoRebalanceConfig(prev => ({ ...prev, enabled: !prev.enabled }))
    } catch (err) {
      console.error('Failed to toggle auto-rebalancing:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <GlitchText text="COREFLUIDX_DASHBOARD" className="text-3xl font-bold text-cyan-400" />
        <p className="text-gray-400 font-mono">[UNIFIED_LIQUIDITY_MANAGEMENT_SYSTEM.EXE]</p>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <NeonCard>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 font-mono text-sm">TOTAL_VALUE</p>
                <p className="text-2xl font-bold text-white font-mono">{formatCurrency(realTimeMetrics?.totalValue || state.netWorthUSD)}</p>
                <p className="text-xs text-green-400 font-mono flex items-center gap-1">
                  {wsConnected && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                  {realTimeMetrics?.dailyReturn ? `${(realTimeMetrics.dailyReturn * 100).toFixed(2)}% today` : 'Loading...'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </NeonCard>

        <NeonCard>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 font-mono text-sm">CONCENTRATED_LIQUIDITY</p>
                <p className="text-2xl font-bold text-orange-400 font-mono">{formatCurrency(concentratedLiquidityMetrics?.totalValue || state.totalULPValueUSD)}</p>
                <p className="text-xs text-orange-400 font-mono">
                  {concentratedLiquidityMetrics?.currentAPR ? `${concentratedLiquidityMetrics.currentAPR.toFixed(2)}% APR` : 'Loading...'}
                </p>
              </div>
              <Target className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </NeonCard>

        <NeonCard>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 font-mono text-sm">AUTO_REBALANCE</p>
                <p className="text-2xl font-bold text-green-400 font-mono">
                  {autoRebalanceConfig.enabled ? 'ACTIVE' : 'PAUSED'}
                </p>
                <p className="text-xs text-green-400 font-mono">
                  {rebalancingData?.totalRebalances || 0} rebalances
                </p>
              </div>
              <Bot className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </NeonCard>

        <NeonCard>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 font-mono text-sm">EFFICIENCY_SCORE</p>
                <p className="text-2xl font-bold text-yellow-400 font-mono">
                  {concentratedLiquidityMetrics?.efficiency ? `${(concentratedLiquidityMetrics.efficiency * 100).toFixed(0)}%` : 'N/A'}
                </p>
                <p className="text-xs text-yellow-400 font-mono">
                  {concentratedLiquidityMetrics?.inRange ? 'IN_RANGE' : 'OUT_OF_RANGE'}
                </p>
              </div>
              <Gauge className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </NeonCard>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gray-900/50 border border-cyan-500/20">
          <TabsTrigger value="overview" className="font-mono data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <BarChart3 className="w-4 h-4 mr-2" />
            OVERVIEW
          </TabsTrigger>
          <TabsTrigger value="liquidity" className="font-mono data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
            <Layers className="w-4 h-4 mr-2" />
            LIQUIDITY
          </TabsTrigger>
          <TabsTrigger value="concentrated" className="font-mono data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Target className="w-4 h-4 mr-2" />
            CONCENTRATED
          </TabsTrigger>
          <TabsTrigger value="rebalancing" className="font-mono data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Bot className="w-4 h-4 mr-2" />
            AUTO-REBALANCE
          </TabsTrigger>
          <TabsTrigger value="analytics" className="font-mono data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <PieChart className="w-4 h-4 mr-2" />
            ANALYTICS
          </TabsTrigger>
          <TabsTrigger value="settings" className="font-mono data-[state=active]:bg-gray-500/20 data-[state=active]:text-gray-400">
            <Settings className="w-4 h-4 mr-2" />
            SETTINGS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NeonCard>
              <CardHeader>
                <CardTitle className="text-cyan-400 font-mono">PORTFOLIO_OVERVIEW</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Total Deposits:</span>
                    <span className="text-green-400 font-mono">{formatCurrency(state.totalDepositsUSD)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Total Borrows:</span>
                    <span className="text-red-400 font-mono">{formatCurrency(state.totalBorrowsUSD)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Net Worth:</span>
                    <span className="text-cyan-400 font-mono">{formatCurrency(state.netWorthUSD)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Health Factor:</span>
                    <span className={`font-mono ${getHealthFactorColor(state.healthFactor)}`}>
                      {state.healthFactor.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </NeonCard>

            <NeonCard>
              <CardHeader>
                <CardTitle className="text-cyan-400 font-mono">PERFORMANCE_METRICS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Daily Return:</span>
                    <span className="text-green-400 font-mono">
                      {performance?.dailyReturn ? `${(performance.dailyReturn * 100).toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Total Return:</span>
                    <span className="text-green-400 font-mono">
                      {performance?.totalReturn ? `${(performance.totalReturn * 100).toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Current APR:</span>
                    <span className="text-orange-400 font-mono">
                      {aprMetrics?.currentAPR ? `${aprMetrics.currentAPR.toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </NeonCard>
          </div>
        </TabsContent>

        <TabsContent value="liquidity" className="space-y-6">
          <NeonCard>
            <CardHeader>
              <CardTitle className="text-cyan-400 font-mono">UNIFIED_LIQUIDITY_POOL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono">Total Value:</span>
                  <span className="text-cyan-400 font-mono">{formatCurrency(state.totalULPValueUSD)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono">Your Share:</span>
                  <span className="text-white font-mono">
                    {ulpData?.userShare ? `${(ulpData.userShare * 100).toFixed(2)}%` : '0.00%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono">Current APR:</span>
                  <span className="text-green-400 font-mono">
                    {aprMetrics?.currentAPR ? `${aprMetrics.currentAPR.toFixed(2)}%` : 'Loading...'}
                  </span>
                </div>
              </div>
            </CardContent>
          </NeonCard>
        </TabsContent>

        <TabsContent value="concentrated" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NeonCard>
              <CardHeader>
                <CardTitle className="text-blue-400 font-mono">CONCENTRATED_LIQUIDITY_POSITIONS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Total Value:</span>
                    <span className="text-blue-400 font-mono">{formatCurrency(concentratedLiquidityMetrics?.totalValue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Current APR:</span>
                    <span className="text-green-400 font-mono">
                      {concentratedLiquidityMetrics?.currentAPR ? `${concentratedLiquidityMetrics.currentAPR.toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Efficiency:</span>
                    <span className="text-yellow-400 font-mono">
                      {concentratedLiquidityMetrics?.efficiency ? `${(concentratedLiquidityMetrics.efficiency * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Range Status:</span>
                    <Badge variant={concentratedLiquidityMetrics?.inRange ? "default" : "destructive"}>
                      {concentratedLiquidityMetrics?.inRange ? 'IN_RANGE' : 'OUT_OF_RANGE'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <CyberButton onClick={updatePosition} disabled={loading} className="w-full">
                    Update Position
                  </CyberButton>
                  <CyberButton onClick={optimizeRange} disabled={loading} className="w-full">
                    Optimize Range
                  </CyberButton>
                </div>
              </CardContent>
            </NeonCard>

            <NeonCard>
              <CardHeader>
                <CardTitle className="text-blue-400 font-mono">REAL_TIME_MONITORING</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  <span className="text-gray-400 font-mono text-sm">
                    {wsConnected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Live Price:</span>
                    <span className="text-white font-mono">
                      {realTimeMetrics?.currentPrice ? `$${realTimeMetrics.currentPrice.toFixed(4)}` : 'Loading...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">24h Change:</span>
                    <span className={`font-mono ${realTimeMetrics?.priceChange24h && realTimeMetrics.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {realTimeMetrics?.priceChange24h ? `${(realTimeMetrics.priceChange24h * 100).toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Volume 24h:</span>
                    <span className="text-cyan-400 font-mono">
                      {realTimeMetrics?.volume24h ? formatCurrency(realTimeMetrics.volume24h) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Fees Earned:</span>
                    <span className="text-green-400 font-mono">
                      {realTimeMetrics?.feesEarned ? formatCurrency(realTimeMetrics.feesEarned) : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </NeonCard>
          </div>
        </TabsContent>

        <TabsContent value="rebalancing" className="space-y-6">
          <NeonCard>
            <CardHeader>
              <CardTitle className="text-cyan-400 font-mono">AUTO_REBALANCING</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-mono">Status:</span>
                <Badge variant={autoRebalanceConfig.enabled ? "default" : "secondary"}>
                  {autoRebalanceConfig.enabled ? 'ACTIVE' : 'PAUSED'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-mono">Total Rebalances:</span>
                <span className="text-cyan-400 font-mono">{rebalancingData?.totalRebalances || 0}</span>
              </div>
              <Button onClick={handleAutoRebalanceToggle} className="w-full">
                {autoRebalanceConfig.enabled ? 'Pause' : 'Resume'} Auto-Rebalancing
              </Button>
            </CardContent>
          </NeonCard>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <NeonCard>
            <CardHeader>
              <CardTitle className="text-cyan-400 font-mono">ANALYTICS_OVERVIEW</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono">Risk Score:</span>
                  <span className="text-yellow-400 font-mono">
                    {riskMetrics?.riskScore ? `${riskMetrics.riskScore}/100` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono">Sharpe Ratio:</span>
                  <span className="text-cyan-400 font-mono">
                    {riskMetrics?.sharpeRatio ? riskMetrics.sharpeRatio.toFixed(2) : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </NeonCard>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <NeonCard>
            <CardHeader>
              <CardTitle className="text-cyan-400 font-mono">SYSTEM_SETTINGS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button onClick={executeManualRebalance} disabled={loading} className="w-full">
                  Manual Rebalance
                </Button>
                <Button onClick={executeManualCompound} disabled={loading} className="w-full">
                  Manual Compound
                </Button>
                <Button onClick={emergencyStop} disabled={loading} variant="destructive" className="w-full">
                  Emergency Stop
                </Button>
              </div>
            </CardContent>
          </NeonCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
