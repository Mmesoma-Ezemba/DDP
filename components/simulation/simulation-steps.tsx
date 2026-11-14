"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bullet } from "@/components/ui/bullet"
import ShieldCheckIcon from "@/components/icons/shield-check"
import TimerIcon from "@/components/icons/timer"
import ZapIcon from "@/components/icons/zap"
import type { SimulationStep } from "@/types/simulation"
import { cn } from "@/lib/utils"

interface SimulationStepsProps {
  steps: SimulationStep[]
}

export function SimulationSteps({ steps }: SimulationStepsProps) {
  const statusConfig = {
    pending: { color: "text-muted-foreground", bg: "bg-muted/10", icon: TimerIcon },
    "in-progress": { color: "text-chart-1", bg: "bg-chart-1/10", icon: ZapIcon },
    completed: { color: "text-success", bg: "bg-success/10", icon: ShieldCheckIcon },
    failed: { color: "text-destructive", bg: "bg-destructive/10", icon: ShieldCheckIcon },
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-display uppercase mb-6 flex items-center gap-2">
        <Bullet />
        Simulation Steps
      </h3>

      <div className="space-y-0">
        {steps.map((step, index) => {
          const config = statusConfig[step.status]
          const Icon = config.icon

          return (
            <div key={step.id} className="group relative">
              {/* Connecting line */}
              <div
                className={cn(
                  "absolute left-6 top-12 bottom-0 w-0.5 transition-colors",
                  step.status === "completed" ? "bg-success" : "bg-border",
                  index === steps.length - 1 && "hidden"
                )}
              />

              <div className="flex gap-4 pb-6">
                {/* Step number & icon */}
                <div
                  className={cn(
                    "relative z-10 p-3 rounded-lg shrink-0 transition-all duration-300 border-2",
                    config.bg,
                    step.status === "in-progress" && "animate-pulse",
                    step.status === "completed" && "border-success/30",
                    step.status === "in-progress" && "border-chart-1/30",
                    step.status === "pending" && "border-border"
                  )}
                >
                  <Icon className={cn("size-5", config.color)} />

                  {/* Pulse ring for in-progress */}
                  {step.status === "in-progress" && (
                    <div className="absolute inset-0 rounded-lg">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="48"
                          fill="none"
                          stroke="var(--color-chart-1)"
                          strokeWidth="2"
                          opacity="0.3"
                        >
                          <animate attributeName="r" values="48;52;48" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                        </circle>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "bg-accent/50 border rounded-lg p-4 transition-all duration-300",
                    step.status === "in-progress" && "border-chart-1/50 shadow-lg shadow-chart-1/10",
                    step.status === "completed" && "border-success/30",
                    step.status === "pending" && "border-border"
                  )}>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <Badge variant="outline" className="font-mono text-xs shrink-0">
                            STEP {index + 1}
                          </Badge>
                          <h4 className="font-display text-sm">{step.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 font-mono text-xs", config.color)}
                      >
                        {step.status.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Progress bar */}
                    {step.status === "in-progress" && (
                      <div className="mb-3">
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-chart-1 transition-all duration-500 relative"
                            style={{ width: `${step.progress}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                          </div>
                        </div>
                        <p className="text-xs text-chart-1 mt-1 font-mono">{step.progress}%</p>
                      </div>
                    )}

                    {/* Details */}
                    {step.details && step.details.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                        {step.details.map((detail, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Bullet className="size-1 shrink-0" />
                            <span className="text-muted-foreground">{detail}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Transaction hash */}
                    {step.transactionHash && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Transaction Hash:</p>
                        <p className="text-xs font-mono text-chart-2">{step.transactionHash}</p>
                      </div>
                    )}

                    {/* Duration */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <TimerIcon className="size-3" />
                      <span>Duration: ~{step.duration}s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </Card>
  )
}

