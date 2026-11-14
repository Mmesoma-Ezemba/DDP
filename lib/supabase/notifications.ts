/**
 * Notifications Operations for Supabase
 * Fetches real-time notifications from activity logs
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import { TABLES } from "./constants"
import type { Notification } from "@/types/dashboard"

/**
 * Get notifications from activity logs
 */
export async function getNotifications(
  supabaseClient: SupabaseClient,
  walletAddress: string,
  limit: number = 10
): Promise<Notification[]> {
  try {
    const walletLower = walletAddress.toLowerCase()

    // Fetch recent activity logs
    const { data: activities, error } = await supabaseClient
      .from(TABLES.ACTIVITY_LOGS)
      .select("*")
      .eq("wallet_address", walletLower)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching notifications:", error)
      return []
    }

    if (!activities || activities.length === 0) {
      return []
    }

    // Convert activity logs to notifications
    const notifications: Notification[] = activities.map((activity: any) => {
      const activityType = activity.activity_type || activity.action || "info"
      
      // Map activity types to notification types
      let notificationType: "info" | "warning" | "success" | "error" = "info"
      let title = "Activity"
      let message = activity.description || activity.action || "New activity"

      switch (activityType) {
        case "login":
          notificationType = "success"
          title = "Login Detected"
          message = "You successfully logged in"
          break
        case "vault_created":
          notificationType = "success"
          title = "Vault Created"
          message = activity.description || "A new vault was created"
          break
        case "vault_triggered":
          notificationType = "error"
          title = "Vault Triggered"
          message = activity.description || "A vault has been triggered"
          break
        case "inactivity_warning":
          notificationType = "warning"
          title = "Inactivity Warning"
          message = activity.description || "Inactivity detected"
          break
        case "heartbeat":
          notificationType = "success"
          title = "Heartbeat Recorded"
          message = "Your heartbeat signal was recorded"
          break
        case "beneficiary_added":
          notificationType = "info"
          title = "Beneficiary Added"
          message = activity.description || "A new beneficiary was added"
          break
        case "system_update":
          notificationType = "info"
          title = "System Update"
          message = activity.description || "System has been updated"
          break
        default:
          notificationType = "info"
          title = "Activity"
          message = activity.description || activity.action || "New activity"
      }

      return {
        id: activity.id,
        title,
        message,
        timestamp: activity.created_at,
        type: notificationType,
        read: false, // You can add a read status field to activity_logs if needed
        priority: activityType === "vault_triggered" || activityType === "inactivity_warning" ? "high" : "medium",
      }
    })

    return notifications
  } catch (error: any) {
    console.error("Error fetching notifications:", error)
    return []
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  supabaseClient: SupabaseClient,
  notificationId: string
): Promise<boolean> {
  try {
    // For now, we'll just return true
    // In the future, you can add a read_status field to activity_logs
    return true
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return false
  }
}

