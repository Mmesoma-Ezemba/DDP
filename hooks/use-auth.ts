"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useWeb3 } from "@/lib/web3-context"
import { getUserByWallet } from "@/lib/supabase/users"
import type { UserProfile } from "@/lib/supabase/client"

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: UserProfile | null
}

/**
 * Hook to check authentication status and manage user session
 * Redirects to login if not authenticated (for protected pages)
 */
export function useAuth(requireAuth: boolean = true) {
  const router = useRouter()
  const pathname = usePathname()
  const { wallet } = useWeb3()
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if wallet is connected
        if (!wallet.isConnected || !wallet.address) {
          if (requireAuth) {
            // Save current path for redirect after login
            sessionStorage.setItem('redirect-after-login', pathname)
            router.push('/login')
          }
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
          })
          return
        }

        // Check if user profile exists in Supabase using wallet address
        const profile = await getUserByWallet(wallet.address)
        
        if (!profile && requireAuth) {
          // No profile found, redirect to signup
          sessionStorage.setItem('redirect-after-login', pathname)
          router.push('/signup')
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
          })
          return
        }

        // User is authenticated
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: profile,
        })

        // Set auth cookie for middleware
        document.cookie = `wallet-address=${wallet.address}; path=/; max-age=86400; samesite=strict`
        
      } catch (error) {
        console.error('Auth check error:', error)
        if (requireAuth) {
          router.push('/login')
        }
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        })
      }
    }

    checkAuth()
  }, [wallet.isConnected, wallet.address, requireAuth, router, pathname])

  return authState
}

/**
 * Hook for public pages (login, signup) to redirect if already authenticated
 */
export function useRedirectIfAuthenticated() {
  const router = useRouter()
  const { wallet } = useWeb3()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (wallet.isConnected && wallet.address) {
        try {
          const profile = await getUserByWallet(wallet.address)
          if (profile) {
            // User is already authenticated, redirect to dashboard
            const redirectPath = sessionStorage.getItem('redirect-after-login') || '/'
            sessionStorage.removeItem('redirect-after-login')
            router.push(redirectPath)
            return
          }
        } catch (error) {
          console.error('Auth check error:', error)
        }
      }
      setIsChecking(false)
    }

    checkAndRedirect()
  }, [wallet.isConnected, wallet.address, router])

  return { isChecking }
}

