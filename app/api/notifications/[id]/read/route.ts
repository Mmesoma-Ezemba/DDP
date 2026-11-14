import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { markNotificationAsRead } from "@/lib/supabase/notifications"

/**
 * Mark notification as read
 * POST /api/notifications/[id]/read
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get wallet address from cookie
    const walletAddress = request.cookies.get("wallet-address")?.value

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const notificationId = params.id

    // Get Supabase client
    const supabase = createClient()

    // Mark notification as read
    const success = await markNotificationAsRead(supabase, notificationId)

    if (!success) {
      return NextResponse.json(
        { error: "Failed to mark notification as read" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json(
      { error: error.message || "Failed to mark notification as read" },
      { status: 500 }
    )
  }
}

