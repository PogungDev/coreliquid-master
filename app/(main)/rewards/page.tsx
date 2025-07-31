"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Gift,
  Star,
  Zap,
  Coins,
  Trophy,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  Vault,
  Handshake,
  Users,
  MessageSquare,
  Info,
} from "lucide-react"
import { usePortfolio } from "@/contexts/portfolio-context"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/token-data"

export default function RewardsPage() {
  const { state, dispatch } = usePortfolio()
  const { toast } = useToast()

  const [currentXP, setCurrentXP] = useState(state.coreHoldings) // Using coreHoldings as XP for demo
  const [availableRewards, setAvailableRewards] = useState(100) // Simulate available rewards
  const [lastClaimTime, setLastClaimTime] = useState<number | null>(null)
  const [claimCooldown, setClaimCooldown] = useState(0) // Cooldown in seconds

  const XP_PER_LEVEL = 500
  const currentLevel = Math.floor(currentXP / XP_PER_LEVEL) + 1
  const progressToNextLevel = ((currentXP % XP_PER_LEVEL) / XP_PER_LEVEL) * 100

  // Badges data with XP requirements
  const badges = [
    { id: "beginner", name: "Beginner", xpRequired: 0, icon: <Trophy className="w-8 h-8 text-gray-400" /> },
    { id: "depositor", name: "Depositor", xpRequired: 200, icon: <Coins className="w-8 h-8 text-green-400" /> },
    { id: "borrower", name: "Borrower", xpRequired: 400, icon: <Zap className="w-8 h-8 text-red-400" /> },
    { id: "vault_master", name: "Vault Master", xpRequired: 600, icon: <Vault className="w-8 h-8 text-purple-400" /> },
    { id: "trader", name: "Trader", xpRequired: 800, icon: <RefreshCcw className="w-8 h-8 text-blue-400" /> },
    { id: "whale", name: "Whale", xpRequired: 1000, icon: <Shield className="w-8 h-8 text-yellow-400" /> },
  ]

  // Simulate rewards cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (lastClaimTime) {
      const cooldownDuration = 60 * 1000 // 1 minute cooldown for demo (60 * 60 * 1000 for 1 hour, 24 * 60 * 60 * 1000 for 24 hours)
      const timeElapsed = Date.now() - lastClaimTime
      const remainingCooldown = Math.max(0, cooldownDuration - timeElapsed)

      setClaimCooldown(Math.ceil(remainingCooldown / 1000))

      if (remainingCooldown > 0) {
        timer = setInterval(() => {
          setClaimCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    }
    return () => clearInterval(timer)
  }, [lastClaimTime])

  const handleClaimRewards = async () => {
    if (availableRewards <= 0 || claimCooldown > 0) {
      toast({
        title: "No Rewards Available",
        description: "Please wait for the cooldown or accumulate more rewards.",
        variant: "destructive",
      })
      return
    }

    try {
      // Simulate claiming rewards
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const claimedAmount = availableRewards
      const xpGained = 50 // Example XP for claiming rewards

      setAvailableRewards(0)
      setCurrentXP((prevXP) => prevXP + xpGained)
      dispatch({ type: "SET_CORE_HOLDINGS", payload: { amount: state.coreHoldings + xpGained } }) // Update XP in context
      setLastClaimTime(Date.now())

      toast({
        title: "Rewards Claimed!",
        description: `Successfully claimed ${formatCurrency(claimedAmount)} and gained ${xpGained} XP.`,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: "Failed to claim rewards. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUnlockBadge = (badgeId: string, xpBonus: number) => {
    const badge = badges.find((b) => b.id === badgeId)
    if (badge && currentXP >= badge.xpRequired) {
      setCurrentXP((prevXP) => prevXP + xpBonus)
      dispatch({ type: "SET_CORE_HOLDINGS", payload: { amount: state.coreHoldings + xpBonus } }) // Update XP in context
      toast({
        title: "Badge Unlocked!",
        description: `You unlocked the "${badge.name}" badge and gained ${xpBonus} bonus XP!`,
        variant: "default",
      })
    } else {
      toast({
        title: "Cannot Unlock Badge",
        description: `You need ${badge?.xpRequired} XP to unlock this badge.`,
        variant: "destructive",
      })
    }
  }

  const isClaimButtonDisabled = availableRewards <= 0 || claimCooldown > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 font-mono">REWARDS</h1>
        <p className="text-gray-400 font-mono">Earn XP, unlock badges, and claim rewards</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* XP & Level Progress */}
        <Card className="bg-[#1E1E1E] border-[#2A2A2A] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white flex items-center font-mono">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              XP & Level Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-mono">Current XP:</span>
              <span className="text-white font-bold text-2xl font-mono">{currentXP} XP</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-mono">Level:</span>
              <span className="text-cyan-400 font-bold text-2xl font-mono">{currentLevel}</span>
            </div>
            <Progress value={progressToNextLevel} className="h-3 bg-gray-700">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </Progress>
            <p className="text-sm text-gray-400 font-mono text-center">
              {XP_PER_LEVEL - (currentXP % XP_PER_LEVEL)} XP to next level
            </p>
          </CardContent>
        </Card>

        {/* Available Rewards */}
        <Card className="bg-[#1E1E1E] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white flex items-center font-mono">
              <Gift className="w-5 h-5 mr-2 text-pink-400" />
              Available Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-400 font-mono">{formatCurrency(availableRewards)}</p>
              <p className="text-gray-400 font-mono">CORE Tokens</p>
            </div>
            <Button
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-mono"
              onClick={handleClaimRewards}
              disabled={isClaimButtonDisabled}
            >
              {claimCooldown > 0 ? `Cooldown: ${claimCooldown}s` : "CLAIM_ALL_REWARDS"}
            </Button>
            {claimCooldown > 0 && (
              <p className="text-xs text-gray-500 text-center font-mono">
                You can claim again in {claimCooldown} seconds.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <Card className="bg-[#1E1E1E] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white flex items-center font-mono">
            <Trophy className="w-5 h-5 mr-2 text-cyan-400" />
            Your Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges.map((badge) => {
              const isEarned = currentXP >= badge.xpRequired
              const isUnlockable = !isEarned && currentXP >= badge.xpRequired - 100 // Example: unlockable if within 100 XP
              return (
                <div
                  key={badge.id}
                  className={`relative p-4 rounded-lg flex flex-col items-center justify-center text-center space-y-2 transition-all duration-300
                    ${isEarned ? "bg-gradient-to-br from-yellow-900/30 to-yellow-900/10 border border-yellow-500/30" : "bg-[#2A2A2A] border border-[#3A3A3A]"}
                  `}
                >
                  {isEarned && <Star className="absolute top-2 right-2 w-5 h-5 text-yellow-400 fill-yellow-400" />}
                  {isUnlockable && <Star className="absolute top-2 right-2 w-5 h-5 text-yellow-400 animate-ping" />}
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                    {badge.icon}
                  </div>
                  <p className="text-white font-medium font-mono">{badge.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{isEarned ? "Unlocked" : `${badge.xpRequired} XP`}</p>
                  {!isEarned && currentXP >= badge.xpRequired && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-mono"
                      onClick={() => handleUnlockBadge(badge.id, 100)} // 100 XP bonus for unlocking
                    >
                      Unlock Badge
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* How to Earn XP & Points */}
      <Card className="bg-[#1E1E1E] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white flex items-center font-mono">
            <Info className="w-5 h-5 mr-2 text-blue-400" />
            How to Earn XP & Points
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-400 font-mono">
            Gain Experience Points (XP) by actively participating in the CoreFluidX DeFi ecosystem. Accumulate XP to
            level up and unlock exclusive badges!
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
              <div className="flex items-center space-x-3">
                <ArrowUpRight className="w-5 h-5 text-green-400" />
                <span className="text-white font-mono">Deposit Assets</span>
              </div>
              <Badge variant="outline" className="border-green-500 text-green-400 font-mono">
                +10 XP / $1000 Deposited
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
              <div className="flex items-center space-x-3">
                <ArrowDownLeft className="w-5 h-5 text-red-400" />
                <span className="text-white font-mono">Borrow Funds</span>
              </div>
              <Badge variant="outline" className="border-red-500 text-red-400 font-mono">
                +15 XP / $1000 Borrowed
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
              <div className="flex items-center space-x-3">
                <RefreshCcw className="w-5 h-5 text-blue-400" />
                <span className="text-white font-mono">Execute Swaps</span>
              </div>
              <Badge variant="outline" className="border-blue-500 text-blue-400 font-mono">
                +5 XP / Swap
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
              <div className="flex items-center space-x-3">
                <Vault className="w-5 h-5 text-purple-400" />
                <span className="text-white font-mono">Invest in Vaults</span>
              </div>
              <Badge variant="outline" className="border-purple-500 text-purple-400 font-mono">
                +20 XP / $1000 Invested
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
              <div className="flex items-center space-x-3">
                <Handshake className="w-5 h-5 text-orange-400" />
                <span className="text-white font-mono">Participate in Governance</span>
              </div>
              <Badge variant="outline" className="border-orange-500 text-orange-400 font-mono">
                +50 XP / Vote
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-pink-400" />
                <span className="text-white font-mono">Refer Friends</span>
              </div>
              <Badge variant="outline" className="border-pink-500 text-pink-400 font-mono">
                +100 XP / Referral
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-mono">Community Engagement</span>
              </div>
              <Badge variant="outline" className="border-cyan-500 text-cyan-400 font-mono">
                +5-20 XP / Activity
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
