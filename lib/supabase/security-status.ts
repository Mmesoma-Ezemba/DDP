/**
 * Security Status Operations for Supabase
 * Calculates security status from vaults and activity
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import { TABLES } from "./constants"
import type { SecurityStatus as SecurityStatusType } from "@/types/dashboard"

/**
 * Get security status for dashboard
 */
export async function getSecurityStatus(
  supabaseClient: SupabaseClient,
  walletAddress: string
): Promise<SecurityStatusType[]> {
  try {
    const walletLower = walletAddress.toLowerCase()

    // Fetch vaults
    const { data: vaults, error: vaultsError } = await supabaseClient
      .from(TABLES.VAULTS)
      .select("id, status, created_at, inactivity_threshold")
      .eq("owner_wallet", walletLower)

    if (vaultsError) {
      console.error("Error fetching vaults for security status:", vaultsError)
    }

    const vaultsList = vaults || []

    // Fetch recent heartbeats
    const { data: heartbeats, error: heartbeatsError } = await supabaseClient
      .from(TABLES.ACTIVITY_LOGS)
      .select("created_at")
      .eq("wallet_address", walletLower)
      .eq("activity_type", "heartbeat")
      .order("created_at", { ascending: false })
      .limit(1)

    if (heartbeatsError) {
      console.error("Error fetching heartbeats:", heartbeatsError)
    }

    const lastHeartbeat = heartbeats && heartbeats.length > 0 ? heartbeats[0] : null

    // Calculate security metrics
    const activeVaults = vaultsList.filter((v) => v.status === "active").length
    const totalVaults = vaultsList.length
    const inactiveVaults = vaultsList.filter((v) => v.status === "inactive" || v.status === "triggered").length

    // Calculate days since last heartbeat
    let daysSinceHeartbeat = 0
    if (lastHeartbeat) {
      const lastHeartbeatDate = new Date(lastHeartbeat.created_at)
      const now = new Date()
      daysSinceHeartbeat = Math.floor((now.getTime() - lastHeartbeatDate.getTime()) / (1000 * 60 * 60 * 24))
    } else {
      daysSinceHeartbeat = 999 // No heartbeat ever recorded
    }

    // Build security status items
    const statuses: SecurityStatusType[] = [
      {
        title: "Active Vaults",
        value: activeVaults.toString(),
        status: `${totalVaults} Total`,
        variant: activeVaults > 0 ? "success" : "warning",
      },
      {
        title: "Last Heartbeat",
        value: lastHeartbeat ? `${daysSinceHeartbeat}d` : "Never",
        status: lastHeartbeat
          ? daysSinceHeartbeat === 0
            ? "Today"
            : daysSinceHeartbeat === 1
            ? "Yesterday"
            : `${daysSinceHeartbeat} days ago`
          : "No heartbeat recorded",
        variant: daysSinceHeartbeat <= 7 ? "success" : daysSinceHeartbeat <= 30 ? "warning" : "destructive",
      },
      {
        title: "System Status",
        value: inactiveVaults === 0 ? "Operational" : "Warning",
        status: inactiveVaults === 0 ? "All systems normal" : `${inactiveVaults} inactive vaults`,
        variant: inactiveVaults === 0 ? "success" : "warning",
      },
    ]

    return statuses
  } catch (error: any) {
    console.error("Error fetching security status:", error)
    // Return default statuses on error
    return [
      {
        title: "Active Vaults",
        value: "0",
        status: "No vaults",
        variant: "warning",
      },
      {
        title: "Last Heartbeat",
        value: "Never",
        status: "No heartbeat recorded",
        variant: "destructive",
      },
      {
        title: "System Status",
        value: "Unknown",
        status: "Unable to fetch status",
        variant: "warning",
      },
    ]
  }
}

