"use client"

import { supabase, type UserProfile, type AuthResult } from "@/lib/supabase/client"
import { createOrGetUser, updateLastActive } from "@/lib/supabase/users"

/**
 * Generate a nonce for wallet signature authentication
 */
export async function generateNonce(walletAddress: string): Promise<string> {
  const response = await fetch("/api/auth/nonce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate nonce")
  }

  const data = await response.json()
  return data.nonce
}

/**
 * Authenticate using wallet signature (Web3 login)
 * Based on PRD: User connects wallet via thirdweb SDK, then signs a message
 */
export async function authenticateWithWallet(
  walletAddress: string,
  signature: string,
  nonce: string
): Promise<AuthResult> {
  try {
    console.log("[AUTH CLIENT] Sending authentication request:", {
      walletAddress,
      signatureLength: signature.length,
      nonce,
    })

    const response = await fetch("/api/auth/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress,
        signature,
        nonce,
      }),
    })

    const data = await response.json()

    console.log("[AUTH CLIENT] Server response:", {
      status: response.status,
      ok: response.ok,
      data,
    })

    if (!response.ok) {
      console.error("[AUTH CLIENT] Authentication failed:", data)
      return {
        success: false,
        error: data.error || "Authentication failed",
      }
    }

    // For wallet-based authentication, we don't need to set Supabase session
    // The server returns a custom session object, but we only need the user data
    // The authentication cookie is set by the component after successful auth

    return {
      success: true,
      user: data.user,
      session: data.session,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Authentication failed",
    }
  }
}

// Note: signAuthMessage is now handled directly in the hook using thirdweb's signMessage

/**
 * Create or update user profile on Supabase (PRD Step 2)
 */
export async function createUserProfile(
  walletAddress: string,
  metadata?: {
    name?: string
    email?: string
    username?: string
    avatar_url?: string
    [key: string]: any
  }
): Promise<UserProfile | null> {
  try {
    const user = await createOrGetUser(walletAddress, metadata)
    return user as UserProfile
  } catch (error: any) {
    console.error("Error creating user profile:", error)
    throw new Error(`Failed to create profile: ${error.message}`)
  }
}

/**
 * Get current user profile
 * Note: In wallet-based auth, we get the wallet address from the session/cookie
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    // Try to get from Supabase auth first
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // User authenticated via Supabase auth
      return user as unknown as UserProfile
    }

    // For wallet-based auth, we need to get the wallet address from elsewhere
    // This will be handled by the useAuth hook which has access to the wallet context
    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

/**
 * Sign out user and clear all auth data
 */
export async function signOut(): Promise<void> {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut()
    
    // Clear auth cookies
    document.cookie = 'wallet-address=; path=/; max-age=0; samesite=strict'
    document.cookie = 'auth-token=; path=/; max-age=0; samesite=strict'
    
    // Clear session storage
    sessionStorage.removeItem('redirect-after-login')
    
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

// updateLastActive is now imported from @/lib/supabase/users
export { updateLastActive } from "@/lib/supabase/users"

