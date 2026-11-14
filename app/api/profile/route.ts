import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/supabase/profile"
import { TABLES } from "@/lib/supabase/constants"

/**
 * Get user profile
 * GET /api/profile
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

    // If Supabase is placeholder, return instant mock profile to avoid 10s network timeout
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-supabase-project")) {
      return NextResponse.json({
        profile: {
          displayName: "Web3 Pioneer",
          username: "ddp_user",
          email: "user@ddp.network",
          avatar: "/placeholder-user.jpg"
        }
      })
    }

    // Get Supabase client
    const supabase = createClient()

    // Fetch profile data
    const profile = await getUserProfile(supabase, walletAddress)

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

/**
 * Update user profile
 * PATCH /api/profile
 */
export async function PATCH(request: NextRequest) {
  try {
    // Get wallet address from cookie
    const walletAddress = request.cookies.get("wallet-address")?.value

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { displayName, username, bio, website, twitter, location } = body

    // Get Supabase client
    const supabase = createClient()

    // Get current user profile
    const { data: currentProfile, error: fetchError } = await supabase
      .from(TABLES.USERS)
      .select("metadata")
      .eq("wallet_address", walletAddress.toLowerCase())
      .maybeSingle()

    if (fetchError) {
      console.error("Error fetching current profile:", fetchError)
      return NextResponse.json(
        { error: "Failed to fetch current profile" },
        { status: 500 }
      )
    }

    // Merge with existing metadata
    const currentMetadata = currentProfile?.metadata || {}
    const updatedMetadata = {
      ...currentMetadata,
      ...(displayName && { name: displayName }),
      ...(bio !== undefined && { bio }),
      ...(website !== undefined && { website }),
      ...(twitter !== undefined && { twitter }),
      ...(location !== undefined && { location }),
    }

    // Update user profile
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update({
        ...(username && { username }),
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq("wallet_address", walletAddress.toLowerCase())
      .select()
      .single()

    if (error) {
      console.error("Error updating profile:", error)
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      )
    }

    // Fetch updated profile
    const updatedProfile = await getUserProfile(supabase, walletAddress)

    return NextResponse.json({ profile: updatedProfile })
  } catch (error: any) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    )
  }
}
