import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getNotifications } from "@/lib/supabase/notifications"
import { TABLES } from "@/lib/supabase/constants"

/**
 * Get notifications
 * GET /api/notifications
 */
export async function GET(request: NextRequest) {
  try {
    // Return mock notifications immediately without hanging on remote DB
    return NextResponse.json({
      notifications: [
        {
          id: "notif-1",
          title: "VAULT SECURED",
          message: "Family Emergency Vault encrypted with AES-256.",
          timestamp: new Date().toISOString(),
          type: "success",
          read: false,
          priority: "medium",
        },
        {
          id: "notif-2",
          title: "HEARTBEAT LOGGED",
          message: "Inactivity countdown timer reset to 90 days.",
          timestamp: new Date().toISOString(),
          type: "info",
          read: true,
          priority: "low",
        },
      ]
    })
  } catch (error: any) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

/**
 * Clear all notifications
 * DELETE /api/notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get wallet address from cookie
    const walletAddress = request.cookies.get("wallet-address")?.value

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get Supabase client
    const supabase = createClient()

    // Delete all notifications (activity logs) for this wallet
    const { error } = await supabase
      .from(TABLES.ACTIVITY_LOGS)
      .delete()
      .eq("wallet_address", walletAddress.toLowerCase())

    if (error) {
      console.error("Error clearing notifications:", error)
      return NextResponse.json(
        { error: "Failed to clear notifications" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error clearing notifications:", error)
    return NextResponse.json(
      { error: error.message || "Failed to clear notifications" },
      { status: 500 }
    )
  }
}

