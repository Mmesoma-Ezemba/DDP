"use client"

import { useStableId } from "@/hooks/use-stable-id"
import { Card } from "@/components/ui/card"
import { Bullet } from "@/components/ui/bullet"
import HeartIcon from "@/components/icons/heart"
import type { HeartbeatData } from "@/types/activity"
import { cn } from "@/lib/utils"

interface HeartbeatMonitorProps {
  data: HeartbeatData[]
  status: "active" | "warning" | "critical"
}

export function HeartbeatMonitor({ data, status }: HeartbeatMonitorProps) {
  const gradientId = useStableId("heartbeat-gradient")
  const glowId = useStableId("heartbeat-glow")

  const statusConfig = {
    active: {
      color: "var(--color-success)",
      label: "[ACTIVE]",
      pulseColor: "bg-success",
    },
    warning: {
      color: "var(--color-warning)",
      label: "[WARNING]",
      pulseColor: "bg-warning",
    },
    critical: {
      color: "var(--color-destructive)",
      label: "[CRITICAL]",
      pulseColor: "bg-destructive",
    },
  }

  const config = statusConfig[status]

  return (
    <Card className="relative overflow-hidden border-2 p-6">
      {/* Heartbeat SVG Visualization */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", `${config.pulseColor}/10`)}>
              <HeartIcon className={cn("size-6 animate-pulse")} style={{ color: config.color }} />
            </div>
            <div>
              <h3 className="text-lg font-display uppercase">Heartbeat Monitor</h3>
              <p className="text-xs text-muted-foreground uppercase flex items-center gap-2">
                <Bullet />
                Real-time Activity Tracking
              </p>
            </div>
          </div>
          <div
            className="px-3 py-1 rounded font-mono text-xs font-medium"
            style={{ backgroundColor: `${config.color}20`, color: config.color }}
          >
            {config.label}
          </div>
        </div>

        <div className="relative w-full h-48 bg-accent/30 rounded-lg p-4 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 800 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={config.color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={config.color} stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Baseline */}
            <line x1="0" y1="75" x2="800" y2="75" stroke={config.color} strokeWidth="1" opacity="0.2" />

            {/* Heartbeat path */}
            <path
              d={generateHeartbeatPath(data)}
              stroke={config.color}
              strokeWidth="2"
              fill="none"
            />

            {/* Area fill */}
            <path
              d={`${generateHeartbeatPath(data)} L 800,150 L 0,150 Z`}
              fill={`url(#${gradientId})`}
              opacity="0.2"
            />

            {/* Data points */}
            {data.map((point, i) => {
              const x = (i / (data.length - 1)) * 800
              const y = 150 - (point.value / 100) * 120
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={config.color}
                  opacity="0.8"
                />
              )
            })}
          </svg>

          {/* Animated scan line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 opacity-50 animate-scan"
            style={{ backgroundColor: config.color }}
          />

          <style jsx>{`
            @keyframes scan {
              0% {
                left: 0%;
              }
              100% {
                left: 100%;
              }
            }
            .animate-scan {
              animation: scan 4s linear infinite;
            }
          `}</style>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-accent/50 rounded p-3">
          <p className="text-xs text-muted-foreground uppercase mb-1">Signals</p>
          <p className="text-xl font-display">{data.length}</p>
        </div>
        <div className="bg-accent/50 rounded p-3">
          <p className="text-xs text-muted-foreground uppercase mb-1">Average</p>
          <p className="text-xl font-display">
            {Math.round(data.reduce((acc, d) => acc + d.value, 0) / data.length)}%
          </p>
        </div>
        <div className="bg-accent/50 rounded p-3">
          <p className="text-xs text-muted-foreground uppercase mb-1">Status</p>
          <div
            className={cn("size-3 rounded-full animate-pulse")}
            style={{ backgroundColor: config.color }}
          />
        </div>
      </div>
    </Card>
  )
}

function generateHeartbeatPath(data: HeartbeatData[]): string {
  if (data.length === 0) return ""

  let path = ""
  data.forEach((point, i) => {
    const x = (i / (data.length - 1)) * 800
    const y = 150 - (point.value / 100) * 120

    if (i === 0) {
      path += `M ${x} ${y}`
    } else {
      // Create smooth curves
      const prevX = ((i - 1) / (data.length - 1)) * 800
      const prevY = 150 - (data[i - 1].value / 100) * 120
      const cpX = (x + prevX) / 2
      path += ` Q ${cpX} ${prevY}, ${x} ${y}`
    }
  })

  return path
}

