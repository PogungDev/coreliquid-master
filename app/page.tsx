"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Zap, TrendingUp, Users, DollarSign, Lock } from "lucide-react"
import Link from "next/link"
import { NeonCard } from "@/components/neon-card"
import { CyberButton } from "@/components/cyber-button"
import { GlitchText } from "@/components/glitch-text"
import { Web3Background } from "@/components/web3-background"

export default function HomePage() {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)

  const strategies = [
    {
      id: "adaptive-yield",
      name: "ADAPTIVE_YIELD_ENGINE",
      description: "AI-powered dynamic allocation across 15+ DeFi protocols with real-time rebalancing",
      apy: "15.8%",
      tvl: "$4.2M",
      risk: "Medium",
      icon: "🤖",
      features: ["Auto-compound", "Risk-adjusted", "Multi-protocol"]
    },
    {
      id: "flash-arbitrage",
      name: "FLASH_ARBITRAGE_VAULT",
      description: "Exploit price differences across DEXs using flash loans for instant profits",
      apy: "22.7%",
      tvl: "$2.8M",
      risk: "High",
      icon: "⚡",
      features: ["Flash loans", "MEV protection", "Instant execution"]
    },
    {
      id: "stable-fortress",
      name: "STABLE_FORTRESS",
      description: "Ultra-secure stablecoin strategy with insurance coverage and guaranteed returns",
      apy: "9.4%",
      tvl: "$6.1M",
      risk: "Low",
      icon: "🛡️",
      features: ["Insurance covered", "Guaranteed APY", "Capital protection"]
    },
  ]

  const handleStrategyClick = (strategyId: string) => {
    setSelectedStrategy(strategyId)
    // Navigate to vault page with selected strategy
    window.location.href = `/vault?strategy=${strategyId}`
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Web3Background />

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <GlitchText
                text="COREFLUIDX"
                className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent"
              />
              <GlitchText text="UNIFIED_LIQUIDITY.EXE" className="text-2xl md:text-4xl font-mono text-cyan-400" />
            </div>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-mono leading-relaxed">
              [ADVANCED_LIQUIDITY_AGGREGATION_PROTOCOL]
              <br />
              Revolutionizing DeFi through cross-protocol yield optimization
              <br />
              <span className="text-cyan-400">&gt; Powered by Core Chain Infrastructure</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/deposit">
                <CyberButton size="lg" className="min-w-[200px]">
                  LAUNCH_APP
                  <ArrowRight className="ml-2 w-5 h-5" />
                </CyberButton>
              </Link>
              <Link href="/vault">
                <Button
                  variant="outline"
                  size="lg"
                  className="min-w-[200px] border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono bg-transparent"
                >
                  EXPLORE_VAULTS
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 border-y border-orange-500/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: "TOTAL_VALUE_LOCKED", value: "$12.5M", icon: DollarSign },
              { label: "ACTIVE_USERS", value: "2,847", icon: Users },
              { label: "PROTOCOLS_INTEGRATED", value: "15+", icon: Shield },
              { label: "AVERAGE_APY", value: "13.2%", icon: TrendingUp },
            ].map((stat, index) => (
              <NeonCard key={index} className="text-center">
                <CardContent className="p-6">
                  <stat.icon className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white font-mono mb-2">{stat.value}</div>
                  <div className="text-gray-400 font-mono text-sm">{stat.label}</div>
                </CardContent>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      {/* Vault Strategies */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <GlitchText text="VAULT_STRATEGIES" className="text-4xl font-bold text-cyan-400 mb-4" />
            <p className="text-gray-400 font-mono text-lg">[AUTOMATED_YIELD_OPTIMIZATION_PROTOCOLS.EXE]</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {strategies.map((strategy) => (
              <NeonCard
                key={strategy.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedStrategy === strategy.id ? "ring-2 ring-cyan-400" : ""
                }`}
                onClick={() => handleStrategyClick(strategy.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-3xl">{strategy.icon}</div>
                    <Badge
                      variant="outline"
                      className={`font-mono ${
                        strategy.risk === "Low"
                          ? "border-green-500/30 text-green-400"
                          : strategy.risk === "Medium"
                            ? "border-yellow-500/30 text-yellow-400"
                            : "border-red-500/30 text-red-400"
                      }`}
                    >
                      {strategy.risk.toUpperCase()}_RISK
                    </Badge>
                  </div>
                  <CardTitle className="text-cyan-400 font-mono">{strategy.name}</CardTitle>
                  <CardDescription className="font-mono text-gray-400">{strategy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-mono">APY:</span>
                      <span className="text-green-400 font-mono font-bold">{strategy.apy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-mono">TVL:</span>
                      <span className="text-cyan-400 font-mono">{strategy.tvl}</span>
                    </div>
                    
                    {/* Strategy Features */}
                    <div className="space-y-2">
                      <span className="text-gray-400 font-mono text-sm">FEATURES:</span>
                      <div className="flex flex-wrap gap-1">
                        {strategy.features?.map((feature, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="text-xs border-orange-500/30 text-orange-400 font-mono"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <CyberButton className="w-full mt-4">
                      DEPLOY_CAPITAL
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </CyberButton>
                  </div>
                </CardContent>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      {/* Protocol Architecture Section */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-transparent to-gray-900/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <GlitchText text="PROTOCOL_ARCHITECTURE" className="text-4xl font-bold text-cyan-400 mb-4" />
            <p className="text-gray-400 font-mono text-lg">[NEXT_GEN_DEFI_INFRASTRUCTURE_STACK]</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "QUANTUM_SECURITY",
                description: "Military-grade encryption with multi-layer security protocols and real-time threat detection",
                color: "text-green-400",
                metrics: "99.99% Uptime"
              },
              {
                icon: Zap,
                title: "HYPER_EXECUTION",
                description: "Sub-second transaction finality with MEV protection and gas optimization algorithms",
                color: "text-yellow-400",
                metrics: "<0.5s Execution"
              },
              {
                icon: TrendingUp,
                title: "AI_YIELD_ENGINE",
                description: "Machine learning algorithms analyze 50+ yield sources to maximize returns automatically",
                color: "text-blue-400",
                metrics: "22.7% Max APY"
              },
              {
                icon: Lock,
                title: "ZERO_CUSTODY_RISK",
                description: "Non-custodial architecture ensures you maintain complete control over your digital assets",
                color: "text-purple-400",
                metrics: "100% Self-Custody"
              },
              {
                icon: Users,
                title: "DAO_GOVERNANCE",
                description: "Community-driven protocol upgrades and treasury management through decentralized voting",
                color: "text-pink-400",
                metrics: "2,847+ Voters"
              },
              {
                icon: DollarSign,
                title: "MINIMAL_FEES",
                description: "Industry-lowest 0.1% protocol fee with gas optimization reducing transaction costs by 40%",
                color: "text-orange-400",
                metrics: "0.1% Protocol Fee"
              },
            ].map((feature, index) => (
              <NeonCard key={index}>
                <CardContent className="p-6 text-center">
                  <feature.icon className={`w-12 h-12 ${feature.color} mx-auto mb-4`} />
                  <h3 className="text-xl font-bold text-white font-mono mb-2">{feature.title}</h3>
                  <p className="text-gray-400 font-mono text-sm mb-3">{feature.description}</p>
                  {feature.metrics && (
                    <div className={`text-lg font-bold ${feature.color} font-mono`}>
                      {feature.metrics}
                    </div>
                  )}
                </CardContent>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <NeonCard className="text-center p-12">
            <div className="space-y-6">
              <GlitchText text="READY_TO_START?" className="text-3xl font-bold text-cyan-400" />
              <p className="text-gray-400 font-mono text-lg max-w-2xl mx-auto">
                Join thousands of users already earning with CoreFluidX. Connect your wallet and start maximizing your
                DeFi yields today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/deposit">
                  <CyberButton size="lg" className="min-w-[200px]">
                    START_EARNING
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </CyberButton>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="lg"
                    className="min-w-[200px] border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono bg-transparent"
                  >
                    VIEW_DASHBOARD
                  </Button>
                </Link>
              </div>
            </div>
          </NeonCard>
        </div>
      </section>
    </div>
  )
}
