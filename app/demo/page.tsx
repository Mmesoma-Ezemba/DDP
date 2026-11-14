"use client"

import { useState } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { SimulationVisualizer } from "@/components/simulation/simulation-visualizer"
import { SimulationSteps } from "@/components/simulation/simulation-steps"
import { ScenarioSelector } from "@/components/simulation/scenario-selector"
import { AnimatedBackground } from "@/components/vaults/animated-background"
import { TechDecoration } from "@/components/vaults/tech-decoration"
import { DataStream } from "@/components/vaults/data-stream"
import { CircuitLines } from "@/components/vaults/circuit-lines"
import EmailIcon from "@/components/icons/email"
import PlayIcon from "@/components/icons/play"
import FastForwardIcon from "@/components/icons/fast-forward"
import StopCircleIcon from "@/components/icons/stop-circle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bullet } from "@/components/ui/bullet"
import { mockSimulationScenarios, mockSimulation } from "@/data/simulation-mock"
import type { SimulationScenario, Simulation } from "@/types/simulation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function SimulateDemoPage() {
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null)
  const [simulation, setSimulation] = useState<Simulation>(mockSimulation)
  const [isRunning, setIsRunning] = useState(false)

  const handleSelectScenario = (scenario: SimulationScenario) => {
    setSelectedScenario(scenario)
    // TODO: Initialize simulation with scenario
  }

  const handleStartSimulation = () => {
    if (!selectedScenario) {
      toast.error("Please select a scenario first")
      return
    }
    setIsRunning(true)
    setSimulation({ ...simulation, status: "running" })
    toast.success("Simulation started")
  }

  const handleStopSimulation = () => {
    setIsRunning(false)
    setSimulation({ ...simulation, status: "pending" })
    toast.info("Simulation stopped")
  }

  const handleResetSimulation = () => {
    setIsRunning(false)
    setSelectedScenario(null)
    setSimulation({ ...mockSimulation, status: "pending", currentStep: 0 })
    toast.info("Simulation reset")
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Simulate Demo",
        description: "Test vault trigger mechanisms in a safe environment",
        icon: EmailIcon,
      }}
    >
      {/* Animated SVG Backgrounds */}
      <div className="fixed inset-0 -z-10">
        <AnimatedBackground />
        <DataStream />
      </div>

      {/* Header Decorations */}
      <div className="relative mb-6">
        <CircuitLines />
        <TechDecoration />
      </div>

      {/* Warning Banner - Responsive */}
      <Card className="mb-6 p-4 sm:p-6 border-2 border-chart-1/30 bg-chart-1/5">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="p-3 rounded-lg bg-chart-1/10 shrink-0">
            <PlayIcon className="size-6 text-chart-1" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-display mb-1 flex items-center gap-2">
              <Bullet />
              SIMULATION MODE
            </h3>
            <p className="text-sm text-muted-foreground">
              This is a safe testing environment. No actual vaults will be triggered, and no real assets will
              be transferred. All blockchain interactions are simulated on a test network.
            </p>
          </div>
          <Badge variant="outline" className="bg-chart-1/20 text-chart-1 border-chart-1/30 font-mono shrink-0">
            [DEMO]
          </Badge>
        </div>
      </Card>

      {/* Scenario Selection or Simulation */}
      {!selectedScenario ? (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-display uppercase mb-2 flex items-center gap-2">
              <Bullet />
              Select Simulation Scenario
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose a pre-configured scenario to test different vault trigger mechanisms
            </p>
          </div>

          <ScenarioSelector
            scenarios={mockSimulationScenarios}
            onSelect={handleSelectScenario}
            disabled={isRunning}
          />

          {/* Info Cards - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6">
            <Card className="p-4 bg-chart-1/5 border-chart-1/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded bg-chart-1/10">
                  <FastForwardIcon className="size-5 text-chart-1" />
                </div>
                <h4 className="font-display uppercase text-sm">Time Acceleration</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Simulations run at 1000x speed to quickly demonstrate inactivity triggers
              </p>
            </Card>

            <Card className="p-4 bg-success/5 border-success/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded bg-success/10">
                  <PlayIcon className="size-5 text-success" />
                </div>
                <h4 className="font-display uppercase text-sm">Safe Testing</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                All simulations run on test networks with no impact on real vaults or assets
              </p>
            </Card>

            <Card className="p-4 bg-chart-2/5 border-chart-2/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded bg-chart-2/10">
                  <StopCircleIcon className="size-5 text-chart-2" />
                </div>
                <h4 className="font-display uppercase text-sm">Full Control</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Pause, resume, or reset simulations at any time during the process
              </p>
            </Card>
          </div>
        </div>
      ) : (
        <div>
          {/* Control Panel */}
          <Card className="mb-6 p-6 border-2 border-primary/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-display uppercase mb-1 flex items-center gap-2">
                  <Bullet />
                  {selectedScenario.name}
                </h2>
                <p className="text-sm text-muted-foreground">{selectedScenario.description}</p>
              </div>

              <div className="flex items-center gap-3">
                {!isRunning ? (
                  <Button
                    onClick={handleStartSimulation}
                    size="lg"
                    className="uppercase font-mono"
                  >
                    <PlayIcon className="size-4 mr-2" />
                    Start Simulation
                  </Button>
                ) : (
                  <Button
                    onClick={handleStopSimulation}
                    size="lg"
                    variant="destructive"
                    className="uppercase font-mono"
                  >
                    <StopCircleIcon className="size-4 mr-2" />
                    Stop
                  </Button>
                )}

                <Button
                  onClick={handleResetSimulation}
                  variant="outline"
                  className="uppercase font-mono"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            {isRunning && (
              <div className="mt-4">
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full bg-gradient-to-r from-chart-1 via-chart-2 to-success transition-all duration-500 relative"
                    )}
                    style={{ width: `${(simulation.currentStep / simulation.totalSteps) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Visualization Grid - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
            {/* Visualizer - 1 column */}
            <div className="lg:col-span-1">
              <SimulationVisualizer simulation={simulation} />
            </div>

            {/* Steps - 2 columns */}
            <div className="lg:col-span-2">
              <SimulationSteps steps={simulation.steps} />
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="mt-6 bg-primary/5 border border-primary/20 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10 shrink-0">
            <EmailIcon className="size-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-display mb-2 flex items-center gap-2">
              <Bullet />
              ABOUT SIMULATION MODE
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Simulation Mode allows you to test and demonstrate the Decentralized Death Protocol without
              affecting real vaults or assets. All smart contract interactions are simulated, providing a safe
              environment to understand how vault triggers work when inactivity thresholds are reached.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-accent/50 rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FastForwardIcon className="size-3 text-chart-1" />
                  <p className="text-muted-foreground uppercase">Time Control</p>
                </div>
                <p className="font-mono">Accelerated Timeline (1000x)</p>
              </div>
              <div className="bg-accent/50 rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <PlayIcon className="size-3 text-success" />
                  <p className="text-muted-foreground uppercase">Safe Mode</p>
                </div>
                <p className="font-mono">Test Network Only</p>
              </div>
              <div className="bg-accent/50 rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <StopCircleIcon className="size-3 text-destructive" />
                  <p className="text-muted-foreground uppercase">Control</p>
                </div>
                <p className="font-mono">Pause/Resume Anytime</p>
              </div>
            </div>
          </div>
        </div>
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
    </DashboardPageLayout>
  )
}

