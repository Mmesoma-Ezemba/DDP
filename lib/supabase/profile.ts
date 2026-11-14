/**
 * Profile Operations for Supabase
 * Fetches real-time user profile data
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import { TABLES } from "./constants"
import type { UserProfile, ProfileStats } from "@/types/profile"

/**
 * Get user profile by wallet address
 */
export async function getUserProfile(
  supabaseClient: SupabaseClient,
  walletAddress: string
): Promise<UserProfile | null> {
  try {
    const walletLower = walletAddress.toLowerCase()

    // Fetch user profile
    const { data: profile, error } = await supabaseClient
      .from(TABLES.USERS)
      .select("*")
      .eq("wallet_address", walletLower)
      .maybeSingle()

    if (error) {
      console.error("Error fetching user profile:", error)
      return null
    }

    if (!profile) {
      return null
    }

    // Fetch vaults for stats
    const { data: vaults } = await supabaseClient
      .from(TABLES.VAULTS)
      .select("id, created_at, status")
      .eq("owner_wallet", walletLower)

    const vaultsList = vaults || []

    // Fetch beneficiaries
    const { data: beneficiaries } = await supabaseClient
      .from(TABLES.BENEFICIARIES)
      .select("id")
      .in(
        "vault_id",
        vaultsList.map((v) => v.id)
      )

    const beneficiariesList = beneficiaries || []

    // Fetch activity logs for stats
    const { data: activities } = await supabaseClient
      .from(TABLES.ACTIVITY_LOGS)
      .select("id, created_at, activity_type")
      .eq("wallet_address", walletLower)
      .order("created_at", { ascending: false })
      .limit(1000)

    const activitiesList = activities || []

    // Calculate stats
    const stats: ProfileStats = {
      vaultsCreated: vaultsList.length,
      beneficiariesAdded: beneficiariesList.length,
      totalAssetsSecured: "0", // Will be calculated from vault metadata
      daysSinceJoined: Math.floor(
        (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
      ),
      heartbeatsThisMonth: activitiesList.filter(
        (a) => a.activity_type === "heartbeat" &&
        new Date(a.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      activitiesLogged: activitiesList.length,
    }

    // Calculate total assets from vault metadata
    let totalAssets = 0
    vaultsList.forEach((vault: any) => {
      if (vault.metadata && typeof vault.metadata === "object") {
        const assets = (vault.metadata as any).assets || []
        if (Array.isArray(assets)) {
          assets.forEach((asset: any) => {
            if (asset.value && typeof asset.value === "number") {
              totalAssets += asset.value
            }
          })
        }
      }
    })

    // Format assets
    if (totalAssets >= 1000000) {
      stats.totalAssetsSecured = `${(totalAssets / 1000000).toFixed(1)}M`
    } else if (totalAssets >= 1000) {
      stats.totalAssetsSecured = `${(totalAssets / 1000).toFixed(1)}K`
    } else {
      stats.totalAssetsSecured = totalAssets.toString()
    }

    // Extract metadata
    const metadata = profile.metadata || {}
    const name = metadata.name || profile.username || "User"
    const avatar = metadata.avatar_url || profile.avatar_url || "/placeholder.svg"

    // Build profile object
    const userProfile: UserProfile = {
      id: profile.id,
      username: profile.username || walletAddress.slice(0, 8),
      displayName: name.toUpperCase(),
      email: profile.email || "",
      walletAddress: profile.wallet_address,
      avatar,
      bio: metadata.bio || "",
      location: metadata.location || "Auto-detected",
      website: metadata.website || "",
      twitter: metadata.twitter || "",
      joinedDate: profile.created_at,
      lastActive: profile.last_active || profile.updated_at,
      stats,
      achievements: metadata.achievements || [],
    }

    return userProfile
  } catch (error: any) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

/**
 * Get simplified user data for sidebar
 */
export async function getSidebarUserData(
  supabaseClient: SupabaseClient,
  walletAddress: string
): Promise<{ name: string; email: string; avatar: string } | null> {
  try {
    const walletLower = walletAddress.toLowerCase()

    const { data: profile, error } = await supabaseClient
      .from(TABLES.USERS)
      .select("*")
      .eq("wallet_address", walletLower)
      .maybeSingle()

    if (error || !profile) {
      return {
        name: walletAddress.slice(0, 8).toUpperCase(),
        email: "",
        avatar: "/placeholder.svg",
      }
    }

    const metadata = profile.metadata || {}
    const name = metadata.name || profile.username || walletAddress.slice(0, 8).toUpperCase()
    const avatar = metadata.avatar_url || profile.avatar_url || "/placeholder.svg"

    return {
      name: name.toUpperCase(),
      email: profile.email || "",
      avatar,
    }
  } catch (error) {
    console.error("Error fetching sidebar user data:", error)
    return {
      name: walletAddress.slice(0, 8).toUpperCase(),
      email: "",
      avatar: "/placeholder.svg",
    }
  }
}

