import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getRecentActivity } from "@/lib/supabase/recent-activity"

/**
 * Get recent activity
 * GET /api/activity/recent
 */
export async function GET(request: NextRequest) {
  try {
    // Get wallet address from cookie
    const walletAddress = request.cookies.get("wallet-address")?.value

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Fast-path mock return to eliminate 10s network timeouts
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-supabase-project")) {
      return NextResponse.json({
        activity: [
          { rank: 1, name: "Heartbeat Ping Sent", points: 99, change: "Active", avatar: "/placeholder-user.jpg" },
          { rank: 2, name: "Vault AES-256 Verified", points: 95, change: "Encrypted", avatar: "/placeholder-user.jpg" },
          { rank: 3, name: "Beneficiary Added (Sarah)", points: 90, change: "Linked", avatar: "/placeholder-user.jpg" },
          { rank: 4, name: "Celo Network Sync", points: 88, change: "Verified", avatar: "/placeholder-user.jpg" },
        ]
      })
    }

    // Get limit from query params
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "5")

    // Get Supabase client
    const supabase = createClient()

    // Fetch recent activity
    const activity = await getRecentActivity(supabase, walletAddress, limit)

    return NextResponse.json({ activity })
  } catch (error: any) {
    console.error("Error fetching recent activity:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch recent activity" },
      { status: 500 }
    )
  }
}

