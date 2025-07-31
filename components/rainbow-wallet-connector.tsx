"use client"

import { useEffect, useRef } from "react"
import { useAccount, useDisconnect } from "wagmi"
import { usePortfolio } from "@/contexts/portfolio-context"
import { useToast } from "@/hooks/use-toast"

/**
 * Bridge component that syncs RainbowKit wallet state with existing Portfolio Context
 * This ensures backward compatibility with existing business logic
 */
export function RainbowWalletConnector() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { state, dispatch } = usePortfolio()
  const { toast } = useToast()
  const lastSyncedState = useRef({ isConnected: false, address: "" })

  // Sync RainbowKit wallet state with Portfolio Context
  useEffect(() => {
    // Prevent unnecessary updates if state hasn't actually changed
    if (lastSyncedState.current.isConnected === isConnected && 
        lastSyncedState.current.address === address) {
      return
    }

    if (isConnected && address && !state.isWalletConnected) {
      // Wallet connected via RainbowKit - update portfolio context
      dispatch({
        type: "CONNECT_WALLET",
        payload: { address },
      })
      toast({
        title: "Wallet Connected",
        description: `Successfully connected with ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        variant: "default",
      })
      lastSyncedState.current = { isConnected: true, address }
    } else if (!isConnected && state.isWalletConnected && state.accountAddress) {
      // Only disconnect if we were previously connected with an actual address
      dispatch({ type: "DISCONNECT_WALLET" })
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected successfully.",
        variant: "default",
      })
      lastSyncedState.current = { isConnected: false, address: "" }
    }
  }, [isConnected, address, state.isWalletConnected, state.accountAddress, dispatch, toast])

  return null // This is a bridge component, no UI needed
}