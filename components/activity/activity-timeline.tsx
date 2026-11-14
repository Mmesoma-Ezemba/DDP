"use client"

import { Card } from "@/components/ui/card"
import { Bullet } from "@/components/ui/bullet"
import { ActivityItem } from "./activity-item"
import ActivityIcon from "@/components/icons/activity"
import type { Activity } from "@/types/activity"

interface ActivityTimelineProps {
  activities: Activity[]
  limit?: number
}

export function ActivityTimeline({ activities, limit }: ActivityTimelineProps) {
  const displayActivities = limit ? activities.slice(0, limit) : activities

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-chart-2/10">
          <ActivityIcon className="size-6 text-chart-2" />
        </div>
        <div>
          <h3 className="text-lg font-display uppercase">Activity Timeline</h3>
          <p className="text-xs text-muted-foreground uppercase flex items-center gap-2">
            <Bullet />
            Recent Actions & Events
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {displayActivities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>

      {limit && activities.length > limit && (
        <div className="text-center mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            +{activities.length - limit} more activities
          </p>
        </div>
      )}
    </Card>
  )
}

