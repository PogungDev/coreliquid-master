"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Clock } from "lucide-react"
import { usePortfolio } from "@/contexts/portfolio-context"
import { formatCurrency } from "@/lib/token-data"
import type { RecentActivity } from "@/contexts/portfolio-context"

export function RecentActivityComponent() {
  const { state } = usePortfolio()

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />
      case "borrow":
        return <ArrowUpRight className="w-4 h-4 text-blue-400" />
      case "swap":
        return <ArrowLeftRight className="w-4 h-4 text-orange-400" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getActivityColor = (type: RecentActivity["type"]) => {
    switch (type) {
      case "deposit":
        return "border-green-500/30 text-green-400"
      case "borrow":
        return "border-blue-500/30 text-blue-400"
      case "swap":
        return "border-orange-500/30 text-orange-400"
      default:
        return "border-gray-500/30 text-gray-400"
    }
  }

  const getStatusColor = (status: RecentActivity["status"]) => {
    switch (status) {
      case "completed":
        return "border-green-500/30 text-green-400"
      case "pending":
        return "border-yellow-500/30 text-yellow-400"
      case "failed":
        return "border-red-500/30 text-red-400"
      default:
        return "border-gray-500/30 text-gray-400"
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Card className="bg-[#1E1E1E] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white flex items-center">
          <Activity className="w-5 h-5 mr-2 text-cyan-400" />
          <span className="font-mono text-cyan-400">RECENT_ACTIVITY</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {state.recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-mono">No recent activity</p>
            <p className="text-gray-500 text-sm font-mono mt-1">Start using the protocol to see your activity here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {state.recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-[#2A2A2A] rounded-lg hover:bg-[#333333] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-full">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-xs font-mono ${getActivityColor(activity.type)}`}>
                          {activity.type.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={`text-xs font-mono ${getStatusColor(activity.status)}`}>
                          {activity.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <span className="text-white font-mono">
                          {activity.amount.toFixed(6)} {activity.token}
                          {activity.toToken && (
                            <>
                              <ArrowLeftRight className="w-3 h-3 inline mx-1" />
                              {activity.toToken}
                            </>
                          )}
                        </span>
                        <div className="text-gray-400 font-mono text-xs">{formatCurrency(activity.valueUSD)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-gray-400 text-xs font-mono mb-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                    <div className="text-gray-500 text-xs font-mono" title={formatDateTime(activity.timestamp)}>
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
