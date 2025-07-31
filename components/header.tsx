"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, LogOut, User, ChevronDown } from "lucide-react"
import { GlitchText } from "@/components/glitch-text"
import { CyberButton } from "@/components/cyber-button"
import { usePortfolio } from "@/contexts/portfolio-context"
import { useToast } from "@/hooks/use-toast"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useDisconnect } from "wagmi"
import { RainbowWalletConnector } from "@/components/rainbow-wallet-connector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const { state, dispatch } = usePortfolio()
  const { toast } = useToast()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleWalletDisconnect = () => {
    // First disconnect from wagmi/RainbowKit
    disconnect()
    // The RainbowWalletConnector will handle updating the portfolio context
    // and showing the toast notification
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <>
      <RainbowWalletConnector />
      <header className="border-b border-[#1E1E1E] bg-[#0A0A0A]/95 backdrop-blur-md z-50">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,107,53,0.6)]">
                <span className="text-white font-bold text-lg font-mono">CF</span>
              </div>
              <div>
                <GlitchText text="CoreFluidX" className="text-xl font-bold text-white" />
                <p className="text-xs text-orange-400 font-mono tracking-widest">UNIFIED_LIQUIDITY.EXE</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
          {state.isWalletConnected ? (
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="border-green-500/30 text-green-400 font-mono">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                CONNECTED
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 font-mono bg-transparent"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {formatAddress(state.accountAddress)}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-orange-500/30 text-white">
                  <DropdownMenuItem className="font-mono text-xs text-gray-400">
                    {state.accountAddress}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem onClick={handleWalletDisconnect} className="text-red-400 font-mono">
                    <LogOut className="w-4 h-4 mr-2" />
                    DISCONNECT
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="[&>div]:!bg-transparent [&>div]:!border-orange-500/30 [&>div]:!text-orange-400 [&>div]:hover:!bg-orange-500/10 [&>div]:!font-mono [&>div]:!shadow-[0_0_10px_rgba(255,107,53,0.3)] [&>div]:!transition-all [&>div]:!duration-300">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                      authenticationStatus === 'authenticated');

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        'style': {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <CyberButton onClick={openConnectModal}>
                              <Wallet className="w-4 h-4 mr-2" />
                              CONNECT_WALLET
                            </CyberButton>
                          );
                        }

                        return null; // Connected state is handled by portfolio context
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          )}
          </div>
        </div>
      </header>
    </>
  )
}
