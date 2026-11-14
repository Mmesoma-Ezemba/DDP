/**
 * User Operations for Supabase
 * Handles user profile management and authentication
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import { supabase } from "./client"
import { TABLES } from "./constants"
import type { User, UserInsert, UserUpdate } from "./types"
import { logLogin, logLogout } from "./activity-logs"
import { getRandomAvatar } from "@/lib/constants/default-avatars"

// Re-export UserProfile for backwards compatibility
export type { UserProfile } from "./client"

// =====================================================
// CREATE OPERATIONS
// =====================================================

/**
 * Create or get user by wallet address
 * This is called after Thirdweb authentication
 */
export async function createOrGetUser(
  walletAddress: string,
  metadata?: {
    name?: string
    email?: string
    username?: string
    avatar_url?: string
    [key: string]: any
  },
  supabaseClient?: SupabaseClient
): Promise<User | null> {
  const client = supabaseClient || supabase
  try {
    // Check if user exists
    const { data: existingUser } = await client
      .from(TABLES.USERS)
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .maybeSingle() // Use maybeSingle() - returns null if no rows

    if (existingUser) {
      // Update last active and metadata if provided
      // Note: name and avatar_url are stored in metadata JSONB column
      const updates: any = {
        last_active: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (metadata) {
        // Only update fields that are provided
        if (metadata.email) updates.email = metadata.email
        if (metadata.username) updates.username = metadata.username
        
        // Merge metadata (including name and avatar_url)
        const existingMetadata = existingUser.metadata || {}
        const newMetadata: any = { ...existingMetadata }
        
        if (metadata.name) newMetadata.name = metadata.name
        if (metadata.avatar_url) newMetadata.avatar_url = metadata.avatar_url
        if (metadata.metadata) {
          Object.assign(newMetadata, metadata.metadata)
        }
        
        updates.metadata = newMetadata
      }

      const { data, error } = await client
        .from(TABLES.USERS)
        .update(updates)
        .eq("wallet_address", walletAddress.toLowerCase())
        .select()
        .single()

      if (error) {
        console.error("Error updating user:", error)
        return existingUser as User
      }

      return data as User
    }

    // Create new user with random avatar if not provided
    // Note: avatar_url and name are stored in metadata JSONB column
    const randomAvatar = getRandomAvatar()
    const userMetadata = {
      ...(metadata?.metadata || {}),
      name: metadata?.name,
      avatar_url: metadata?.avatar_url || randomAvatar.url,
    }
    
    const { data, error } = await client
      .from(TABLES.USERS)
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        email: metadata?.email,
        username: metadata?.username,
        metadata: userMetadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating user:", error)
      throw new Error(error.message)
    }

    return data as User
  } catch (error: any) {
    console.error("Error in createOrGetUser:", error)
    throw error
  }
}

/**
 * Create a new user (signup flow)
 */
export async function createUser(
  walletAddress: string,
  userData?: Partial<UserInsert>
): Promise<User | null> {
  return createOrGetUser(walletAddress, userData)
}

// =====================================================
// READ OPERATIONS
// =====================================================

/**
 * Get user by wallet address
 */
export async function getUserByWallet(
  walletAddress: string
): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .maybeSingle() // Use maybeSingle() instead of single() - returns null if no rows

    if (error) {
      console.error("Error fetching user:", error)
      return null
    }

    return data as User | null
  } catch (error: any) {
    console.error("Error fetching user:", error)
    return null
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select("*")
      .eq("id", userId)
      .maybeSingle() // Use maybeSingle() - returns null if no rows

    if (error) {
      console.error("Error fetching user:", error)
      return null
    }

    return data as User | null
  } catch (error: any) {
    console.error("Error fetching user:", error)
    return null
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select("*")
      .eq("email", email)
      .maybeSingle() // Use maybeSingle() - returns null if no rows

    if (error) {
      console.error("Error fetching user by email:", error)
      return null
    }

    return data as User | null
  } catch (error: any) {
    console.error("Error fetching user by email:", error)
    return null
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(
  username: string
): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select("*")
      .eq("username", username)
      .maybeSingle() // Use maybeSingle() - returns null if no rows

    if (error) {
      console.error("Error fetching user by username:", error)
      return null
    }

    return data as User | null
  } catch (error: any) {
    console.error("Error fetching user by username:", error)
    return null
  }
}

/**
 * Search users by name or username
 */
export async function searchUsers(query: string, limit: number = 10): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select("*")
      .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
      .limit(limit)

    if (error) {
      console.error("Error searching users:", error)
      return []
    }

    return (data as User[]) || []
  } catch (error: any) {
    console.error("Error searching users:", error)
    return []
  }
}

// =====================================================
// UPDATE OPERATIONS
// =====================================================

/**
 * Update user profile
 */
export async function updateUser(
  walletAddress: string,
  updates: UserUpdate
): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("wallet_address", walletAddress.toLowerCase())
      .select()
      .single()

    if (error) {
      console.error("Error updating user:", error)
      throw new Error(error.message)
    }

    return data as User
  } catch (error: any) {
    console.error("Error updating user:", error)
    throw error
  }
}

/**
 * Update user's last active timestamp
 */
export async function updateLastActive(
  walletAddress: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLES.USERS)
      .update({
        last_active: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("wallet_address", walletAddress.toLowerCase())

    if (error) {
      console.error("Error updating last active:", error)
      return false
    }

    return true
  } catch (error: any) {
    console.error("Error updating last active:", error)
    return false
  }
}

/**
 * Update user metadata
 */
export async function updateUserMetadata(
  walletAddress: string,
  metadata: Record<string, any>
): Promise<User | null> {
  try {
    // Get current user to merge metadata
    const currentUser = await getUserByWallet(walletAddress)
    
    if (!currentUser) {
      throw new Error("User not found")
    }

    const mergedMetadata = {
      ...currentUser.metadata,
      ...metadata,
    }

    return updateUser(walletAddress, { metadata: mergedMetadata })
  } catch (error: any) {
    console.error("Error updating user metadata:", error)
    throw error
  }
}

// =====================================================
// DELETE OPERATIONS
// =====================================================

/**
 * Delete user account
 */
export async function deleteUser(walletAddress: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLES.USERS)
      .delete()
      .eq("wallet_address", walletAddress.toLowerCase())

    if (error) {
      console.error("Error deleting user:", error)
      return false
    }

    return true
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return false
  }
}

// =====================================================
// AUTHENTICATION HELPERS
// =====================================================

/**
 * Handle user login - creates/updates user and logs activity
 */
export async function handleUserLogin(
  supabaseClient: SupabaseClient,
  walletAddress: string,
  metadata?: {
    name?: string
    email?: string
    username?: string
    device_info?: any
    location?: any
  }
): Promise<User | null> {
  try {
    // Create or get user
    const user = await createOrGetUser(
      walletAddress,
      {
        name: metadata?.name,
        email: metadata?.email,
        username: metadata?.username,
      },
      supabaseClient
    )

    if (!user) {
      throw new Error("Failed to create/get user")
    }

    // Log login activity (logLogin also needs to accept client, but for now we'll skip it)
    // TODO: Update logLogin to accept SupabaseClient parameter
    // await logLogin(supabaseClient, walletAddress, metadata?.device_info, metadata?.location)

    return user
  } catch (error: any) {
    console.error("Error handling user login:", error)
    throw error
  }
}

/**
 * Handle user logout
 */
export async function handleUserLogout(walletAddress: string): Promise<void> {
  try {
    await logLogout(walletAddress)
  } catch (error: any) {
    console.error("Error handling user logout:", error)
  }
}

// =====================================================
// ANALYTICS
// =====================================================

/**
 * Get total user count
 */
export async function getTotalUserCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from(TABLES.USERS)
      .select("*", { count: "exact", head: true })

    if (error) {
      console.error("Error getting user count:", error)
      return 0
    }

    return count || 0
  } catch (error: any) {
    console.error("Error getting user count:", error)
    return 0
  }
}

/**
 * Get active users (logged in within specified days)
 */
export async function getActiveUsers(days: number = 7): Promise<User[]> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select("*")
      .gte("last_active", cutoffDate.toISOString())
      .order("last_active", { ascending: false })

    if (error) {
      console.error("Error fetching active users:", error)
      return []
    }

    return (data as User[]) || []
  } catch (error: any) {
    console.error("Error fetching active users:", error)
    return []
  }
}

/**
 * Get recently created users
 */
export async function getRecentUsers(limit: number = 10): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching recent users:", error)
      return []
    }

    return (data as User[]) || []
  } catch (error: any) {
    console.error("Error fetching recent users:", error)
    return []
  }
}
