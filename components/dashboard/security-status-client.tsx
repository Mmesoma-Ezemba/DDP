"use client"

import { useEffect, useState } from "react"
import SecurityStatus from "@/components/dashboard/security-status"
import type { SecurityStatus as SecurityStatusType } from "@/types/dashboard"

export function SecurityStatusClient() {
  const [statuses, setStatuses] = useState<SecurityStatusType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/security/status")
        if (response.ok) {
          const data = await response.json()
          setStatuses(data.statuses || [])
        }
      } catch (error) {
        console.error("Error fetching security status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatus()
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

  return <SecurityStatus statuses={statuses} />
}

