"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { useWeb3 } from "@/lib/web3-context"
import { useWalletAuth } from "@/hooks/use-wallet-auth"
import { AuthLogoAnimation } from "@/components/auth/auth-logo-animation"
import { Card } from "@/components/ui/card"
import { Bullet } from "@/components/ui/bullet"
import { Badge } from "@/components/ui/badge"
import WalletIcon from "@/components/icons/wallet"
import { usePollarAuth } from "@/lib/pollar-provider"
import { Button } from "@/components/ui/button"

// Dynamically import ConnectButton with SSR disabled
const ConnectButton = dynamic(
  () => import("@/components/web3/connect-button").then((mod) => mod.ConnectButton),
  { ssr: false, loading: () => (
    <div className="h-10 w-48 bg-primary/10 border border-primary/30 rounded-md flex items-center justify-center text-xs text-muted-foreground uppercase font-mono animate-pulse">
      Loading Wallet...
    </div>
  )}
)

interface SimpleAuthCardProps {
  mode: "login" | "signup"
}

export function SimpleAuthCard({ mode }: SimpleAuthCardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { wallet } = useWeb3()
  const { authenticate, signup, isLoading: isAuthLoading, isConnected } = useWalletAuth()
  const { login: pollarLogin, isLoading: isPollarLoading, isAuthenticated: isPollarAuthed, user: pollarUser } = usePollarAuth()

  const isLogin = mode === "login"
  const authAttemptedRef = useRef(false)
  const redirectingRef = useRef(false)
  const lastAuthResultRef = useRef<{ success: boolean; user?: any } | null>(null)

  // Save redirect path from URL query parameter to sessionStorage on mount
  useEffect(() => {
    const redirectFromUrl = searchParams.get('redirect')
    if (redirectFromUrl) {
      sessionStorage.setItem('redirect-after-login', redirectFromUrl)
    }
  }, [searchParams])

  // Helper function to perform redirect
  const performRedirect = () => {
    if (redirectingRef.current) {
      console.log("[AUTH] Redirect already in progress, skipping...")
      return
    }
    redirectingRef.current = true

    // Get redirect path: priority order is sessionStorage (original intent) > URL query param > default '/'
    const redirectFromSession = sessionStorage.getItem('redirect-after-login')
    const redirectFromUrl = searchParams.get('redirect')
    const redirectPath = redirectFromSession || redirectFromUrl || '/'
    
    console.log("[AUTH] Redirecting to:", redirectPath)
    
    // Clear saved redirect path
    sessionStorage.removeItem('redirect-after-login')
    
    // Use window.location for a hard redirect to ensure cookie is recognized
    window.location.href = redirectPath
  }

  // Auto-authenticate/signup when wallet connects
  useEffect(() => {
    const handleAutoAuth = async () => {
      // Prevent multiple authentication attempts
      if (authAttemptedRef.current || redirectingRef.current) {
        return
      }

      // Only authenticate if wallet is connected and not already loading
      if (isConnected && wallet.address && !isAuthLoading) {
        authAttemptedRef.current = true
        
        try {
          console.log("[AUTH] Starting authentication...")
          const result = isLogin ? await authenticate() : await signup({})
          
          // Store result for redirect check
          lastAuthResultRef.current = result
          
          console.log("[AUTH] Authentication result:", result)
          
          if (result.success) {
            // Set auth cookie
            document.cookie = `wallet-address=${wallet.address}; path=/; max-age=86400; samesite=strict`
            console.log("[AUTH] Cookie set, redirecting...")
            
            // Perform redirect immediately
            performRedirect()
          } else {
            // Reset on failure so user can try again
            authAttemptedRef.current = false
            console.log("[AUTH] Authentication failed:", result.error)
          }
        } catch (error) {
          console.error("[AUTH] Authentication error:", error)
          authAttemptedRef.current = false
        }
      }
    }
    
    handleAutoAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, wallet.address, isAuthLoading, isLogin])

  // Watch for successful authentication and redirect immediately
  useEffect(() => {
    if (lastAuthResultRef.current?.success && wallet.address && !redirectingRef.current) {
      console.log("[AUTH] Detected successful auth, redirecting...")
      // Set auth cookie if not already set
      document.cookie = `wallet-address=${wallet.address}; path=/; max-age=86400; samesite=strict`
      performRedirect()
    }
  }, [wallet.address, searchParams])

  return (
    <Card className="relative z-10 w-full max-w-[95vw] sm:max-w-md md:max-w-lg border-2 p-4 sm:p-6 md:p-8 lg:p-10 backdrop-blur-sm bg-background/80">
      {/* Logo Animation - Responsive Size */}
      <div className="scale-75 sm:scale-90 md:scale-100">
        <AuthLogoAnimation />
      </div>

      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 md:mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase mb-2 sm:mb-3 bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent leading-tight">
          {isLogin ? "Welcome" : "Get Started"}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground uppercase flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <Bullet />
          <span className="hidden sm:inline">Decentralized Death Protocol</span>
          <span className="sm:hidden">DDP</span>
        </p>
        <p className="text-[10px] sm:text-xs text-muted-foreground/70">
          {isLogin ? "Secure your digital legacy on Web3" : "Begin your digital legacy journey"}
        </p>
      </div>

      {/* Wallet Connection Section */}
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          <div className="text-center">
            <h2 className="text-base sm:text-lg md:text-xl font-display uppercase mb-2 sm:mb-3 text-primary">Connect Your Wallet</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-5 md:mb-6 leading-relaxed px-2">
              {isLogin 
                ? "Authenticate using your Web3 wallet to access and manage your digital vaults"
                : "Create your account by connecting your Web3 wallet"
              }
            </p>
          </div>

          <div className="flex justify-center">
            <ConnectButton variant="cyberpunk" size="default" className="w-full sm:w-auto" />
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background/80 px-2 text-muted-foreground font-mono">
                or Beneficiary Fast Access
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full border-primary/40 hover:border-primary hover:bg-primary/10 flex items-center justify-center gap-2 py-5"
              disabled={isPollarLoading}
              onClick={async () => {
                await pollarLogin({ provider: "google" })
                performRedirect()
              }}
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isPollarLoading ? "Connecting via Pollar..." : "Sign in with Google (Powered by Pollar)"}</span>
            </Button>
            <p className="text-[10px] text-center text-muted-foreground">
              ⚡ Powered by <span className="text-primary font-semibold">Pollar Protocol</span>: Automatic zero-friction smart wallet creation for non-crypto beneficiaries.
            </p>
          </div>

          {isConnected && (
            <div className="mt-4 sm:mt-5 md:mt-6 p-3 sm:p-4 md:p-5 bg-success/10 border-2 border-success/30 rounded-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className="p-2 sm:p-2.5 md:p-3 rounded-lg bg-success/20 flex-shrink-0">
                  <WalletIcon className="size-4 sm:size-5 md:size-6 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase mb-1 sm:mb-1.5 font-semibold">Wallet Connected</p>
                  <p className="font-mono text-[10px] sm:text-xs md:text-sm truncate text-foreground">{wallet.address}</p>
                </div>
                <Badge variant="outline" className="text-success border-success/30 bg-success/10 px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs flex-shrink-0">
                  <span className="mr-1 sm:mr-1.5">●</span> <span className="hidden sm:inline">READY</span><span className="sm:hidden">✓</span>
                </Badge>
              </div>
              {isAuthLoading && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-success/20 text-center">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    <div className="animate-spin rounded-full h-2.5 sm:h-3 w-2.5 sm:w-3 border-b-2 border-success"></div>
                    {isLogin ? "Authenticating..." : "Creating account..."}
                  </div>
                </div>
              )}
            </div>
          )}

          {!isConnected && (
            <div className="mt-4 sm:mt-5 md:mt-6 space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 md:p-5 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                  <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                    <span className="text-primary text-base sm:text-lg flex-shrink-0">🔐</span>
                    <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                      Your wallet connection is secure and encrypted. We never store or access your private keys.
                    </p>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                    <span className="text-primary text-base sm:text-lg flex-shrink-0">🛡️</span>
                    <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                      All data is encrypted using EIP-191 signatures and stored securely.
                    </p>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                    <span className="text-primary text-base sm:text-lg flex-shrink-0">⚡</span>
                    <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                      {isLogin 
                        ? "Supported wallets: MetaMask, WalletConnect, Coinbase, and more."
                        : "Instant account creation with your wallet address."
                      }
                    </p>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                    <span className="text-primary text-base sm:text-lg flex-shrink-0">🌐</span>
                    <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                      Powered by Celo blockchain with ERC-20 token support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

