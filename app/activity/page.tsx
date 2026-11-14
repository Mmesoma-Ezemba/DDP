"use client"

import { useState } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { HeartbeatMonitor } from "@/components/activity/heartbeat-monitor"
import { ActivityTimeline } from "@/components/activity/activity-timeline"
import { AnimatedBackground } from "@/components/vaults/animated-background"
import { TechDecoration } from "@/components/vaults/tech-decoration"
import { DataStream } from "@/components/vaults/data-stream"
import { CircuitLines } from "@/components/vaults/circuit-lines"
import CuteRobotIcon from "@/components/icons/cute-robot"
import HeartIcon from "@/components/icons/heart"
import ActivityIcon from "@/components/icons/activity"
import ZapIcon from "@/components/icons/zap"
import TimerIcon from "@/components/icons/timer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bullet } from "@/components/ui/bullet"
import {
  mockActivities,
  mockHeartbeatData,
  mockActivityStats,
  mockInactivityPeriods,
} from "@/data/activities-mock"
import type { ActivityType } from "@/types/activity"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function ActivityTrackerPage() {
  const [filter, setFilter] = useState<ActivityType | "all">("all")

  const filteredActivities =
    filter === "all" ? mockActivities : mockActivities.filter((a) => a.type === filter)

  const stats = mockActivityStats

  // Determine heartbeat status
  const heartbeatStatus =
    stats.daysSinceActive === 0 ? "active" : stats.daysSinceActive < 7 ? "warning" : "critical"

  const handleSendHeartbeat = () => {
    toast.success("Heartbeat signal sent successfully")
  }

  const handleViewAllActivities = () => {
    toast.info("Viewing all activities")
  }

  const handleConfigureThreshold = () => {
    toast.info("Configure inactivity threshold dialog coming soon")
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Activity Tracker",
        description: "Monitor your digital legacy heartbeat",
        icon: CuteRobotIcon,
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

      {/* Stats Bar - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-accent/50 rounded-lg p-4 border border-border/50 hover:border-success/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-2">
                <Bullet />
                Last Heartbeat
              </p>
              <p className="text-2xl font-display text-success">{stats.lastHeartbeat}</p>
            </div>
            <div className="p-3 rounded-lg bg-success/10">
              <HeartIcon className="size-6 text-success animate-pulse" />
            </div>
          </div>
        </div>

        <div className="bg-accent/50 rounded-lg p-4 border border-border/50 hover:border-chart-2/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-2">
                <Bullet />
                Total Activities
              </p>
              <p className="text-2xl font-display">{stats.totalActivities}</p>
            </div>
            <Badge variant="outline" className="bg-chart-2/20 text-chart-2 border-chart-2/30">
              [TRACKED]
            </Badge>
          </div>
        </div>

        <div className="bg-accent/50 rounded-lg p-4 border border-border/50 hover:border-chart-1/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-2">
                <Bullet />
                This Week
              </p>
              <p className="text-2xl font-display text-chart-1">{stats.heartbeatsThisWeek}</p>
            </div>
            <div className="p-3 rounded-lg bg-chart-1/10">
              <ActivityIcon className="size-6 text-chart-1" />
            </div>
          </div>
        </div>

        <div
          className={cn(
            "bg-accent/50 rounded-lg p-4 border border-border/50 transition-colors",
            stats.inactivityWarnings > 0 ? "border-warning/50" : "border-border/50"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-2">
                <Bullet />
                Warnings
              </p>
              <p
                className={cn(
                  "text-2xl font-display",
                  stats.inactivityWarnings > 0 ? "text-warning" : ""
                )}
              >
                {stats.inactivityWarnings}
              </p>
            </div>
            {stats.inactivityWarnings > 0 && (
              <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
                [ALERT]
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Next Trigger Warning - Responsive */}
      {stats.nextTrigger && (
        <Card className="mb-6 p-4 sm:p-6 border-2 border-warning/30 bg-warning/5">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 rounded-lg bg-warning/10 shrink-0">
              <TimerIcon className="size-6 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-display mb-1 flex items-center gap-2">
                <Bullet />
                NEXT VAULT TRIGGER
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Your <span className="text-foreground font-mono">{stats.nextTrigger.vaultName}</span> will
                trigger in{" "}
                <span className="text-warning font-display text-lg">{stats.nextTrigger.daysRemaining}</span>{" "}
                days without activity
              </p>
              <Button
                onClick={handleSendHeartbeat}
                size="sm"
                className="uppercase font-mono bg-warning text-black hover:bg-warning/80"
              >
                <ZapIcon className="size-4 mr-2" />
                Send Heartbeat Now
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        {/* Heartbeat Monitor - Spans 2 columns */}
        <div className="lg:col-span-2">
          <HeartbeatMonitor data={mockHeartbeatData} status={heartbeatStatus} />
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-display uppercase mb-4 flex items-center gap-2">
            <Bullet />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Button
              onClick={handleSendHeartbeat}
              variant="default"
              className="w-full uppercase font-mono text-xs justify-start"
            >
              <ZapIcon className="size-4 mr-2" />
              Send Manual Heartbeat
            </Button>
            <Button
              onClick={handleViewAllActivities}
              variant="outline"
              className="w-full uppercase font-mono text-xs justify-start"
            >
              <ActivityIcon className="size-4 mr-2" />
              View All Activities
            </Button>
            <Button
              onClick={handleConfigureThreshold}
              variant="outline"
              className="w-full uppercase font-mono text-xs justify-start"
            >
              <TimerIcon className="size-4 mr-2" />
              Configure Inactivity Threshold
            </Button>
          </div>

          {/* Inactivity Periods */}
          {mockInactivityPeriods.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-display uppercase mb-3 flex items-center gap-2">
                <Bullet />
                Past Inactivity
              </h4>
              <div className="space-y-2">
                {mockInactivityPeriods.map((period, i) => (
                  <div key={i} className="bg-accent/30 rounded p-2 text-xs">
                    <p className="font-mono text-muted-foreground">
                      {new Date(period.startDate).toLocaleDateString()} -{" "}
                      {period.endDate ? new Date(period.endDate).toLocaleDateString() : "Ongoing"}
                    </p>
                    <p className="text-warning">
                      {period.durationDays} days • {period.vaultsAffected.length} vaults affected
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Activity Timeline */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as ActivityType | "all")} className="mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <TabsList>
            <TabsTrigger value="all">All Activities</TabsTrigger>
            <TabsTrigger value="heartbeat">Heartbeats</TabsTrigger>
            <TabsTrigger value="vault_created">Vaults</TabsTrigger>
            <TabsTrigger value="beneficiary_added">Beneficiaries</TabsTrigger>
            <TabsTrigger value="warning">Warnings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={filter} className="mt-0">
          <ActivityTimeline activities={filteredActivities} limit={10} />
        </TabsContent>
      </Tabs>

      {/* Info Panel */}
      <div className="mt-6 bg-chart-2/5 border border-chart-2/20 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-chart-2/10 shrink-0">
            <CuteRobotIcon className="size-6 text-chart-2" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-display mb-2 flex items-center gap-2">
              <Bullet />
              ABOUT ACTIVITY TRACKING
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The Activity Tracker monitors your wallet interactions and sends "heartbeat" signals to reset
              vault inactivity timers. Manual heartbeat signals can be sent anytime to prove activity. If no
              heartbeat is detected within your specified threshold, vault triggers will activate.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-accent/50 rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <HeartIcon className="size-3 text-success" />
                  <p className="text-muted-foreground uppercase">Automatic</p>
                </div>
                <p className="font-mono">Wallet Activity Detection</p>
              </div>
              <div className="bg-accent/50 rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ZapIcon className="size-3 text-warning" />
                  <p className="text-muted-foreground uppercase">Manual</p>
                </div>
                <p className="font-mono">On-Demand Heartbeat Ping</p>
              </div>
              <div className="bg-accent/50 rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TimerIcon className="size-3 text-chart-1" />
                  <p className="text-muted-foreground uppercase">Threshold</p>
                </div>
                <p className="font-mono">Customizable Per Vault</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  )
}

