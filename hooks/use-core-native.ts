'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useContractRead, useWriteContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { toast } from 'sonner'

// Core Native Staking ABI (simplified)
const CORE_NATIVE_STAKING_ABI = [
  {
    name: 'stakeBTC',
    type: 'function',
    inputs: [
      { name: 'btcTxHash', type: 'bytes32' },
      { name: 'btcAmount', type: 'uint256' },
      { name: 'lockTime', type: 'uint256' },
      { name: 'validator', type: 'address' },
      { name: 'coreAmount', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'stakeCORE',
    type: 'function',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'validator', type: 'address' }
    ],
    outputs: []
  },
  {
    name: 'unstakeCORE',
    type: 'function',
    inputs: [
      { name: 'stCoreAmount', type: 'uint256' },
      { name: 'positionIndex', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'claimRewards',
    type: 'function',
    inputs: [],
    outputs: []
  },
  {
    name: 'redeemBTC',
    type: 'function',
    inputs: [{ name: 'positionIndex', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'getUserStakingInfo',
    type: 'function',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'btcStaked', type: 'uint256' },
      { name: 'coreStaked', type: 'uint256' },
      { name: 'stCoreBalance', type: 'uint256' },
      { name: 'pendingReward', type: 'uint256' },
      { name: 'activeBTCPositions', type: 'uint256' },
      { name: 'activeCorePositions', type: 'uint256' }
    ]
  },
  {
    name: 'getDualStakingTiers',
    type: 'function',
    inputs: [],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'corePerBTC', type: 'uint256' },
          { name: 'multiplier', type: 'uint256' },
          { name: 'tierName', type: 'string' }
        ]
      }
    ]
  }
] as const

// stCORE Token ABI (simplified)
const STCORE_TOKEN_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'getExchangeRate',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'getCurrentAPY',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'stCoreToCORE',
    type: 'function',
    inputs: [{ name: 'stCoreAmount', type: 'uint256' }],
    outputs: [{ name: 'coreAmount', type: 'uint256' }]
  },
  {
    name: 'coreToStCORE',
    type: 'function',
    inputs: [{ name: 'coreAmount', type: 'uint256' }],
    outputs: [{ name: 'stCoreAmount', type: 'uint256' }]
  },
  {
    name: 'getProtocolStats',
    type: 'function',
    inputs: [],
    outputs: [
      { name: 'totalStaked', type: 'uint256' },
      { name: 'totalSupply', type: 'uint256' },
      { name: 'exchangeRate', type: 'uint256' },
      { name: 'currentAPY', type: 'uint256' },
      { name: 'totalRewards', type: 'uint256' },
      { name: 'currentEpoch', type: 'uint256' }
    ]
  }
] as const

// Core Validator Integration ABI (simplified)
const CORE_VALIDATOR_ABI = [
  {
    name: 'delegateToValidator',
    type: 'function',
    inputs: [
      { name: 'validator', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'getActiveValidators',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }]
  },
  {
    name: 'getValidatorInfo',
    type: 'function',
    inputs: [{ name: 'validator', type: 'address' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'validatorAddress', type: 'address' },
          { name: 'moniker', type: 'string' },
          { name: 'website', type: 'string' },
          { name: 'details', type: 'string' },
          { name: 'commission', type: 'uint256' },
          { name: 'votingPower', type: 'uint256' },
          { name: 'totalDelegated', type: 'uint256' },
          { name: 'selfStake', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
          { name: 'isJailed', type: 'bool' },
          { name: 'jailTime', type: 'uint256' },
          { name: 'hashPower', type: 'uint256' },
          { name: 'lastRewardClaim', type: 'uint256' },
          { name: 'slashCount', type: 'uint256' },
          { name: 'uptime', type: 'uint256' }
        ]
      }
    ]
  }
] as const

// Contract addresses from environment variables
const CORE_NATIVE_STAKING_ADDRESS = process.env.NEXT_PUBLIC_CORE_NATIVE_STAKING || '0xDB8cFf278adCCF9E9b5da745B44E754fC4EE3C76'
const STCORE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_STCORE_TOKEN || '0xBb2180ebd78ce97360503434eD37fcf4a1Df61c3'
const CORE_VALIDATOR_ADDRESS = '0x0000000000000000000000000000000000000000' // Core Chain native validator contract

interface BTCStakingPosition {
  btcTxHash: string
  btcAmount: bigint
  coreStaked: bigint
  lockTime: bigint
  startTime: bigint
  validator: string
  tier: number
  isActive: boolean
  rewardsClaimed: bigint
}

interface CoreStakingPosition {
  amount: bigint
  stCoreAmount: bigint
  startTime: bigint
  validator: string
  rewardsClaimed: bigint
  isActive: boolean
}

interface DualStakingTier {
  corePerBTC: bigint
  multiplier: bigint
  tierName: string
}

interface ValidatorInfo {
  validatorAddress: string
  moniker: string
  website: string
  details: string
  commission: bigint
  votingPower: bigint
  totalDelegated: bigint
  selfStake: bigint
  isActive: boolean
  isJailed: boolean
  jailTime: bigint
  hashPower: bigint
  lastRewardClaim: bigint
  slashCount: bigint
  uptime: bigint
}

interface StakingInfo {
  btcStaked: bigint
  coreStaked: bigint
  stCoreBalance: bigint
  pendingReward: bigint
  activeBTCPositions: bigint
  activeCorePositions: bigint
}

interface ProtocolStats {
  totalStaked: bigint
  totalSupply: bigint
  exchangeRate: bigint
  currentAPY: bigint
  totalRewards: bigint
  currentEpoch: bigint
}

export function useCoreNative() {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [stakingInfo, setStakingInfo] = useState<StakingInfo | null>(null)
  const [validators, setValidators] = useState<ValidatorInfo[]>([])
  const [dualStakingTiers, setDualStakingTiers] = useState<DualStakingTier[]>([])
  const [protocolStats, setProtocolStats] = useState<ProtocolStats | null>(null)

  const { writeContract } = useWriteContract()

  // Read user staking info
  const { data: userStakingData, refetch: refetchStakingInfo } = useContractRead({
    address: CORE_NATIVE_STAKING_ADDRESS as `0x${string}`,
    abi: CORE_NATIVE_STAKING_ABI,
    functionName: 'getUserStakingInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Read stCORE exchange rate
  const { data: exchangeRate } = useContractRead({
    address: STCORE_TOKEN_ADDRESS as `0x${string}`,
    abi: STCORE_TOKEN_ABI,
    functionName: 'getExchangeRate',
  })

  // Read stCORE APY
  const { data: stCoreAPY } = useContractRead({
    address: STCORE_TOKEN_ADDRESS as `0x${string}`,
    abi: STCORE_TOKEN_ABI,
    functionName: 'getCurrentAPY',
  })

  // Read dual staking tiers
  const { data: tiersData } = useContractRead({
    address: CORE_NATIVE_STAKING_ADDRESS as `0x${string}`,
    abi: CORE_NATIVE_STAKING_ABI,
    functionName: 'getDualStakingTiers',
  })

  // Read active validators
  const { data: activeValidators } = useContractRead({
    address: CORE_VALIDATOR_ADDRESS as `0x${string}`,
    abi: CORE_VALIDATOR_ABI,
    functionName: 'getActiveValidators',
  })

  // Read protocol stats
  const { data: protocolStatsData } = useContractRead({
    address: STCORE_TOKEN_ADDRESS as `0x${string}`,
    abi: STCORE_TOKEN_ABI,
    functionName: 'getProtocolStats',
  })

  // BTC Staking
  const handleBTCStake = useCallback(async (
    btcTxHash: string,
    btcAmount: string,
    lockDays: number,
    validator: string,
    coreAmount: string
  ) => {
    if (!writeContract) {
      toast.error('Contract not ready')
      return
    }

    try {
      setIsLoading(true)
      const btcAmountWei = parseEther(btcAmount)
      const coreAmountWei = coreAmount ? parseEther(coreAmount) : BigInt(0)
      const lockTime = BigInt(lockDays * 24 * 6) // Convert days to Bitcoin blocks

      await writeContract({
        address: CORE_NATIVE_STAKING_ADDRESS as `0x${string}`,
        abi: CORE_NATIVE_STAKING_ABI,
        functionName: 'stakeBTC',
        args: [btcTxHash as `0x${string}`, btcAmountWei, lockTime, validator as `0x${string}`, coreAmountWei]
      })

      console.log(`🔄 BTC Staking Transaction Submitted`)
      toast.success(`BTC staking initiated successfully!`)
      await refetchStakingInfo()
    } catch (error) {
      console.error('BTC staking failed:', error)
      toast.error('BTC staking failed')
    } finally {
      setIsLoading(false)
    }
  }, [writeContract, refetchStakingInfo])

  // Stake CORE for liquid staking
  const handleCOREStake = useCallback(async (
    amount: string,
    validator: string
  ) => {
    if (!writeContract) {
      toast.error('Contract not ready')
      return
    }

    try {
      setIsLoading(true)
      const amountWei = parseEther(amount)

      await writeContract({
        address: CORE_NATIVE_STAKING_ADDRESS as `0x${string}`,
        abi: CORE_NATIVE_STAKING_ABI,
        functionName: 'stakeCORE',
        args: [amountWei, validator as `0x${string}`]
      })

      console.log(`🔄 CORE Staking Transaction Submitted`)
      toast.success(`CORE staking successful! You received stCORE tokens.`)
      await refetchStakingInfo()
    } catch (error) {
      console.error('CORE staking failed:', error)
      toast.error('CORE staking failed')
    } finally {
      setIsLoading(false)
    }
  }, [writeContract, refetchStakingInfo])

  // Unstake CORE
  const handleCOREUnstake = useCallback(async (
    stCoreAmount: string,
    positionIndex: number
  ) => {
    if (!writeContract) {
      toast.error('Contract not ready')
      return
    }

    try {
      setIsLoading(true)
      const stCoreAmountWei = parseEther(stCoreAmount)

      await writeContract({
        address: CORE_NATIVE_STAKING_ADDRESS as `0x${string}`,
        abi: CORE_NATIVE_STAKING_ABI,
        functionName: 'unstakeCORE',
        args: [stCoreAmountWei, BigInt(positionIndex)]
      })

      console.log(`🔄 CORE Unstaking Transaction Submitted`)
      toast.success(`CORE unstaking successful!`)
      await refetchStakingInfo()
    } catch (error) {
      console.error('CORE unstaking failed:', error)
      toast.error('CORE unstaking failed')
    } finally {
      setIsLoading(false)
    }
  }, [writeContract, refetchStakingInfo])

  // Claim staking rewards
  const handleClaimRewards = useCallback(async () => {
    if (!writeContract) {
      toast.error('Contract not ready')
      return
    }

    try {
      setIsLoading(true)
      await writeContract({
        address: CORE_NATIVE_STAKING_ADDRESS as `0x${string}`,
        abi: CORE_NATIVE_STAKING_ABI,
        functionName: 'claimRewards',
      })
      toast.success('Rewards claimed successfully!')
      await refetchStakingInfo()
    } catch (error) {
      console.error('Claim rewards failed:', error)
      toast.error('Failed to claim rewards')
    } finally {
      setIsLoading(false)
    }
  }, [writeContract, refetchStakingInfo])

  // Redeem BTC after lock period
  const handleBTCRedeem = useCallback(async (positionIndex: number) => {
    if (!writeContract) {
      toast.error('Contract not ready')
      return
    }

    try {
      setIsLoading(true)
      await writeContract({
        address: CORE_NATIVE_STAKING_ADDRESS as `0x${string}`,
        abi: CORE_NATIVE_STAKING_ABI,
        functionName: 'redeemBTC',
        args: [BigInt(positionIndex)]
      })
      toast.success('BTC redeemed successfully!')
      await refetchStakingInfo()
    } catch (error) {
      console.error('BTC redeem failed:', error)
      toast.error('BTC redeem failed')
    } finally {
      setIsLoading(false)
    }
  }, [writeContract, refetchStakingInfo])

  // Delegate to validator
  const handleValidatorDelegation = useCallback(async (
    validator: string,
    amount: string
  ) => {
    if (!writeContract) {
      toast.error('Contract not ready')
      return
    }

    try {
      setIsLoading(true)
      const amountWei = parseEther(amount)

      await writeContract({
        address: CORE_VALIDATOR_ADDRESS as `0x${string}`,
        abi: CORE_VALIDATOR_ABI,
        functionName: 'delegateToValidator',
        args: [validator as `0x${string}`, amountWei]
      })

      toast.success('Successfully delegated to validator!')
      await refetchStakingInfo()
    } catch (error) {
      console.error('Validator delegation failed:', error)
      toast.error('Validator delegation failed')
    } finally {
      setIsLoading(false)
    }
  }, [writeContract, refetchStakingInfo])

  // Calculate dual staking tier
  const calculateDualStakingTier = useCallback((btcAmount: string, coreAmount: string) => {
    if (!coreAmount || !btcAmount || dualStakingTiers.length === 0) return 0

    const btcWei = parseEther(btcAmount)
    const coreWei = parseEther(coreAmount)
    const corePerBTC = (coreWei * BigInt(1e18)) / btcWei

    for (let i = dualStakingTiers.length - 1; i > 0; i--) {
      if (corePerBTC >= dualStakingTiers[i].corePerBTC) {
        return i
      }
    }
    return 0
  }, [dualStakingTiers])

  // Format values for display
  const formatStakingValue = useCallback((value: bigint | undefined) => {
    if (!value) return '0'
    return formatEther(value)
  }, [])

  const formatAPY = useCallback((apy: bigint | undefined) => {
    if (!apy) return '0'
    return (Number(apy) / 100).toFixed(2) // Convert from basis points to percentage
  }, [])

  return {
    // State
    isLoading,
    stakingInfo,
    validators,
    dualStakingTiers,
    protocolStats,
    exchangeRate,
    stCoreAPY,
    activeValidators,

    // Actions
    handleBTCStake,
    handleCOREStake,
    handleCOREUnstake,
    handleClaimRewards,
    handleBTCRedeem,
    handleValidatorDelegation,

    // Utilities
    calculateDualStakingTier,
    formatStakingValue,
    formatAPY,
    refetchStakingInfo,
  }
}