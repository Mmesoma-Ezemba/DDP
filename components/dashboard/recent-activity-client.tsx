"use client"

import { useEffect, useState } from "react"
import RebelsRanking from "@/components/dashboard/rebels-ranking"
import type { RebelRanking } from "@/types/dashboard"

export function RecentActivityClient() {
  const [activity, setActivity] = useState<RebelRanking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch("/api/activity/recent?limit=5")
        if (response.ok) {
          const data = await response.json()
          setActivity(data.activity || [])
        }
      } catch (error) {
        console.error("Error fetching recent activity:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivity()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-xs text-muted-foreground uppercase">Loading...</p>
        </div>
      </div>
    )
  }

  return <RebelsRanking rebels={activity} />
}

