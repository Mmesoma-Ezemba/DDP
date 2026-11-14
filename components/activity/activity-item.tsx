"use client"

import { Badge } from "@/components/ui/badge"
import { Bullet } from "@/components/ui/bullet"
import CubeIcon from "@/components/icons/cube"
import UsersIcon from "@/components/icons/users"
import ShieldCheckIcon from "@/components/icons/shield-check"
import HeartIcon from "@/components/icons/heart"
import ZapIcon from "@/components/icons/zap"
import GearIcon from "@/components/icons/gear"
import LockIcon from "@/components/icons/lock"
import ActivityIcon from "@/components/icons/activity"
import type { Activity } from "@/types/activity"
import { cn } from "@/lib/utils"

interface ActivityItemProps {
  activity: Activity
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const iconMap = {
    heartbeat: HeartIcon,
    vault_created: CubeIcon,
    vault_updated: GearIcon,
    beneficiary_added: UsersIcon,
    beneficiary_updated: UsersIcon,
    asset_added: ZapIcon,
    encryption_verified: ShieldCheckIcon,
    contract_deployed: LockIcon,
    notification_sent: ActivityIcon,
    login: ActivityIcon,
    warning: ActivityIcon,
  }

  const statusConfig = {
    success: {
      color: "text-success",
      bg: "bg-success/10",
      border: "border-success/30",
    },
    warning: {
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/30",
    },
    error: {
      color: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/30",
    },
    info: {
      color: "text-chart-2",
      bg: "bg-chart-2/10",
      border: "border-chart-2/30",
    },
  }

  const Icon = iconMap[activity.type] || ActivityIcon
  const config = statusConfig[activity.status]

  const timeAgo = getTimeAgo(new Date(activity.timestamp))

  return (
    <div className="group relative">
      {/* Connecting line */}
      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border group-last:hidden" />

      <div className="flex gap-4 pb-6">
        {/* Icon */}
        <div
          className={cn(
            "relative z-10 p-3 rounded-lg shrink-0 transition-all duration-300 group-hover:scale-110",
            config.bg,
            config.border,
            "border"
          )}
        >
          <Icon className={cn("size-5", config.color)} />
          
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={config.color}
                opacity="0.3"
              >
                <animate attributeName="r" values="48;52;48" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-accent/50 border border-border hover:border-primary/50 rounded-lg p-4 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/10">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h4 className="font-display text-sm mb-1">{activity.title}</h4>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
              </div>
              <Badge variant="outline" className="shrink-0 font-mono text-xs">
                {timeAgo}
              </Badge>
            </div>

            {/* Metadata */}
            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-2">
                {Object.entries(activity.metadata).map(([key, value]) => (
                  value && (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <Bullet className="size-1" />
                      <span className="text-muted-foreground uppercase">{key}:</span>
                      <span className="font-mono">{value}</span>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return "Just now"
}

