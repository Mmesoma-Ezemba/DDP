/**
 * Beneficiary Operations for Supabase
 * Manages vault beneficiaries and access control
 */

import { supabase, TABLES } from "./client"
import type {
  Beneficiary,
  BeneficiaryInsert,
  BeneficiaryUpdate,
  BeneficiaryWithVault,
  BeneficiaryFilters,
  UnlockCondition,
} from "./types"

// =====================================================
// CREATE OPERATIONS
// =====================================================

/**
 * Add a beneficiary to a vault
 */
export async function addBeneficiary(
  vaultId: string,
  beneficiaryData: {
    address: string
    name?: string
    unlockCondition?: UnlockCondition
    unlockDate?: string
    sharesPercentage?: number
    metadata?: Record<string, any>
  }
): Promise<Beneficiary | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.BENEFICIARIES)
      .insert({
        vault_id: vaultId,
        address: beneficiaryData.address.toLowerCase(),
        name: beneficiaryData.name,
        unlock_condition: beneficiaryData.unlockCondition || "inactivity",
        unlock_date: beneficiaryData.unlockDate,
        shares_percentage: beneficiaryData.sharesPercentage || 100.0,
        metadata: beneficiaryData.metadata || {},
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding beneficiary:", error)
      throw new Error(error.message)
    }

    return data as Beneficiary
  } catch (error: any) {
    console.error("Error adding beneficiary:", error)
    throw error
  }
}

/**
 * Add multiple beneficiaries to a vault
 */
export async function addBeneficiaries(
  vaultId: string,
  beneficiaries: Array<{
    address: string
    name?: string
    sharesPercentage?: number
  }>
): Promise<Beneficiary[]> {
  try {
    const beneficiariesToInsert = beneficiaries.map((b) => ({
      vault_id: vaultId,
      address: b.address.toLowerCase(),
      name: b.name,
      shares_percentage: b.sharesPercentage || 100.0 / beneficiaries.length,
      unlock_condition: "inactivity" as UnlockCondition,
    }))

    const { data, error } = await supabase
      .from(TABLES.BENEFICIARIES)
      .insert(beneficiariesToInsert)
      .select()

    if (error) {
      console.error("Error adding beneficiaries:", error)
      throw new Error(error.message)
    }

    return (data as Beneficiary[]) || []
  } catch (error: any) {
    console.error("Error adding beneficiaries:", error)
    throw error
  }
}

// =====================================================
// READ OPERATIONS
// =====================================================

/**
 * Get all beneficiaries for a vault
 */
export async function getVaultBeneficiaries(
  vaultId: string
): Promise<Beneficiary[]> {
  try {
    const { data, error } = await supabase
      .from(TABLES.BENEFICIARIES)
      .select("*")
      .eq("vault_id", vaultId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching beneficiaries:", error)
      return []
    }

    return (data as Beneficiary[]) || []
  } catch (error: any) {
    console.error("Error fetching beneficiaries:", error)
    return []
  }
}

/**
 * Get a specific beneficiary by ID
 */
export async function getBeneficiaryById(
  beneficiaryId: string
): Promise<Beneficiary | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.BENEFICIARIES)
      .select("*")
      .eq("id", beneficiaryId)
      .single()

    if (error) {
      console.error("Error fetching beneficiary:", error)
      return null
    }

    return data as Beneficiary
  } catch (error: any) {
    console.error("Error fetching beneficiary:", error)
    return null
  }
}

/**
 * Get all vaults where user is a beneficiary
 */
export async function getBeneficiaryAssignments(
  walletAddress: string
): Promise<BeneficiaryWithVault[]> {
  try {
    const { data, error } = await supabase
      .from("beneficiaries_with_vault")
      .select("*")
      .eq("address", walletAddress.toLowerCase())
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching beneficiary assignments:", error)
      return []
    }

    return (data as BeneficiaryWithVault[]) || []
  } catch (error: any) {
    console.error("Error fetching beneficiary assignments:", error)
    return []
  }
}

/**
 * Get triggered vaults accessible by a beneficiary
 */
export async function getAccessibleVaults(
  walletAddress: string
): Promise<BeneficiaryWithVault[]> {
  try {
    const { data, error } = await supabase
      .from("beneficiaries_with_vault")
      .select("*")
      .eq("address", walletAddress.toLowerCase())
      .eq("is_triggered", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching accessible vaults:", error)
      return []
    }

    return (data as BeneficiaryWithVault[]) || []
  } catch (error: any) {
    console.error("Error fetching accessible vaults:", error)
    return []
  }
}

/**
 * Check if address is a beneficiary of a vault
 */
export async function isBeneficiaryOfVault(
  vaultId: string,
  walletAddress: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(TABLES.BENEFICIARIES)
      .select("id")
      .eq("vault_id", vaultId)
      .eq("address", walletAddress.toLowerCase())
      .single()

    return !!data
  } catch (error: any) {
    return false
  }
}

// =====================================================
// UPDATE OPERATIONS
// =====================================================

/**
 * Update beneficiary information
 */
export async function updateBeneficiary(
  beneficiaryId: string,
  updates: BeneficiaryUpdate
): Promise<Beneficiary | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.BENEFICIARIES)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", beneficiaryId)
      .select()
      .single()

    if (error) {
      console.error("Error updating beneficiary:", error)
      throw new Error(error.message)
    }

    return data as Beneficiary
  } catch (error: any) {
    console.error("Error updating beneficiary:", error)
    throw error
  }
}

/**
 * Mark beneficiary as having accessed the vault
 */
export async function markBeneficiaryAccessed(
  beneficiaryId: string
): Promise<Beneficiary | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.BENEFICIARIES)
      .update({
        has_accessed: true,
        accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", beneficiaryId)
      .select()
      .single()

    if (error) {
      console.error("Error marking beneficiary as accessed:", error)
      throw new Error(error.message)
    }

    return data as Beneficiary
  } catch (error: any) {
    console.error("Error marking beneficiary as accessed:", error)
    throw error
  }
}

/**
 * Mark beneficiary as notified
 */
export async function markBeneficiaryNotified(
  beneficiaryId: string
): Promise<Beneficiary | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.BENEFICIARIES)
      .update({
        notified: true,
        notified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", beneficiaryId)
      .select()
      .single()

    if (error) {
      console.error("Error marking beneficiary as notified:", error)
      throw new Error(error.message)
    }

    return data as Beneficiary
  } catch (error: any) {
    console.error("Error marking beneficiary as notified:", error)
    throw error
  }
}

/**
 * Update shares percentage for a beneficiary
 */
export async function updateBeneficiaryShares(
  beneficiaryId: string,
  sharesPercentage: number
): Promise<Beneficiary | null> {
  if (sharesPercentage < 0 || sharesPercentage > 100) {
    throw new Error("Shares percentage must be between 0 and 100")
  }

  return updateBeneficiary(beneficiaryId, { shares_percentage: sharesPercentage })
}

// =====================================================
// DELETE OPERATIONS
// =====================================================

/**
 * Remove a beneficiary from a vault
 */
export async function removeBeneficiary(
  beneficiaryId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLES.BENEFICIARIES)
      .delete()
      .eq("id", beneficiaryId)

    if (error) {
      console.error("Error removing beneficiary:", error)
      return false
    }

    return true
  } catch (error: any) {
    console.error("Error removing beneficiary:", error)
    return false
  }
}

/**
 * Remove all beneficiaries from a vault
 */
export async function removeAllBeneficiaries(vaultId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLES.BENEFICIARIES)
      .delete()
      .eq("vault_id", vaultId)

    if (error) {
      console.error("Error removing all beneficiaries:", error)
      return false
    }

    return true
  } catch (error: any) {
    console.error("Error removing all beneficiaries:", error)
    return false
  }
}

// =====================================================
// ANALYTICS & VALIDATION
// =====================================================

/**
 * Validate shares distribution for a vault
 */
export async function validateSharesDistribution(
  vaultId: string
): Promise<{
  isValid: boolean
  totalShares: number
  beneficiaryCount: number
}> {
  try {
    const beneficiaries = await getVaultBeneficiaries(vaultId)

    const totalShares = beneficiaries.reduce(
      (sum, b) => sum + (b.shares_percentage || 0),
      0
    )

    return {
      isValid: Math.abs(totalShares - 100) < 0.01, // Allow small floating point errors
      totalShares,
      beneficiaryCount: beneficiaries.length,
    }
  } catch (error: any) {
    console.error("Error validating shares distribution:", error)
    return {
      isValid: false,
      totalShares: 0,
      beneficiaryCount: 0,
    }
  }
}

/**
 * Get beneficiary statistics for a vault
 */
export async function getVaultBeneficiaryStats(vaultId: string): Promise<{
  total: number
  notified: number
  accessed: number
  pending: number
}> {
  try {
    const beneficiaries = await getVaultBeneficiaries(vaultId)

    return {
      total: beneficiaries.length,
      notified: beneficiaries.filter((b) => b.notified).length,
      accessed: beneficiaries.filter((b) => b.has_accessed).length,
      pending: beneficiaries.filter((b) => !b.has_accessed).length,
    }
  } catch (error: any) {
    console.error("Error getting beneficiary stats:", error)
    return {
      total: 0,
      notified: 0,
      accessed: 0,
      pending: 0,
    }
  }
}

/**
 * Get unnotified beneficiaries for triggered vaults
 */
export async function getUnnotifiedBeneficiaries(): Promise<
  BeneficiaryWithVault[]
> {
  try {
    const { data, error } = await supabase
      .from("beneficiaries_with_vault")
      .select("*")
      .eq("is_triggered", true)
      .eq("notified", false)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching unnotified beneficiaries:", error)
      return []
    }

    return (data as BeneficiaryWithVault[]) || []
  } catch (error: any) {
    console.error("Error fetching unnotified beneficiaries:", error)
    return []
  }
}

// =====================================================
// BATCH OPERATIONS
// =====================================================

/**
 * Notify all beneficiaries of a triggered vault
 */
export async function notifyAllBeneficiaries(vaultId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from(TABLES.BENEFICIARIES)
      .update({
        notified: true,
        notified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("vault_id", vaultId)
      .eq("notified", false)
      .select()

    if (error) {
      console.error("Error notifying beneficiaries:", error)
      return 0
    }

    return data?.length || 0
  } catch (error: any) {
    console.error("Error notifying beneficiaries:", error)
    return 0
  }
}

/**
 * Rebalance shares equally among beneficiaries
 */
export async function rebalanceShares(vaultId: string): Promise<boolean> {
  try {
    const beneficiaries = await getVaultBeneficiaries(vaultId)

    if (beneficiaries.length === 0) return true

    const equalShare = 100.0 / beneficiaries.length

    const updates = beneficiaries.map((b) =>
      supabase
        .from(TABLES.BENEFICIARIES)
        .update({
          shares_percentage: equalShare,
          updated_at: new Date().toISOString(),
        })
        .eq("id", b.id)
    )

    await Promise.all(updates)

    return true
  } catch (error: any) {
    console.error("Error rebalancing shares:", error)
    return false
  }
}
