import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSecurityStatus } from "@/lib/supabase/security-status"

/**
 * Get security status
 * GET /api/security/status
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      statuses: [
        { label: "AES-256 GCM", status: "Active", isSecure: true },
        { label: "Celo Network Sync", status: "Connected", isSecure: true },
        { label: "Pollar Wallet Abstraction", status: "Online", isSecure: true },
      ]
    })
  } catch (error: any) {
    console.error("Error fetching security status:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch security status" },
      { status: 500 }
    )
  }
}

