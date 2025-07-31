"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Shield, AlertTriangle, DollarSign, Lock, Unlock } from "lucide-react"
import { usePortfolio } from "@/contexts/portfolio-context"
import { useToast } from "@/hooks/use-toast"
import { tokens, getTokenData, formatCurrency } from "@/lib/token-data"

export default function BorrowPage() {
  const { state, dispatch } = usePortfolio()
  const { toast } = useToast()
  const [collateralToken, setCollateralToken] = useState("")
  const [collateralAmount, setCollateralAmount] = useState("")
  const [borrowToken, setBorrowToken] = useState("")
  const [borrowAmount, setBorrowAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Get available tokens for collateral (only tokens user has deposits for)
  const availableCollateralTokens = Object.entries(tokens)
    .filter(([symbol]) => {
      const balance = state.balances[symbol]
      return balance && balance.available > 0
    })
    .map(([symbol, data]) => ({
      symbol,
      name: data.name,
      availableBalance: state.balances[symbol]?.available || 0,
      totalBalance: state.balances[symbol]?.total || 0,
      collateralizedBalance: state.balances[symbol]?.collateralized || 0,
      icon: data.icon,
      price: data.price,
    }))

  // All tokens available for borrowing
  const borrowableTokens = Object.entries(tokens).map(([symbol, data]) => ({
    symbol,
    name: data.name,
    icon: data.icon,
    price: data.price,
    apy: 5.2 + Math.random() * 3, // Mock APY
  }))

  const calculateMaxBorrow = () => {
    if (!collateralToken || !collateralAmount) return 0
    const collateralValue = Number.parseFloat(collateralAmount) * getTokenData(collateralToken).price
    return collateralValue * 0.8 // 80% LTV
  }

  const calculateHealthFactor = () => {
    if (!collateralAmount || !borrowAmount || !collateralToken || !borrowToken) return 0
    const collateralValue = Number.parseFloat(collateralAmount) * getTokenData(collateralToken).price
    const borrowValue = Number.parseFloat(borrowAmount) * getTokenData(borrowToken).price
    return borrowValue > 0 ? (collateralValue * 0.8) / borrowValue : 0
  }

  const maxBorrowUSD = calculateMaxBorrow()
  const healthFactor = calculateHealthFactor()
  const selectedCollateralToken = availableCollateralTokens.find((t) => t.symbol === collateralToken)

  const handleBorrow = async () => {
    if (!state.isWalletConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to borrow assets.",
        variant: "destructive",
      })
      return
    }

    if (!collateralToken || !collateralAmount || !borrowToken || !borrowAmount) {
      toast({
        title: "Invalid Borrow",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const collateralAmountNum = Number.parseFloat(collateralAmount)
    const borrowAmountNum = Number.parseFloat(borrowAmount)
    const availableForCollateral = selectedCollateralToken?.availableBalance || 0

    if (collateralAmountNum <= 0 || borrowAmountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter valid amounts.",
        variant: "destructive",
      })
      return
    }

    if (collateralAmountNum > availableForCollateral) {
      toast({
        title: "Insufficient Collateral",
        description: `You only have ${availableForCollateral.toFixed(6)} ${collateralToken} available for collateral.`,
        variant: "destructive",
      })
      return
    }

    const borrowValueUSD = borrowAmountNum * getTokenData(borrowToken).price
    if (borrowValueUSD > maxBorrowUSD) {
      toast({
        title: "Borrow Amount Too High",
        description: `Maximum borrow amount is ${formatCurrency(maxBorrowUSD)} based on your collateral.`,
        variant: "destructive",
      })
      return
    }

    if (healthFactor < 1.2) {
      toast({
        title: "Health Factor Too Low",
        description: "Your health factor would be too low. Reduce borrow amount or increase collateral.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const collateralTokenData = getTokenData(collateralToken)
      const borrowTokenData = getTokenData(borrowToken)
      const collateralValueUSD = collateralAmountNum * collateralTokenData.price
      const borrowValueUSD = borrowAmountNum * borrowTokenData.price

      // First, update existing deposit to mark as collateral or create new collateral position
      const existingDeposit = state.positions.find(
        (pos) => pos.type === "deposit" && pos.token === collateralToken && !pos.isCollateral,
      )

      if (existingDeposit && existingDeposit.amount >= collateralAmountNum) {
        // If we have enough in existing deposit, split it
        if (existingDeposit.amount === collateralAmountNum) {
          // Mark entire deposit as collateral
          dispatch({
            type: "UPDATE_POSITION",
            payload: {
              id: existingDeposit.id,
              updates: { isCollateral: true },
            },
          })
        } else {
          // Split the position: reduce existing and create new collateral position
          dispatch({
            type: "UPDATE_POSITION",
            payload: {
              id: existingDeposit.id,
              updates: {
                amount: existingDeposit.amount - collateralAmountNum,
                valueUSD: (existingDeposit.amount - collateralAmountNum) * collateralTokenData.price,
              },
            },
          })

          // Create new collateral position
          const collateralPosition = {
            id: `collateral-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: "deposit" as const,
            token: collateralToken,
            amount: collateralAmountNum,
            valueUSD: collateralValueUSD,
            apy: 3.5,
            timestamp: Date.now(),
            isCollateral: true,
          }

          dispatch({ type: "ADD_POSITION", payload: collateralPosition })
        }
      } else {
        // Create new collateral position (shouldn't happen with proper validation)
        const collateralPosition = {
          id: `collateral-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "deposit" as const,
          token: collateralToken,
          amount: collateralAmountNum,
          valueUSD: collateralValueUSD,
          apy: 3.5,
          timestamp: Date.now(),
          isCollateral: true,
        }

        dispatch({ type: "ADD_POSITION", payload: collateralPosition })
      }

      // Add borrow position
      const borrowPosition = {
        id: `borrow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "borrow" as const,
        token: borrowToken,
        amount: borrowAmountNum,
        valueUSD: borrowValueUSD,
        apy: borrowableTokens.find((t) => t.symbol === borrowToken)?.apy || 5.2,
        timestamp: Date.now(),
      }

      dispatch({ type: "ADD_POSITION", payload: borrowPosition })

      toast({
        title: "Borrow Successful",
        description: `Successfully borrowed ${borrowAmount} ${borrowToken} using ${collateralAmount} ${collateralToken} as collateral.`,
        variant: "default",
      })

      // Reset form
      setCollateralAmount("")
      setBorrowAmount("")
    } catch (error) {
      toast({
        title: "Borrow Failed",
        description: "Failed to process borrow. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 font-mono">BORROW</h1>
        <p className="text-gray-400 font-mono">Leverage your assets with overcollateralized loans</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Borrow Interface */}
        <Card className="bg-[#1E1E1E] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white flex items-center font-mono">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Create Loan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="borrow" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#2A2A2A]">
                <TabsTrigger value="borrow" className="font-mono">
                  BORROW
                </TabsTrigger>
                <TabsTrigger value="repay" className="font-mono">
                  REPAY
                </TabsTrigger>
              </TabsList>

              <TabsContent value="borrow" className="space-y-4">
                {/* Collateral Section */}
                <div className="space-y-3">
                  <Label className="text-gray-400 font-mono">Collateral</Label>
                  <div className="flex space-x-2">
                    <Select value={collateralToken} onValueChange={setCollateralToken}>
                      <SelectTrigger className="w-32 bg-[#2A2A2A] border-[#3A3A3A] text-white font-mono">
                        <SelectValue placeholder="Token" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                        {availableCollateralTokens.map((token) => (
                          <SelectItem
                            key={token.symbol}
                            value={token.symbol}
                            className="text-white hover:bg-[#3A3A3A] font-mono"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{token.icon}</span>
                              <span>{token.symbol}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={collateralAmount}
                      onChange={(e) => setCollateralAmount(e.target.value)}
                      className="flex-1 bg-[#2A2A2A] border-[#3A3A3A] text-white font-mono"
                    />
                  </div>
                  {collateralToken && selectedCollateralToken && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400 font-mono">
                          Available: {selectedCollateralToken.availableBalance.toFixed(6)} {collateralToken}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCollateralAmount(selectedCollateralToken.availableBalance.toString())}
                          className="text-xs text-cyan-400 hover:text-cyan-300 h-auto p-1 font-mono"
                        >
                          MAX
                        </Button>
                      </div>
                      {selectedCollateralToken.collateralizedBalance > 0 && (
                        <div className="flex items-center space-x-1">
                          <Lock className="w-3 h-3 text-yellow-400" />
                          <p className="text-xs text-yellow-400 font-mono">
                            {selectedCollateralToken.collateralizedBalance.toFixed(6)} {collateralToken} already used as
                            collateral
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Borrow Section */}
                <div className="space-y-3">
                  <Label className="text-gray-400 font-mono">Borrow</Label>
                  <div className="flex space-x-2">
                    <Select value={borrowToken} onValueChange={setBorrowToken}>
                      <SelectTrigger className="w-32 bg-[#2A2A2A] border-[#3A3A3A] text-white font-mono">
                        <SelectValue placeholder="Token" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                        {borrowableTokens.map((token) => (
                          <SelectItem
                            key={token.symbol}
                            value={token.symbol}
                            className="text-white hover:bg-[#3A3A3A] font-mono"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{token.icon}</span>
                                <span>{token.symbol}</span>
                              </div>
                              <span className="text-green-400 text-xs">{token.apy.toFixed(1)}% APY</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      className="flex-1 bg-[#2A2A2A] border-[#3A3A3A] text-white font-mono"
                    />
                  </div>
                  {borrowToken && maxBorrowUSD > 0 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400 font-mono">Max borrow: {formatCurrency(maxBorrowUSD)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (borrowToken) {
                            const maxTokens = maxBorrowUSD / getTokenData(borrowToken).price
                            setBorrowAmount((maxTokens * 0.9).toFixed(6)) // 90% of max for safety
                          }
                        }}
                        className="text-xs text-cyan-400 hover:text-cyan-300 h-auto p-1 font-mono"
                      >
                        SAFE MAX
                      </Button>
                    </div>
                  )}
                </div>

                {/* Health Factor Preview */}
                {collateralAmount && borrowAmount && collateralToken && borrowToken && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-400 font-mono">Health Factor</Label>
                      <span
                        className={`font-mono ${healthFactor >= 1.5 ? "text-green-400" : healthFactor >= 1.2 ? "text-yellow-400" : "text-red-400"}`}
                      >
                        {healthFactor.toFixed(2)}
                      </span>
                    </div>
                    <Progress value={Math.min(healthFactor * 20, 100)} className="h-2" />
                    <p className="text-xs text-gray-400 font-mono">
                      {healthFactor >= 1.5
                        ? "Safe"
                        : healthFactor >= 1.2
                          ? "Moderate Risk"
                          : "High Risk - Liquidation possible"}
                    </p>
                  </div>
                )}

                <Button
                  className={`w-full font-mono ${
                    !state.isWalletConnected ||
                    !collateralToken ||
                    !borrowToken ||
                    !collateralAmount ||
                    !borrowAmount ||
                    isProcessing ||
                    healthFactor < 1.2
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white`}
                  disabled={
                    !state.isWalletConnected ||
                    !collateralToken ||
                    !borrowToken ||
                    !collateralAmount ||
                    !borrowAmount ||
                    isProcessing ||
                    healthFactor < 1.2 ||
                    Number.parseFloat(collateralAmount) > (selectedCollateralToken?.availableBalance || 0)
                  }
                  onClick={handleBorrow}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {isProcessing
                    ? "PROCESSING..."
                    : !state.isWalletConnected
                      ? "CONNECT_WALLET"
                      : healthFactor < 1.2
                        ? "HEALTH_FACTOR_TOO_LOW"
                        : "CREATE_LOAN"}
                </Button>
              </TabsContent>

              <TabsContent value="repay" className="space-y-4">
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 font-mono">Repay functionality coming soon</p>
                  <p className="text-gray-500 text-sm font-mono mt-1">Manage your existing loans</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Loan Overview */}
        <Card className="bg-[#1E1E1E] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white font-mono text-cyan-400">Loan Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-400 font-mono">Total Collateral</Label>
                <p className="text-2xl font-bold text-white font-mono">{formatCurrency(state.totalDepositsUSD)}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400 font-mono">Total Borrowed</Label>
                <p className="text-2xl font-bold text-white font-mono">{formatCurrency(state.totalBorrowsUSD)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-400 font-mono">Current Health Factor</Label>
                <div className="flex items-center space-x-2">
                  {state.healthFactor >= 1.5 ? (
                    <Shield className="w-4 h-4 text-green-400" />
                  ) : state.healthFactor >= 1.2 ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={`font-mono ${
                      state.healthFactor >= 1.5
                        ? "text-green-400"
                        : state.healthFactor >= 1.2
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {state.healthFactor > 0 ? state.healthFactor.toFixed(2) : "N/A"}
                  </span>
                </div>
              </div>
              {state.healthFactor > 0 && <Progress value={Math.min(state.healthFactor * 20, 100)} className="h-2" />}
            </div>

            {/* Active Positions */}
            <div className="space-y-3">
              <Label className="text-gray-400 font-mono">Active Positions</Label>
              <div className="space-y-2">
                {/* Collateral Positions */}
                {state.positions
                  .filter((pos) => pos.type === "deposit" && pos.isCollateral)
                  .map((position) => (
                    <div key={position.id} className="flex items-center justify-between p-3 rounded-lg bg-[#2A2A2A]">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold">{getTokenData(position.token).icon}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium font-mono">{position.token} Collateral</p>
                          <p className="text-sm text-gray-400 font-mono">
                            {position.amount.toFixed(6)} {position.token}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="border-blue-500 text-blue-500 font-mono mb-1">
                          <Lock className="w-3 h-3 mr-1" />
                          COLLATERAL
                        </Badge>
                        <p className="text-sm text-gray-400 font-mono">{formatCurrency(position.valueUSD)}</p>
                      </div>
                    </div>
                  ))}

                {/* Borrow Positions */}
                {state.positions
                  .filter((pos) => pos.type === "borrow")
                  .map((position) => (
                    <div key={position.id} className="flex items-center justify-between p-3 rounded-lg bg-[#2A2A2A]">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold">{getTokenData(position.token).icon}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium font-mono">{position.token} Loan</p>
                          <p className="text-sm text-gray-400 font-mono">
                            {position.amount.toFixed(6)} {position.token} @ {position.apy?.toFixed(1)}% APY
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="border-green-500 text-green-500 font-mono mb-1">
                          BORROWED
                        </Badge>
                        <p className="text-sm text-gray-400 font-mono">{formatCurrency(position.valueUSD)}</p>
                      </div>
                    </div>
                  ))}

                {state.positions.filter((pos) => (pos.type === "deposit" && pos.isCollateral) || pos.type === "borrow")
                  .length === 0 && (
                  <div className="text-center py-6">
                    <Unlock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 font-mono text-sm">No active loans</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
