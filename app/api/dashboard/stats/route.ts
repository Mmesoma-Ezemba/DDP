import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getDashboardData } from "@/lib/supabase/dashboard"

/**
 * Get dashboard statistics
 * GET /api/dashboard/stats
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

    // Fast-path mock return to eliminate 10-second timeout hangs during demo
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-supabase-project")) {
      return NextResponse.json({
        stats: [
          { label: "Total Assets Secured", value: "$250,000", change: "+12.5%", icon: "boom" },
          { label: "Active Vaults", value: "3", change: "100% Secure", icon: "gear" },
          { label: "Beneficiaries Linked", value: "4", change: "Verified", icon: "proccesor" }
        ],
        chartData: [],
        totalVaults: 3,
        totalBeneficiaries: 4,
        totalAssets: 250000,
        inactiveVaults: 0,
      })
    }

    // Get Supabase client
    const supabase = createClient()

    // Fetch dashboard data
    const dashboardData = await getDashboardData(supabase, walletAddress)

    return NextResponse.json({
      stats: dashboardData.stats,
      chartData: dashboardData.chartData,
      totalVaults: dashboardData.totalVaults,
      totalBeneficiaries: dashboardData.totalBeneficiaries,
      totalAssets: dashboardData.totalAssets,
      inactiveVaults: dashboardData.inactiveVaults,
    })
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}

