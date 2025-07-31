"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  RefreshCw, 
  Activity, 
  Pause, 
  Play, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Shield,
  Zap
} from "lucide-react"
import { useCoreFluidX } from "@/hooks/use-corefluidx"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { NeonCard } from "@/components/neon-card"

export default function RebalancingPage() {
  const {
    executeManualRebalance,
    pauseRebalancing,
    resumeRebalancing,
    getRebalancingData,
    isLoading
  } = useCoreFluidX()

  const [rebalancingData, setRebalancingData] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      const data = await getRebalancingData()
      setRebalancingData(data)
    } catch (error) {
      console.error('Failed to refresh rebalancing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 border-green-500/30'
      case 'pending': return 'text-yellow-400 border-yellow-500/30'
      case 'failed': return 'text-red-400 border-red-500/30'
      default: return 'text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'failed': return <AlertTriangle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  if (isLoading || !rebalancingData) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Rebalancing Center
          </h1>
        </div>
        <div className="grid gap-6">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
                <span className="ml-2 text-gray-400">Loading rebalancing data...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Rebalancing Center
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={refreshData}
            disabled={isRefreshing}
            variant="outline"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <NeonCard className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-300">Rebalancing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {rebalancingData.isRebalancing ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-400" />
                  <span className="text-blue-400 font-semibold">Active</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 font-semibold">Idle</span>
                </>
              )}
            </div>
          </CardContent>
        </NeonCard>

        <NeonCard className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-300">Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-400" />
              <span className="text-purple-400 font-semibold">{rebalancingData.strategy}</span>
            </div>
          </CardContent>
        </NeonCard>

        <NeonCard className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-300">Total Rebalances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-semibold text-xl">{rebalancingData.totalRebalances}</span>
            </div>
          </CardContent>
        </NeonCard>

        <NeonCard className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-300">Emergency Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {rebalancingData.emergencyPaused ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <span className="text-red-400 font-semibold">Paused</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 font-semibold">Normal</span>
                </>
              )}
            </div>
          </CardContent>
        </NeonCard>
      </div>

      {/* Controls */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-300">
            <Zap className="h-5 w-5" />
            Rebalancing Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={executeManualRebalance}
              disabled={isLoading || rebalancingData.isRebalancing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Execute Manual Rebalance
            </Button>
            
            {rebalancingData.emergencyPaused ? (
              <Button
                onClick={resumeRebalancing}
                disabled={isLoading}
                variant="outline"
                className="border-green-500 text-green-400 hover:bg-green-500/10"
              >
                <Play className="h-4 w-4 mr-2" />
                Resume Rebalancing
              </Button>
            ) : (
              <Button
                onClick={pauseRebalancing}
                disabled={isLoading}
                variant="outline"
                className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause Rebalancing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Actions */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-300">
            <Activity className="h-5 w-5" />
            Current Rebalancing Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rebalancingData.currentActions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active rebalancing actions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rebalancingData.currentActions.map((action: any, index: number) => (
                <div key={index} className="border border-gray-700 rounded-lg p-4 bg-gray-800/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-blue-400">{action.tokenFrom}</span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span className="font-mono text-green-400">{action.tokenTo}</span>
                      </div>
                      <Badge variant="outline" className={getStatusColor(action.status)}>
                        {getStatusIcon(action.status)}
                        <span className="ml-1">{action.status.toUpperCase()}</span>
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Risk Score</p>
                      <p className="font-semibold text-yellow-400">{action.riskScore}%</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Amount</p>
                      <p className="font-mono text-white">{formatCurrency(action.amount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Expected Return</p>
                      <p className="font-mono text-green-400">{formatCurrency(action.expectedReturn)}</p>
                    </div>
                  </div>
                  
                  {action.status === 'pending' && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>Processing...</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slippage Protection */}
      <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-300">
            <Shield className="h-5 w-5" />
            Slippage Protection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-400">Protection Status</p>
              <div className="flex items-center gap-2 mt-1">
                {rebalancingData.slippageProtection.enabled ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-semibold">Enabled</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-red-400 font-semibold">Disabled</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400">Max Slippage</p>
              <p className="text-lg font-semibold text-orange-400">
                {formatPercentage(rebalancingData.slippageProtection.maxSlippage)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Times Triggered</p>
              <p className="text-lg font-semibold text-yellow-400">
                {rebalancingData.slippageProtection.triggeredCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Information */}
      <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-300">
            <Clock className="h-5 w-5" />
            Rebalancing Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-400">Frequency</p>
              <p className="text-lg font-semibold text-indigo-400">{rebalancingData.frequency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Last Rebalance</p>
              <p className="text-sm text-gray-300">
                {new Date(rebalancingData.lastRebalance).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Next Rebalance</p>
              <p className="text-sm text-gray-300">
                {new Date(rebalancingData.nextRebalance).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}