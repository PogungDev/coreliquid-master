"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, AlertTriangle, TrendingDown, TrendingUp, Activity, Info } from "lucide-react"
import { usePortfolio } from "@/contexts/portfolio-context"
import { formatCurrency, getTokenData } from "@/lib/token-data"

export default function RiskPage() {
  const { state } = usePortfolio()
  const [simulationCollateral, setSimulationCollateral] = useState([state.totalDepositsUSD])
  const [simulationDebt, setSimulationDebt] = useState([state.totalBorrowsUSD])

  const riskMetrics = {
    sharpeRatio: 1.85,
    maxDrawdown: 12.3,
    volatilityIndex: 18.7,
    consistencyScore: 87.2,
    liquidityRisk: 'Low',
    overallRiskScore: 32, // Out of 100
    riskLevel: 'Conservative',
    correlationMatrix: [
      { pair: 'ETH-USDC', correlation: 0.15, risk: 'Low' },
      { pair: 'BTC-ETH', correlation: 0.72, risk: 'Medium' },
      { pair: 'USDC-DAI', correlation: 0.98, risk: 'High' },
      { pair: 'BTC-USDC', correlation: 0.08, risk: 'Low' }
    ],
    riskFactors: [
      { factor: 'Market Volatility', impact: 'Medium', score: 65, trend: 'stable' },
      { factor: 'Liquidity Risk', impact: 'Low', score: 25, trend: 'improving' },
      { factor: 'Smart Contract Risk', impact: 'Low', score: 15, trend: 'stable' },
      { factor: 'Impermanent Loss', impact: 'Medium', score: 45, trend: 'decreasing' },
      { factor: 'Slippage Risk', impact: 'Low', score: 20, trend: 'stable' },
      { factor: 'Rebalancing Risk', impact: 'Low', score: 18, trend: 'improving' }
    ],
    protectionMechanisms: [
      { name: 'Slippage Protection', status: 'Active', effectiveness: 95 },
      { name: 'Emergency Pause', status: 'Ready', effectiveness: 100 },
      { name: 'Dynamic Rebalancing', status: 'Active', effectiveness: 88 },
      { name: 'Liquidity Monitoring', status: 'Active', effectiveness: 92 }
    ]
  }

  // Calculate simulated health factor
  const simulatedHealthFactor = simulationDebt[0] > 0 ? (simulationCollateral[0] * 0.8) / simulationDebt[0] : 0

  // Risk level based on health factor
  const getRiskLevel = (healthFactor: number) => {
    if (healthFactor >= 2.0) return { level: "Very Safe", color: "text-green-400", bgColor: "bg-green-500/20" }
    if (healthFactor >= 1.5) return { level: "Safe", color: "text-green-400", bgColor: "bg-green-500/20" }
    if (healthFactor >= 1.2) return { level: "Moderate", color: "text-yellow-400", bgColor: "bg-yellow-500/20" }
    if (healthFactor >= 1.0) return { level: "High Risk", color: "text-orange-400", bgColor: "bg-orange-500/20" }
    return { level: "Liquidation Risk", color: "text-red-400", bgColor: "bg-red-500/20" }
  }

  const currentRisk = getRiskLevel(state.healthFactor)
  const simulatedRisk = getRiskLevel(simulatedHealthFactor)

  // Calculate liquidation price for major positions
  const getLiquidationData = () => {
    const collateralPositions = state.positions.filter((pos) => pos.type === "deposit" && pos.isCollateral)
    const borrowPositions = state.positions.filter((pos) => pos.type === "borrow")

    return collateralPositions.map((collateral) => {
      const totalBorrowValue = borrowPositions.reduce((sum, borrow) => sum + borrow.valueUSD, 0)
      const liquidationThreshold = 0.8 // 80%
      const currentPrice = getTokenData(collateral.token).price
      const liquidationPrice = totalBorrowValue > 0 ? totalBorrowValue / (collateral.amount * liquidationThreshold) : 0

      return {
        token: collateral.token,
        currentPrice,
        liquidationPrice,
        priceDropToLiquidation: liquidationPrice > 0 ? ((currentPrice - liquidationPrice) / currentPrice) * 100 : 0,
      }
    })
  }

  const liquidationData = getLiquidationData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 font-mono">RISK MANAGEMENT</h1>
        <p className="text-gray-400 font-mono">Monitor and simulate your portfolio risk</p>
      </div>

      {/* Current Risk Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1E1E1E] border-[#2A2A2A]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center font-mono">
              <Shield className="w-5 h-5 mr-2 text-cyan-400" />
              Health Factor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-white font-mono">
                  {state.healthFactor > 0 ? state.healthFactor.toFixed(2) : "N/A"}
                </span>
                <Badge className={`${currentRisk.bgColor} ${currentRisk.color} border-0 font-mono`}>
                  {currentRisk.level}
                </Badge>
              </div>
              {state.healthFactor > 0 && <Progress value={Math.min(state.healthFactor * 20, 100)} className="h-2" />}
              <p className="text-sm text-gray-400 font-mono">
                {state.healthFactor >= 1.5
                  ? "Your position is safe from liquidation"
                  : state.healthFactor >= 1.2
                    ? "Monitor your position closely"
                    : state.healthFactor > 0
                      ? "High risk of liquidation"
                      : "No active loans"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1E1E1E] border-[#2A2A2A]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center font-mono">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Collateral Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <span className="text-3xl font-bold text-white font-mono">{formatCurrency(state.totalDepositsUSD)}</span>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-mono">Available:</span>
                  <span className="text-white font-mono">
                    {formatCurrency(
                      state.totalDepositsUSD -
                        state.positions
                          .filter((pos) => pos.type === "deposit" && pos.isCollateral)
                          .reduce((sum, pos) => sum + pos.valueUSD, 0),
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-mono">Locked:</span>
                  <span className="text-yellow-400 font-mono">
                    {formatCurrency(
                      state.positions
                        .filter((pos) => pos.type === "deposit" && pos.isCollateral)
                        .reduce((sum, pos) => sum + pos.valueUSD, 0),
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1E1E1E] border-[#2A2A2A]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center font-mono">
              <TrendingDown className="w-5 h-5 mr-2 text-red-400" />
              Total Debt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <span className="text-3xl font-bold text-white font-mono">{formatCurrency(state.totalBorrowsUSD)}</span>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-mono">Utilization:</span>
                  <span className="text-white font-mono">
                    {state.totalDepositsUSD > 0
                      ? ((state.totalBorrowsUSD / (state.totalDepositsUSD * 0.8)) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    state.totalDepositsUSD > 0
                      ? Math.min((state.totalBorrowsUSD / (state.totalDepositsUSD * 0.8)) * 100, 100)
                      : 0
                  }
                  className="h-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Simulation */}
        <Card className="bg-[#1E1E1E] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white flex items-center font-mono">
              <Activity className="w-5 h-5 mr-2 text-purple-400" />
              Risk Simulation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-blue-500/10 border-blue-500/20">
              <Info className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-400 font-mono text-sm">
                These sliders are for simulation only. Adjust values to see how changes would affect your health factor.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono">Collateral Value</span>
                  <span className="text-white font-mono">{formatCurrency(simulationCollateral[0])}</span>
                </div>
                <Slider
                  value={simulationCollateral}
                  onValueChange={setSimulationCollateral}
                  max={state.totalDepositsUSD * 2}
                  min={0}
                  step={100}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono">Debt Value</span>
                  <span className="text-white font-mono">{formatCurrency(simulationDebt[0])}</span>
                </div>
                <Slider
                  value={simulationDebt}
                  onValueChange={setSimulationDebt}
                  max={state.totalBorrowsUSD * 2}
                  min={0}
                  step={100}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-mono">Simulated Health Factor</span>
                <Badge className={`${simulatedRisk.bgColor} ${simulatedRisk.color} border-0 font-mono`}>
                  {simulatedRisk.level}
                </Badge>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-white font-mono">
                  {simulatedHealthFactor > 0 ? simulatedHealthFactor.toFixed(2) : "N/A"}
                </span>
                {simulatedHealthFactor !== state.healthFactor && (
                  <div
                    className={`flex items-center space-x-1 ${
                      simulatedHealthFactor > state.healthFactor ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {simulatedHealthFactor > state.healthFactor ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-sm font-mono">
                      {simulatedHealthFactor > state.healthFactor ? "+" : ""}
                      {(simulatedHealthFactor - state.healthFactor).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              {simulatedHealthFactor > 0 && (
                <Progress value={Math.min(simulatedHealthFactor * 20, 100)} className="h-2" />
              )}
            </div>

            <Button
              onClick={() => {
                setSimulationCollateral([state.totalDepositsUSD])
                setSimulationDebt([state.totalBorrowsUSD])
              }}
              variant="outline"
              className="w-full bg-[#2A2A2A] border-[#3A3A3A] text-white hover:bg-[#3A3A3A] font-mono"
            >
              Reset to Current Values
            </Button>
          </CardContent>
        </Card>

        {/* Liquidation Analysis */}
        <Card className="bg-[#1E1E1E] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white flex items-center font-mono">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
              Liquidation Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {liquidationData.length > 0 ? (
              <>
                {liquidationData.map((data, index) => (
                  <div key={index} className="space-y-3 p-4 rounded-lg bg-[#2A2A2A]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTokenData(data.token).icon}</span>
                        <span className="text-white font-mono">{data.token}</span>
                      </div>
                      <Badge variant="outline" className="border-orange-500 text-orange-500 font-mono">
                        COLLATERAL
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 font-mono">Current Price</p>
                        <p className="text-white font-mono">{formatCurrency(data.currentPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-mono">Liquidation Price</p>
                        <p className="text-red-400 font-mono">
                          {data.liquidationPrice > 0 ? formatCurrency(data.liquidationPrice) : "N/A"}
                        </p>
                      </div>
                    </div>

                    {data.priceDropToLiquidation > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-mono text-sm">Price drop to liquidation</span>
                          <span
                            className={`font-mono text-sm ${
                              data.priceDropToLiquidation > 50
                                ? "text-green-400"
                                : data.priceDropToLiquidation > 25
                                  ? "text-yellow-400"
                                  : "text-red-400"
                            }`}
                          >
                            -{data.priceDropToLiquidation.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={Math.min(data.priceDropToLiquidation, 100)} className="h-1" />
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 font-mono">No collateral positions</p>
                <p className="text-gray-500 text-sm font-mono mt-1">Add collateral to see liquidation analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overall Risk Score */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <Shield className="h-5 w-5" />
            Overall Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">{riskMetrics.overallRiskScore}/100</div>
              <p className="text-purple-300">Risk Score</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">{riskMetrics.riskLevel}</div>
              <p className="text-green-300">Risk Level</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">{riskMetrics.liquidityRisk}</div>
              <p className="text-blue-300">Liquidity Risk</p>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={riskMetrics.overallRiskScore} className="h-3" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Low Risk</span>
              <span>High Risk</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Protection Mechanisms */}
      <Card className="bg-[#1E1E1E] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white font-mono text-cyan-400">Protection Mechanisms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskMetrics.protectionMechanisms.map((mechanism, index) => (
              <div key={index} className="p-4 rounded-lg bg-[#2A2A2A] border border-[#3A3A3A]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-mono font-semibold">{mechanism.name}</h3>
                  <Badge 
                    className={`font-mono ${
                      mechanism.status === 'Active' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}
                  >
                    {mechanism.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-mono">Effectiveness</span>
                    <span className="text-white font-mono">{mechanism.effectiveness}%</span>
                  </div>
                  <Progress value={mechanism.effectiveness} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card className="bg-[#1E1E1E] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white font-mono text-cyan-400">Risk Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskMetrics.riskFactors.map((factor, index) => (
              <div key={index} className="p-4 rounded-lg bg-[#2A2A2A] border border-[#3A3A3A]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-white font-mono font-semibold">{factor.factor}</h3>
                    <Badge 
                      className={`font-mono ${
                        factor.impact === 'Low' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : factor.impact === 'Medium'
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}
                    >
                      {factor.impact} Impact
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {factor.trend === 'improving' && <TrendingDown className="w-4 h-4 text-green-400" />}
                    {factor.trend === 'decreasing' && <TrendingDown className="w-4 h-4 text-green-400" />}
                    {factor.trend === 'stable' && <Activity className="w-4 h-4 text-gray-400" />}
                    <span className="text-sm text-gray-400 font-mono capitalize">{factor.trend}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-mono">Risk Score</span>
                    <span className="text-white font-mono">{factor.score}/100</span>
                  </div>
                  <Progress value={factor.score} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <Card className="bg-[#1E1E1E] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white font-mono text-cyan-400">Risk Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#2A2A2A]">
              <TabsTrigger value="overview" className="font-mono">
                OVERVIEW
              </TabsTrigger>
              <TabsTrigger value="positions" className="font-mono">
                POSITIONS
              </TabsTrigger>
              <TabsTrigger value="history" className="font-mono">
                HISTORY
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-gray-400 font-mono text-sm">Loan-to-Value</p>
                  <p className="text-white font-mono text-lg">
                    {state.totalDepositsUSD > 0
                      ? ((state.totalBorrowsUSD / state.totalDepositsUSD) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400 font-mono text-sm">Liquidation Threshold</p>
                  <p className="text-white font-mono text-lg">80.0%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400 font-mono text-sm">Available to Borrow</p>
                  <p className="text-white font-mono text-lg">
                    {formatCurrency(Math.max(0, state.totalDepositsUSD * 0.8 - state.totalBorrowsUSD))}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400 font-mono text-sm">Net APY</p>
                  <p className="text-green-400 font-mono text-lg">+2.3%</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="positions" className="space-y-4">
              <div className="space-y-3">
                {state.positions
                  .filter((pos) => pos.type === "deposit" || pos.type === "borrow")
                  .map((position) => (
                    <div key={position.id} className="flex items-center justify-between p-3 rounded-lg bg-[#2A2A2A]">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            position.type === "deposit"
                              ? "bg-gradient-to-r from-blue-500 to-purple-600"
                              : "bg-gradient-to-r from-red-500 to-orange-600"
                          }`}
                        >
                          <span className="text-sm font-bold">{getTokenData(position.token).icon}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium font-mono">
                            {position.token} {position.type === "deposit" ? "Deposit" : "Loan"}
                          </p>
                          <p className="text-sm text-gray-400 font-mono">
                            {position.amount.toFixed(6)} {position.token}
                            {position.apy && ` @ ${position.apy.toFixed(1)}% APY`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={`font-mono mb-1 ${
                            position.type === "deposit"
                              ? position.isCollateral
                                ? "border-yellow-500 text-yellow-500"
                                : "border-blue-500 text-blue-500"
                              : "border-red-500 text-red-500"
                          }`}
                        >
                          {position.type === "deposit"
                            ? position.isCollateral
                              ? "COLLATERAL"
                              : "DEPOSIT"
                            : "BORROWED"}
                        </Badge>
                        <p className="text-sm text-gray-400 font-mono">{formatCurrency(position.valueUSD)}</p>
                      </div>
                    </div>
                  ))}

                {state.positions.filter((pos) => pos.type === "deposit" || pos.type === "borrow").length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 font-mono">No active positions</p>
                    <p className="text-gray-500 text-sm font-mono mt-1">Your positions will appear here</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 font-mono">Risk history coming soon</p>
                <p className="text-gray-500 text-sm font-mono mt-1">Track your risk metrics over time</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
