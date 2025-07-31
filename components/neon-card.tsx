"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type React from "react"

interface NeonCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
  onClick?: () => void
}

export function NeonCard({ children, className = "", glowColor = "orange", onClick }: NeonCardProps) {
  const glowColors = {
    orange: "shadow-[0_0_20px_rgba(255,107,53,0.3)] border-orange-500/30",
    red: "shadow-[0_0_20px_rgba(239,68,68,0.3)] border-red-500/30",
    green: "shadow-[0_0_20px_rgba(34,197,94,0.3)] border-green-500/30",
    blue: "shadow-[0_0_20px_rgba(59,130,246,0.3)] border-blue-500/30",
    purple: "shadow-[0_0_20px_rgba(147,51,234,0.3)] border-purple-500/30",
  }

  return (
    <Card
      className={`bg-gray-900/60 backdrop-blur-sm border ${glowColors[glowColor as keyof typeof glowColors]} hover:shadow-[0_0_30px_rgba(255,107,53,0.4)] transition-all duration-300 ${className}`}
      onClick={onClick}
    >
      {children}
    </Card>
  )
}

interface NeonCardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function NeonCardHeader({ children, className = "" }: NeonCardHeaderProps) {
  return <CardHeader className={className}>{children}</CardHeader>
}

interface NeonCardTitleProps {
  children: React.ReactNode
  className?: string
}

export function NeonCardTitle({ children, className = "" }: NeonCardTitleProps) {
  return (
    <CardTitle
      className={`text-white font-semibold tracking-wide ${className}`}
      style={{ textShadow: "0 0 10px rgba(255, 107, 53, 0.5)" }}
    >
      {children}
    </CardTitle>
  )
}

interface NeonCardContentProps {
  children: React.ReactNode
  className?: string
}

export function NeonCardContent({ children, className = "" }: NeonCardContentProps) {
  return <CardContent className={className}>{children}</CardContent>
}
