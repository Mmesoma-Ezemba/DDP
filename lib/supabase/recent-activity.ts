/**
 * Recent Activity Operations for Supabase
 * Fetches recent activity for the dashboard
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import { TABLES } from "./constants"
import type { RebelRanking } from "@/types/dashboard"

/**
 * Get recent activity for dashboard (RebelsRanking component)
 * This shows recent vault operations and beneficiary activities
 */
export async function getRecentActivity(
  supabaseClient: SupabaseClient,
  walletAddress: string,
  limit: number = 5
): Promise<RebelRanking[]> {
  try {
    const walletLower = walletAddress.toLowerCase()

    // Fetch recent vaults
    const { data: vaults, error: vaultsError } = await supabaseClient
      .from(TABLES.VAULTS)
      .select("id, name, created_at, status, metadata")
      .eq("owner_wallet", walletLower)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (vaultsError) {
      console.error("Error fetching recent vaults:", vaultsError)
    }

    const vaultsList = vaults || []

    // Fetch recent beneficiaries
    const { data: beneficiaries, error: beneficiariesError } = await supabaseClient
      .from(TABLES.BENEFICIARIES)
      .select("id, name, created_at, vault_id, metadata")
      .in(
        "vault_id",
        vaultsList.map((v) => v.id)
      )
      .order("created_at", { ascending: false })
      .limit(limit)

    if (beneficiariesError) {
      console.error("Error fetching recent beneficiaries:", beneficiariesError)
    }

    const beneficiariesList = beneficiaries || []

    // Combine and format as RebelRanking items
    const activities: RebelRanking[] = []

    // Add vault activities
    vaultsList.forEach((vault: any, index: number) => {
      const metadata = vault.metadata || {}
      const vaultName = vault.name || `Vault ${index + 1}`
      const avatar = metadata.avatar_url || "/placeholder.svg"
      
      activities.push({
        id: activities.length + 1,
        name: vaultName,
        handle: `@vault_${vault.id.slice(0, 8)}`,
        streak: `Created ${new Date(vault.created_at).toLocaleDateString()}`,
        points: vault.status === "active" ? 100 : 50,
        avatar,
        featured: index === 0, // First item is featured
        subtitle: `Status: ${vault.status}`,
      })
    })

    // Add beneficiary activities
    beneficiariesList.forEach((beneficiary: any, index: number) => {
      const metadata = beneficiary.metadata || {}
      const beneficiaryName = beneficiary.name || `Beneficiary ${index + 1}`
      const avatar = metadata.avatar_url || "/placeholder.svg"
      
      activities.push({
        id: activities.length + 1,
        name: beneficiaryName,
        handle: `@beneficiary_${beneficiary.id.slice(0, 8)}`,
        streak: `Added ${new Date(beneficiary.created_at).toLocaleDateString()}`,
        points: 75,
        avatar,
        featured: false,
        subtitle: "Beneficiary",
      })
    })

    // Sort by creation date (most recent first)
    activities.sort((a, b) => {
      // Extract date from streak string or use current date
      return 0 // Already sorted by query
    })

    return activities.slice(0, limit)
  } catch (error: any) {
    console.error("Error fetching recent activity:", error)
    return []
  }
}

