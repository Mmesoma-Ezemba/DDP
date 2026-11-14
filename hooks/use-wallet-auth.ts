"use client"

import { useState } from "react"
import { useActiveAccount, useSwitchActiveWalletChain } from "thirdweb/react"
import {
  generateNonce,
  authenticateWithWallet,
  createUserProfile,
  type AuthResult,
} from "@/lib/auth/wallet-auth"
import { generateAuthMessage } from "@/lib/auth/auth-message"
import { supportedChains } from "@/lib/thirdweb-provider"
import { toast } from "sonner"

/**
 * Hook for wallet-based authentication
 * Handles the complete flow: nonce generation → signing → authentication
 */
export function useWalletAuth() {
  const account = useActiveAccount()
  const switchChain = useSwitchActiveWalletChain()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Internal authentication function without loading state management
   * Used by both authenticate() and signup() to avoid nested loading state conflicts
   */
  const performAuthentication = async (): Promise<AuthResult> => {
    if (!account?.address) {
      return { success: false, error: "No wallet connected" }
    }

    try {
      // Step 0: Ensure we're on Celo Sepolia Testnet (NEW testnet, replaces Alfajores)
      try {
        toast.info("Switching to Celo Sepolia Testnet...")
        await switchChain(supportedChains.celoSepolia)
      } catch (switchError: any) {
        // If user rejects switch, show friendly message
        if (switchError.message?.includes("User rejected") || switchError.message?.includes("User denied")) {
          return { success: false, error: "Network switch cancelled. Please switch to Celo Sepolia Testnet." }
        }
        // For any other chain switch error, prevent authentication on wrong network
        console.error("Chain switch failed:", switchError)
        return { 
          success: false, 
          error: "Failed to switch to Celo Sepolia Testnet. Please manually switch your wallet to Celo Sepolia and try again." 
        }
      }
      
      // Step 1: Generate nonce
      const nonce = await generateNonce(account.address)
      
      // Step 2: Generate message to sign
      const message = generateAuthMessage(account.address, nonce)
      
      // Step 3: Sign message with wallet
      if (!account.signMessage) {
        throw new Error("Wallet does not support message signing")
      }
      
      const signature = await account.signMessage({
        message,
      })
      
      // Step 4: Authenticate with signature
      const result = await authenticateWithWallet(
        account.address,
        signature,
        nonce
      )

      return result
    } catch (err: any) {
      // Handle user rejection gracefully
      if (err.message?.includes("User rejected") || err.message?.includes("User denied")) {
        return { success: false, error: "Authentication cancelled" }
      }
      
      return { success: false, error: err.message || "Authentication failed" }
    }
  }

  const authenticate = async (): Promise<AuthResult> => {
    if (!account?.address) {
      const errorMsg = "No wallet connected"
      setError(errorMsg)
      toast.error(errorMsg)
      return { success: false, error: errorMsg }
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await performAuthentication()

      if (result.success) {
        toast.success("Authenticated successfully")
      } else {
        // Show appropriate message based on error type
        if (result.error === "Authentication cancelled") {
          toast.info("Authentication was cancelled")
        } else {
          toast.error(result.error || "Authentication failed")
        }
        setError(result.error || "Authentication failed")
      }

      return result
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (metadata?: {
    email?: string
    username?: string
  }): Promise<AuthResult> => {
    if (!account?.address) {
      const errorMsg = "No wallet connected"
      setError(errorMsg)
      toast.error(errorMsg)
      return { success: false, error: errorMsg }
    }

    setIsLoading(true)
    setError(null)

    try {
      // Authenticate using internal function to avoid nested loading state conflicts
      const authResult = await performAuthentication()
      
      // If authentication failed (including user rejection), return early
      if (!authResult.success) {
        // Show appropriate message based on error type
        if (authResult.error === "Authentication cancelled") {
          toast.info("Signup was cancelled")
        } else {
          toast.error(authResult.error || "Authentication failed")
        }
        setError(authResult.error || "Authentication failed")
        return authResult
      }

      // Create/update profile with metadata
      const profile = await createUserProfile(account.address, metadata)

      toast.success("Account created successfully")
      return {
        success: true,
        user: profile,
      }
    } catch (err: any) {
      // This catch block only handles exceptions from createUserProfile()
      const errorMsg = err.message || "Signup failed"
      setError(errorMsg)
      toast.error(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    authenticate,
    signup,
    isLoading,
    error,
    isConnected: !!account?.address,
    address: account?.address || null,
  }
}

