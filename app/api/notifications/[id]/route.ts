import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TABLES } from "@/lib/supabase/constants"

/**
 * Delete notification
 * DELETE /api/notifications/[id]
 */
export async function DELETE(
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

    // Delete notification (activity log)
    const { error } = await supabase
      .from(TABLES.ACTIVITY_LOGS)
      .delete()
      .eq("id", notificationId)
      .eq("wallet_address", walletAddress.toLowerCase())

    if (error) {
      console.error("Error deleting notification:", error)
      return NextResponse.json(
        { error: "Failed to delete notification" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting notification:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete notification" },
      { status: 500 }
    )
  }
}

