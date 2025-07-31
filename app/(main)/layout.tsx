"use client"

import type React from "react"
import { HorizontalNav } from "@/components/horizontal-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Web3Background } from "@/components/web3-background"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Web3Background />
      <div className="relative z-10">
        <HorizontalNav />
        <main className="p-6 pb-20 md:pb-6">{children}</main>
        <footer className="border-t border-blue-500/20 p-4 text-center text-sm text-gray-400 hidden md:block bg-black/60 backdrop-blur-md">
          <div className="flex justify-center space-x-6 font-mono">
            <a href="#" className="hover:text-cyan-400 transition-colors">
              [DOCUMENTATION]
            </a>
            <a href="#" className="hover:text-cyan-400 transition-colors">
              [WHITEPAPER]
            </a>
            <a href="#" className="hover:text-cyan-400 transition-colors">
              [DISCORD]
            </a>
            <a href="#" className="hover:text-cyan-400 transition-colors">
              [TELEGRAM]
            </a>
          </div>
          <p className="mt-2 font-mono text-cyan-400">CoreFluidX v1.0.0 - [UNIFIED_LIQUIDITY_PROTOCOL.EXE]</p>
        </footer>
        <MobileNav />
      </div>
    </div>
  )
}
