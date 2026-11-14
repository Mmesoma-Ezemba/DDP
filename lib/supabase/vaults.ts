/**
 * Vault Operations for Supabase
 * Handles CRUD operations for vaults and integrates with smart contracts
 */

import { supabase, TABLES } from "./client"
import type {
  Vault,
  VaultInsert,
  VaultUpdate,
  VaultWithOwner,
  VaultFilters,
  PaginatedResponse,
} from "./types"

// =====================================================
// CREATE OPERATIONS
// =====================================================

/**
 * Create a new vault for a user
 */
export async function createVault(
  walletAddress: string,
  vaultData: Partial<VaultInsert>
): Promise<Vault | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.VAULTS)
      .insert({
        owner_wallet: walletAddress.toLowerCase(),
        name: vaultData.name || "My Vault",
        description: vaultData.description,
        inactivity_timer_days: vaultData.inactivity_timer_days || 365,
        encryption_method: vaultData.encryption_method || "lit-protocol",
        encrypted_data_uri: vaultData.encrypted_data_uri,
        contract_address: vaultData.contract_address,
        chain_id: vaultData.chain_id,
        metadata: vaultData.metadata || {},
        last_heartbeat: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating vault:", error)
      throw new Error(error.message)
    }

    return data as Vault
  } catch (error: any) {
    console.error("Error creating vault:", error)
    throw error
  }
}

// =====================================================
// READ OPERATIONS
// =====================================================

/**
 * Get all vaults for a user
 */
export async function getUserVaults(
  walletAddress: string,
  filters?: VaultFilters
): Promise<Vault[]> {
  try {
    let query = supabase
      .from(TABLES.VAULTS)
      .select("*")
      .eq("owner_wallet", walletAddress.toLowerCase())
      .order("created_at", { ascending: false })

    // Apply filters
    if (filters?.is_triggered !== undefined) {
      query = query.eq("is_triggered", filters.is_triggered)
    }
    if (filters?.chain_id) {
      query = query.eq("chain_id", filters.chain_id)
    }
    if (filters?.created_after) {
      query = query.gte("created_at", filters.created_after)
    }
    if (filters?.created_before) {
      query = query.lte("created_at", filters.created_before)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching vaults:", error)
      throw new Error(error.message)
    }

    return (data as Vault[]) || []
  } catch (error: any) {
    console.error("Error fetching vaults:", error)
    return []
  }
}

/**
 * Get a specific vault by ID
 */
export async function getVaultById(vaultId: string): Promise<Vault | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.VAULTS)
      .select("*")
      .eq("id", vaultId)
      .single()

    if (error) {
      console.error("Error fetching vault:", error)
      return null
    }

    return data as Vault
  } catch (error: any) {
    console.error("Error fetching vault:", error)
    return null
  }
}

/**
 * Get vaults where user is a beneficiary
 */
export async function getBeneficiaryVaults(
  walletAddress: string
): Promise<VaultWithOwner[]> {
  try {
    const { data, error } = await supabase
      .from("vaults_with_owner")
      .select("*")
      .in(
        "id",
        supabase
          .from(TABLES.BENEFICIARIES)
          .select("vault_id")
          .eq("address", walletAddress.toLowerCase())
      )

    if (error) {
      console.error("Error fetching beneficiary vaults:", error)
      return []
    }

    return (data as VaultWithOwner[]) || []
  } catch (error: any) {
    console.error("Error fetching beneficiary vaults:", error)
    return []
  }
}

/**
 * Get vault by smart contract address
 */
export async function getVaultByContract(
  contractAddress: string
): Promise<Vault | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.VAULTS)
      .select("*")
      .eq("contract_address", contractAddress.toLowerCase())
      .single()

    if (error) {
      console.error("Error fetching vault by contract:", error)
      return null
    }

    return data as Vault
  } catch (error: any) {
    console.error("Error fetching vault by contract:", error)
    return null
  }
}

// =====================================================
// UPDATE OPERATIONS
// =====================================================

/**
 * Update vault information
 */
export async function updateVault(
  vaultId: string,
  updates: VaultUpdate
): Promise<Vault | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.VAULTS)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vaultId)
      .select()
      .single()

    if (error) {
      console.error("Error updating vault:", error)
      throw new Error(error.message)
    }

    return data as Vault
  } catch (error: any) {
    console.error("Error updating vault:", error)
    throw error
  }
}

/**
 * Update vault heartbeat (user activity)
 */
export async function updateVaultHeartbeat(vaultId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLES.VAULTS)
      .update({
        last_heartbeat: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", vaultId)

    if (error) {
      console.error("Error updating heartbeat:", error)
      return false
    }

    return true
  } catch (error: any) {
    console.error("Error updating heartbeat:", error)
    return false
  }
}

/**
 * Link vault to smart contract
 */
export async function linkVaultToContract(
  vaultId: string,
  contractAddress: string,
  chainId: number
): Promise<Vault | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.VAULTS)
      .update({
        contract_address: contractAddress.toLowerCase(),
        chain_id: chainId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vaultId)
      .select()
      .single()

    if (error) {
      console.error("Error linking vault to contract:", error)
      throw new Error(error.message)
    }

    return data as Vault
  } catch (error: any) {
    console.error("Error linking vault to contract:", error)
    throw error
  }
}

/**
 * Trigger vault (deadman switch activated)
 */
export async function triggerVault(vaultId: string): Promise<Vault | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.VAULTS)
      .update({
        is_triggered: true,
        triggered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", vaultId)
      .eq("is_triggered", false) // Only trigger if not already triggered
      .select()
      .single()

    if (error) {
      console.error("Error triggering vault:", error)
      throw new Error(error.message)
    }

    return data as Vault
  } catch (error: any) {
    console.error("Error triggering vault:", error)
    throw error
  }
}

// =====================================================
// DELETE OPERATIONS
// =====================================================

/**
 * Delete a vault (and all associated data)
 */
export async function deleteVault(vaultId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLES.VAULTS)
      .delete()
      .eq("id", vaultId)

    if (error) {
      console.error("Error deleting vault:", error)
      return false
    }

    return true
  } catch (error: any) {
    console.error("Error deleting vault:", error)
    return false
  }
}

// =====================================================
// ANALYTICS & MONITORING
// =====================================================

/**
 * Check if vault should be triggered based on inactivity
 */
export async function checkVaultInactivity(vaultId: string): Promise<{
  shouldTrigger: boolean
  daysSinceHeartbeat: number
  inactivityThreshold: number
}> {
  try {
    const vault = await getVaultById(vaultId)
    
    if (!vault) {
      return {
        shouldTrigger: false,
        daysSinceHeartbeat: 0,
        inactivityThreshold: 0,
      }
    }

    const lastHeartbeat = new Date(vault.last_heartbeat || vault.created_at)
    const now = new Date()
    const daysSinceHeartbeat = Math.floor(
      (now.getTime() - lastHeartbeat.getTime()) / (1000 * 60 * 60 * 24)
    )

    return {
      shouldTrigger: daysSinceHeartbeat >= vault.inactivity_timer_days,
      daysSinceHeartbeat,
      inactivityThreshold: vault.inactivity_timer_days,
    }
  } catch (error: any) {
    console.error("Error checking vault inactivity:", error)
    return {
      shouldTrigger: false,
      daysSinceHeartbeat: 0,
      inactivityThreshold: 0,
    }
  }
}

/**
 * Get all vaults that need to be triggered
 */
export async function getVaultsNeedingTrigger(): Promise<Vault[]> {
  try {
    const { data, error } = await supabase
      .from(TABLES.VAULTS)
      .select("*")
      .eq("is_triggered", false)

    if (error) {
      console.error("Error fetching vaults needing trigger:", error)
      return []
    }

    if (!data) return []

    // Filter vaults that have exceeded inactivity threshold
    const vaultsToTrigger: Vault[] = []
    for (const vault of data as Vault[]) {
      const { shouldTrigger } = await checkVaultInactivity(vault.id)
      if (shouldTrigger) {
        vaultsToTrigger.push(vault)
      }
    }

    return vaultsToTrigger
  } catch (error: any) {
    console.error("Error fetching vaults needing trigger:", error)
    return []
  }
}

/**
 * Get vault statistics for a user
 */
export async function getUserVaultStats(walletAddress: string): Promise<{
  total: number
  active: number
  triggered: number
  totalValue: number
}> {
  try {
    const vaults = await getUserVaults(walletAddress)

    return {
      total: vaults.length,
      active: vaults.filter((v) => !v.is_triggered).length,
      triggered: vaults.filter((v) => v.is_triggered).length,
      totalValue: 0, // Calculate from smart contract if needed
    }
  } catch (error: any) {
    console.error("Error getting vault stats:", error)
    return {
      total: 0,
      active: 0,
      triggered: 0,
      totalValue: 0,
    }
  }
}

// =====================================================
// BATCH OPERATIONS
// =====================================================

/**
 * Batch update heartbeats for multiple vaults
 */
export async function batchUpdateHeartbeats(
  vaultIds: string[]
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLES.VAULTS)
      .update({
        last_heartbeat: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in("id", vaultIds)

    if (error) {
      console.error("Error batch updating heartbeats:", error)
      return false
    }

    return true
  } catch (error: any) {
    console.error("Error batch updating heartbeats:", error)
    return false
  }
}
