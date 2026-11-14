"use client"

import { useStableId } from "@/hooks/use-stable-id"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bullet } from "@/components/ui/bullet"
import type { Simulation } from "@/types/simulation"
import { cn } from "@/lib/utils"

interface SimulationVisualizerProps {
  simulation: Simulation
}

export function SimulationVisualizer({ simulation }: SimulationVisualizerProps) {
  const gradientId = useStableId("sim-gradient")
  const glowId = useStableId("sim-glow")

  const statusConfig = {
    pending: { color: "var(--color-muted-foreground)", label: "[READY]" },
    running: { color: "var(--color-chart-1)", label: "[RUNNING]" },
    completed: { color: "var(--color-success)", label: "[COMPLETED]" },
    failed: { color: "var(--color-destructive)", label: "[FAILED]" },
  }

  const config = statusConfig[simulation.status]
  const progressPercent = (simulation.currentStep / simulation.totalSteps) * 100

  return (
    <Card className="relative overflow-hidden border-2 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-display uppercase mb-1">{simulation.name}</h3>
          <p className="text-xs text-muted-foreground uppercase flex items-center gap-2">
            <Bullet />
            Vault: {simulation.vaultName}
          </p>
        </div>
        <Badge
          variant="outline"
          className="font-mono text-xs"
          style={{ backgroundColor: `${config.color}20`, color: config.color, borderColor: config.color }}
        >
          {config.label}
        </Badge>
      </div>

      {/* Progress Circle Visualization */}
      <div className="relative w-full h-64 flex items-center justify-center mb-6">
        <svg className="w-full h-full max-w-xs" viewBox="0 0 200 200">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={config.color} stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />

          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 80}`}
            strokeDashoffset={`${2 * Math.PI * 80 * (1 - progressPercent / 100)}`}
            transform="rotate(-90 100 100)"
          />

          {/* Outer ring */}
          {simulation.status === "running" && (
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={config.color}
              strokeWidth="2"
              strokeDasharray="10 10"
              opacity="0.3"
            />
          )}

          {/* Center text */}
          <text
            x="100"
            y="95"
            textAnchor="middle"
            className="text-4xl font-display fill-foreground"
          >
            {Math.round(progressPercent)}%
          </text>
          <text
            x="100"
            y="115"
            textAnchor="middle"
            className="text-xs fill-muted-foreground uppercase"
          >
            Step {simulation.currentStep}/{simulation.totalSteps}
          </text>
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-accent/50 rounded p-3">
          <p className="text-xs text-muted-foreground uppercase mb-1">Total Steps</p>
          <p className="text-xl font-display">{simulation.totalSteps}</p>
        </div>
        <div className="bg-accent/50 rounded p-3">
          <p className="text-xs text-muted-foreground uppercase mb-1">Current</p>
          <p className="text-xl font-display text-chart-1">{simulation.currentStep}</p>
        </div>
        <div className="bg-accent/50 rounded p-3">
          <p className="text-xs text-muted-foreground uppercase mb-1">Status</p>
          <div className={cn("size-4 rounded-full animate-pulse")} style={{ backgroundColor: config.color }} />
        </div>
      </div>
    </Card>
  )
}

