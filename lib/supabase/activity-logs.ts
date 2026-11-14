/**
 * Activity Log Operations for Supabase
 * Tracks user activity, heartbeats, and system events
 */

import { supabase, TABLES } from "./client"
import type {
  ActivityLog,
  ActivityLogInsert,
  ActivityType,
  ActivityLogFilters,
  DeviceInfo,
  LocationInfo,
} from "./types"

// =====================================================
// CREATE OPERATIONS
// =====================================================

/**
 * Log user activity
 */
export async function logActivity(
  walletAddress: string,
  activityType: ActivityType,
  options?: {
    vaultId?: string
    description?: string
    deviceInfo?: DeviceInfo
    ipAddress?: string
    location?: LocationInfo
    metadata?: Record<string, any>
  }
): Promise<ActivityLog | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.ACTIVITY_LOGS)
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        activity_type: activityType,
        vault_id: options?.vaultId,
        description: options?.description,
        device_info: options?.deviceInfo || {},
        ip_address: options?.ipAddress,
        location: options?.location || {},
        metadata: options?.metadata || {},
      })
      .select()
      .single()

    if (error) {
      console.error("Error logging activity:", error)
      return null
    }

    return data as ActivityLog
  } catch (error: any) {
    console.error("Error logging activity:", error)
    return null
  }
}

/**
 * Log user login
 */
export async function logLogin(
  walletAddress: string,
  deviceInfo?: DeviceInfo,
  location?: LocationInfo
): Promise<ActivityLog | null> {
  return logActivity(walletAddress, "login", {
    description: "User logged in",
    deviceInfo,
    location,
  })
}

/**
 * Log user logout
 */
export async function logLogout(
  walletAddress: string
): Promise<ActivityLog | null> {
  return logActivity(walletAddress, "logout", {
    description: "User logged out",
  })
}

/**
 * Log heartbeat (user activity proof)
 */
export async function logHeartbeat(
  walletAddress: string,
  vaultId?: string,
  deviceInfo?: DeviceInfo,
  location?: LocationInfo
): Promise<ActivityLog | null> {
  return logActivity(walletAddress, "heartbeat", {
    vaultId,
    description: "Heartbeat recorded",
    deviceInfo,
    location,
  })
}

/**
 * Log vault creation
 */
export async function logVaultCreated(
  walletAddress: string,
  vaultId: string,
  vaultName: string
): Promise<ActivityLog | null> {
  return logActivity(walletAddress, "vault_created", {
    vaultId,
    description: `Vault "${vaultName}" created`,
  })
}

/**
 * Log vault update
 */
export async function logVaultUpdated(
  walletAddress: string,
  vaultId: string,
  changes: string[]
): Promise<ActivityLog | null> {
  return logActivity(walletAddress, "vault_updated", {
    vaultId,
    description: `Vault updated: ${changes.join(", ")}`,
    metadata: { changes },
  })
}

/**
 * Log vault trigger (deadman switch activated)
 */
export async function logVaultTriggered(
  walletAddress: string,
  vaultId: string,
  reason: string
): Promise<ActivityLog | null> {
  return logActivity(walletAddress, "vault_triggered", {
    vaultId,
    description: `Vault triggered: ${reason}`,
    metadata: { reason },
  })
}

/**
 * Log vault access by beneficiary
 */
export async function logVaultAccessed(
  walletAddress: string,
  vaultId: string,
  beneficiaryAddress: string
): Promise<ActivityLog | null> {
  return logActivity(walletAddress, "vault_accessed", {
    vaultId,
    description: `Vault accessed by beneficiary ${beneficiaryAddress}`,
    metadata: { beneficiary: beneficiaryAddress },
  })
}

/**
 * Log beneficiary addition
 */
export async function logBeneficiaryAdded(
  walletAddress: string,
  vaultId: string,
  beneficiaryAddress: string,
  beneficiaryName?: string
): Promise<ActivityLog | null> {
  return logActivity(walletAddress, "beneficiary_added", {
    vaultId,
    description: `Beneficiary ${beneficiaryName || beneficiaryAddress} added`,
    metadata: {
      beneficiary: beneficiaryAddress,
      name: beneficiaryName,
    },
  })
}

/**
 * Log beneficiary removal
 */
export async function logBeneficiaryRemoved(
  walletAddress: string,
  vaultId: string,
  beneficiaryAddress: string
): Promise<ActivityLog | null> {
  return logActivity(walletAddress, "beneficiary_removed", {
    vaultId,
    description: `Beneficiary ${beneficiaryAddress} removed`,
    metadata: { beneficiary: beneficiaryAddress },
  })
}

// =====================================================
// READ OPERATIONS
// =====================================================

/**
 * Get activity logs for a user
 */
export async function getUserActivityLogs(
  walletAddress: string,
  options?: {
    limit?: number
    offset?: number
    activityTypes?: ActivityType[]
    startDate?: string
    endDate?: string
  }
): Promise<ActivityLog[]> {
  try {
    let query = supabase
      .from(TABLES.ACTIVITY_LOGS)
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .order("created_at", { ascending: false })

    // Apply filters
    if (options?.activityTypes && options.activityTypes.length > 0) {
      query = query.in("activity_type", options.activityTypes)
    }
    if (options?.startDate) {
      query = query.gte("created_at", options.startDate)
    }
    if (options?.endDate) {
      query = query.lte("created_at", options.endDate)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 50) - 1
      )
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching activity logs:", error)
      return []
    }

    return (data as ActivityLog[]) || []
  } catch (error: any) {
    console.error("Error fetching activity logs:", error)
    return []
  }
}

/**
 * Get activity logs for a specific vault
 */
export async function getVaultActivityLogs(
  vaultId: string,
  limit?: number
): Promise<ActivityLog[]> {
  try {
    let query = supabase
      .from(TABLES.ACTIVITY_LOGS)
      .select("*")
      .eq("vault_id", vaultId)
      .order("created_at", { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching vault activity logs:", error)
      return []
    }

    return (data as ActivityLog[]) || []
  } catch (error: any) {
    console.error("Error fetching vault activity logs:", error)
    return []
  }
}

/**
 * Get recent activity logs (for dashboard)
 */
export async function getRecentActivity(
  walletAddress: string,
  limit: number = 10
): Promise<ActivityLog[]> {
  return getUserActivityLogs(walletAddress, { limit })
}

/**
 * Get activity logs by type
 */
export async function getActivityLogsByType(
  walletAddress: string,
  activityType: ActivityType,
  limit?: number
): Promise<ActivityLog[]> {
  return getUserActivityLogs(walletAddress, {
    activityTypes: [activityType],
    limit,
  })
}

/**
 * Get last heartbeat for a user
 */
export async function getLastHeartbeat(
  walletAddress: string,
  vaultId?: string
): Promise<ActivityLog | null> {
  try {
    let query = supabase
      .from(TABLES.ACTIVITY_LOGS)
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .eq("activity_type", "heartbeat")
      .order("created_at", { ascending: false })
      .limit(1)

    if (vaultId) {
      query = query.eq("vault_id", vaultId)
    }

    const { data, error } = await query.single()

    if (error) {
      console.error("Error fetching last heartbeat:", error)
      return null
    }

    return data as ActivityLog
  } catch (error: any) {
    console.error("Error fetching last heartbeat:", error)
    return null
  }
}

// =====================================================
// ANALYTICS & STATISTICS
// =====================================================

/**
 * Get activity statistics for a user
 */
export async function getUserActivityStats(
  walletAddress: string,
  days: number = 30
): Promise<{
  totalActivities: number
  heartbeats: number
  vaultOperations: number
  loginCount: number
  lastActive: string | null
}> {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const logs = await getUserActivityLogs(walletAddress, {
      startDate: startDate.toISOString(),
    })

    const heartbeats = logs.filter((l) => l.activity_type === "heartbeat").length
    const vaultOps = logs.filter((l) =>
      ["vault_created", "vault_updated", "vault_triggered"].includes(
        l.activity_type
      )
    ).length
    const logins = logs.filter((l) => l.activity_type === "login").length

    return {
      totalActivities: logs.length,
      heartbeats,
      vaultOperations: vaultOps,
      loginCount: logins,
      lastActive: logs.length > 0 ? logs[0].created_at : null,
    }
  } catch (error: any) {
    console.error("Error getting activity stats:", error)
    return {
      totalActivities: 0,
      heartbeats: 0,
      vaultOperations: 0,
      loginCount: 0,
      lastActive: null,
    }
  }
}

/**
 * Get activity heatmap data (for visualization)
 */
export async function getActivityHeatmap(
  walletAddress: string,
  days: number = 30
): Promise<Record<string, number>> {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const logs = await getUserActivityLogs(walletAddress, {
      startDate: startDate.toISOString(),
    })

    // Group by date
    const heatmap: Record<string, number> = {}
    logs.forEach((log) => {
      const date = new Date(log.created_at).toISOString().split("T")[0]
      heatmap[date] = (heatmap[date] || 0) + 1
    })

    return heatmap
  } catch (error: any) {
    console.error("Error getting activity heatmap:", error)
    return {}
  }
}

/**
 * Check if user is active (has recent heartbeat)
 */
export async function isUserActive(
  walletAddress: string,
  maxInactiveDays: number = 7
): Promise<boolean> {
  try {
    const lastHeartbeat = await getLastHeartbeat(walletAddress)

    if (!lastHeartbeat) return false

    const lastHeartbeatDate = new Date(lastHeartbeat.created_at)
    const now = new Date()
    const daysSinceHeartbeat = Math.floor(
      (now.getTime() - lastHeartbeatDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    return daysSinceHeartbeat <= maxInactiveDays
  } catch (error: any) {
    console.error("Error checking user activity:", error)
    return false
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get device info from request
 */
export function getDeviceInfoFromUserAgent(userAgent: string): DeviceInfo {
  const deviceInfo: DeviceInfo = {
    user_agent: userAgent,
  }

  // Simple browser detection
  if (userAgent.includes("Chrome")) deviceInfo.browser = "Chrome"
  else if (userAgent.includes("Firefox")) deviceInfo.browser = "Firefox"
  else if (userAgent.includes("Safari")) deviceInfo.browser = "Safari"
  else if (userAgent.includes("Edge")) deviceInfo.browser = "Edge"

  // Simple OS detection
  if (userAgent.includes("Windows")) deviceInfo.os = "Windows"
  else if (userAgent.includes("Mac")) deviceInfo.os = "macOS"
  else if (userAgent.includes("Linux")) deviceInfo.os = "Linux"
  else if (userAgent.includes("Android")) deviceInfo.os = "Android"
  else if (userAgent.includes("iOS")) deviceInfo.os = "iOS"

  // Device type
  if (userAgent.includes("Mobile")) deviceInfo.device_type = "mobile"
  else if (userAgent.includes("Tablet")) deviceInfo.device_type = "tablet"
  else deviceInfo.device_type = "desktop"

  return deviceInfo
}

/**
 * Delete old activity logs (cleanup)
 */
export async function deleteOldActivityLogs(
  daysToKeep: number = 365
): Promise<number> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const { data, error } = await supabase
      .from(TABLES.ACTIVITY_LOGS)
      .delete()
      .lt("created_at", cutoffDate.toISOString())
      .select()

    if (error) {
      console.error("Error deleting old activity logs:", error)
      return 0
    }

    return data?.length || 0
  } catch (error: any) {
    console.error("Error deleting old activity logs:", error)
    return 0
  }
}
