"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bullet } from "@/components/ui/bullet"
import type { SimulationScenario } from "@/types/simulation"
import { cn } from "@/lib/utils"

interface ScenarioSelectorProps {
  scenarios: SimulationScenario[]
  onSelect: (scenario: SimulationScenario) => void
  disabled?: boolean
}

export function ScenarioSelector({ scenarios, onSelect, disabled }: ScenarioSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {scenarios.map((scenario) => (
        <Card
          key={scenario.id}
          className={cn(
            "group relative overflow-hidden border-2 transition-all duration-300",
            scenario.recommended && "border-chart-1/30",
            !disabled && "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {/* Animated background */}
          {!disabled && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
                }}
              />
            </div>
          )}

          {/* Recommended badge */}
          {scenario.recommended && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-chart-1/20 text-chart-1 border-chart-1/30 font-mono text-xs">
                ⭐ RECOMMENDED
              </Badge>
            </div>
          )}

          <div className="relative p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl shrink-0">{scenario.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-display mb-1">{scenario.name}</h3>
                <p className="text-xs text-muted-foreground">{scenario.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-accent/50 rounded p-2">
                <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-1">
                  <Bullet className="size-1" />
                  Duration
                </p>
                <p className="text-sm font-mono">{scenario.duration}</p>
              </div>
              <div className="bg-accent/50 rounded p-2">
                <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-1">
                  <Bullet className="size-1" />
                  Steps
                </p>
                <p className="text-sm font-mono">{scenario.steps}</p>
              </div>
            </div>

            <Button
              onClick={() => onSelect(scenario)}
              disabled={disabled}
              className="w-full uppercase font-mono text-xs"
              variant={scenario.recommended ? "default" : "outline"}
            >
              Select Scenario
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

