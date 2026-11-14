"use client"

import { useEffect, useState } from "react"
import DashboardStat from "@/components/dashboard/stat"
import GearIcon from "@/components/icons/gear"
import ProcessorIcon from "@/components/icons/proccesor"
import BoomIcon from "@/components/icons/boom"
import type { DashboardStat as DashboardStatType } from "@/types/dashboard"

interface OverviewStatsProps {
  initialStats: DashboardStatType[]
}

// Icon mapping
const iconMap = {
  gear: GearIcon,
  proccesor: ProcessorIcon,
  boom: BoomIcon,
}

export function OverviewStats({ initialStats }: OverviewStatsProps) {
  const [stats, setStats] = useState(initialStats)

  if (stats.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
      {stats.map((stat, index) => (
        <DashboardStat
          key={index}
          label={stat.label}
          value={stat.value}
          description={stat.description}
          icon={iconMap[stat.icon as keyof typeof iconMap]}
          tag={stat.tag}
          intent={stat.intent}
          direction={stat.direction}
        />
      ))}
    </div>
  )
}

