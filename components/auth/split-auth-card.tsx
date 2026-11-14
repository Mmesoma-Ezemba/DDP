"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import NextDynamic from "next/dynamic"
import { useWeb3 } from "@/lib/web3-context"
import { useWalletAuth } from "@/hooks/use-wallet-auth"
import { AuthLogoAnimation } from "@/components/auth/auth-logo-animation"
import { Bullet } from "@/components/ui/bullet"
import WalletIcon from "@/components/icons/wallet"
import { Badge } from "@/components/ui/badge"
import { AuthBrandShowcase } from "@/components/auth/auth-brand-showcase"

// Disable SSR for ConnectButton to avoid hydration mismatches
const ConnectButton = NextDynamic(
  () => import("@/components/web3/connect-button").then((m) => m.ConnectButton),
  {
    ssr: false,
    loading: () => (
      <div className="h-14 px-10 bg-primary/10 border-2 border-primary/30 rounded-lg flex items-center justify-center">
        <span className="uppercase font-mono text-sm tracking-widest opacity-60">Loading...</span>
      </div>
    ),
  }
)

interface SplitAuthCardProps {
  mode: "login" | "signup"
}

export function SplitAuthCard({ mode }: SplitAuthCardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { wallet } = useWeb3()
  const { authenticate, signup, isLoading: isAuthLoading, isConnected } = useWalletAuth()

  const isLogin = mode === "login"
  const headline = "Welcome to DDP"
  const subline = "Web3 Authentication"
  const description = "Connect your wallet to access the Decentralized Death Protocol. Secure, encrypted, and fully decentralized digital legacy management."

  // Save redirect path from URL query parameter to sessionStorage on mount
  useEffect(() => {
    const redirectFromUrl = searchParams.get("redirect")
    if (redirectFromUrl) {
      sessionStorage.setItem("redirect-after-login", redirectFromUrl)
    }
  }, [searchParams])

  // Auto-authenticate/signup when wallet connects
  useEffect(() => {
    const handleAutoAuth = async () => {
      if (isConnected && wallet?.address && !isAuthLoading) {
        const result = mode === "login" ? await authenticate() : await signup({})

        if (result.success) {
          document.cookie = `wallet-address=${wallet.address}; path=/; max-age=86400; samesite=strict`

          const redirectFromSession = sessionStorage.getItem("redirect-after-login")
          const redirectFromUrl = searchParams.get("redirect")
          const redirectPath = redirectFromSession || redirectFromUrl || "/"

          sessionStorage.removeItem("redirect-after-login")

          router.push(redirectPath)
        }
      }
    }

    handleAutoAuth()
  }, [authenticate, isAuthLoading, isConnected, mode, router, searchParams, signup, wallet?.address])

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
      {/* Outer Glow Container */}
      <div className="relative">
        {/* Animated Outer Glow */}
        <div className="absolute -inset-[2px] bg-gradient-to-r from-primary via-chart-1 to-chart-2 rounded-3xl opacity-75 blur-xl animate-pulse" />

        {/* Main Card Container - Glassmorphism */}
        <div
          className="relative bg-gradient-to-br from-background/95 via-background/92 to-background/95 backdrop-blur-2xl rounded-3xl overflow-hidden"
          style={{
            boxShadow: `
                0 0 60px rgba(var(--color-primary-rgb, 147, 51, 234), 0.3),
                0 0 120px rgba(var(--color-primary-rgb, 147, 51, 234), 0.15),
                inset 0 0 60px rgba(var(--color-primary-rgb, 147, 51, 234), 0.05)
              `,
          }}
        >
          {/* Animated Border */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: `linear-gradient(90deg, var(--color-primary), var(--color-chart-1), var(--color-chart-2), var(--color-primary))`,
              backgroundSize: "300% 100%",
              animation: "gradient-shift 6s ease infinite",
              padding: "2px",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />

          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-32 h-32">
            <div className="absolute top-4 left-4 w-16 h-0.5 bg-gradient-to-r from-primary to-transparent" />
            <div className="absolute top-4 left-4 w-0.5 h-16 bg-gradient-to-b from-primary to-transparent" />
          </div>
          <div className="absolute top-0 right-0 w-32 h-32">
            <div className="absolute top-4 right-4 w-16 h-0.5 bg-gradient-to-l from-chart-1 to-transparent" />
            <div className="absolute top-4 right-4 w-0.5 h-16 bg-gradient-to-b from-chart-1 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 w-32 h-32">
            <div className="absolute bottom-4 left-4 w-16 h-0.5 bg-gradient-to-r from-chart-2 to-transparent" />
            <div className="absolute bottom-4 left-4 w-0.5 h-16 bg-gradient-to-t from-chart-2 to-transparent" />
          </div>
          <div className="absolute bottom-0 right-0 w-32 h-32">
            <div className="absolute bottom-4 right-4 w-16 h-0.5 bg-gradient-to-l from-primary to-transparent" />
            <div className="absolute bottom-4 right-4 w-0.5 h-16 bg-gradient-to-t from-primary to-transparent" />
          </div>

          {/* Scanline Effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, transparent 2px, transparent 4px)",
            }}
          />

          {/* Grid Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `
                  linear-gradient(var(--color-primary) 1px, transparent 1px),
                  linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)
                `,
              backgroundSize: "20px 20px",
            }}
          />

          <div className="relative grid min-h-[560px] sm:min-h-[620px] lg:min-h-[660px] lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,1fr)]">
            <section className="relative overflow-hidden border-b border-primary/20 bg-gradient-to-br from-primary/12 via-background/40 to-background/80 lg:border-b-0 lg:border-r">
              <div className="absolute inset-0 opacity-60">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_58%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.2),transparent_60%)]" />
              </div>
              <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent opacity-70" />
              <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: `linear-gradient(120deg, rgba(255,255,255,0.05) 0%, transparent 45%, rgba(255,255,255,0.04) 100%)` }} />

              <div className="relative z-10 flex h-full flex-col justify-center gap-12 p-6 sm:p-8 lg:p-16">
                <div className="space-y-8 text-center lg:text-left">
                  <div className="flex justify-center lg:justify-start [&>div]:mx-0 [&>div]:mb-0">
                    <AuthLogoAnimation />
                  </div>
                  <div className="space-y-5 max-w-xl mx-auto lg:mx-0">
                    <div className="space-y-3">
                      <p className="flex items-center justify-center lg:justify-start gap-2 text-xs uppercase tracking-[0.32em] text-muted-foreground">
                        <Bullet />
                        {subline}
                      </p>
                      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display uppercase bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent leading-[0.95]">
                        {headline}
                      </h1>
                    </div>
                    <p className="text-base sm:text-lg text-muted-foreground/90 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>

                <div className="space-y-8 max-w-xl mx-auto lg:mx-0 w-full">
                  <div className="space-y-6">
                    <div className="flex justify-center lg:justify-start">
                      <ConnectButton variant="cyberpunk" size="lg" />
                    </div>

                    {isConnected ? (
                      <div className="p-6 bg-success/10 border-2 border-success/30 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <div className="flex items-center gap-4">
                          <div className="p-4 rounded-xl bg-success/20 border border-success/30">
                            <WalletIcon className="size-7 text-success" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-success uppercase mb-2 font-bold tracking-widest">Wallet Connected</p>
                            <p className="font-mono text-sm truncate text-foreground">{wallet?.address}</p>
                          </div>
                          <Badge variant="outline" className="text-success border-success/40 bg-success/15 px-3 py-1">
                            <span className="mr-2 text-xs">●</span> ACTIVE
                          </Badge>
                        </div>
                        {isAuthLoading && (
                          <div className="mt-5 pt-5 border-t border-success/20 text-center">
                            <div className="flex items-center justify-center gap-3 text-sm text-success font-mono uppercase tracking-wider">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-success border-t-transparent" />
                              Authenticating...
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="flex items-start gap-3 rounded-xl border-2 border-primary/20 bg-primary/5 p-5 backdrop-blur-sm">
                          <span className="text-2xl">🔐</span>
                          <div>
                            <p className="text-xs font-bold uppercase text-primary mb-1 tracking-wider">Secure</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              EIP-191 signature-based authentication with guardian attestations.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl border-2 border-chart-1/20 bg-chart-1/5 p-5 backdrop-blur-sm">
                          <span className="text-2xl">⚡</span>
                          <div>
                            <p className="text-xs font-bold uppercase text-chart-1 mb-1 tracking-wider">Universal</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              MetaMask, WalletConnect, Coinbase, and more supported.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[0.65rem] sm:text-xs font-mono uppercase text-muted-foreground/70 pt-4 border-t border-primary/10">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      System Online
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>Multi-chain</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Encrypted</span>
                  </div>
                </div>
              </div>
            </section>

            <aside className="relative overflow-hidden bg-background/50 hidden lg:flex">
              <div className="absolute inset-0 bg-gradient-to-bl from-chart-1/15 via-transparent to-primary/20" />
              <div
                className="absolute inset-0 opacity-[0.15]"
                style={{
                  backgroundImage: `
                      linear-gradient(transparent 95%, rgba(255,255,255,0.05) 95%),
                      linear-gradient(90deg, transparent 96%, rgba(255,255,255,0.04) 96%)
                    `,
                  backgroundSize: "12px 12px",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "repeating-linear-gradient(180deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 3px, transparent 6px)",
                }}
              />

              <div className="relative z-10 h-full p-10 xl:p-12 flex">
                <AuthBrandShowcase mode={mode} />
              </div>
            </aside>
          </div>

          {/* Bottom Tech Bar */}
          <div className="relative border-t border-primary/20 bg-background/70 backdrop-blur-md">
            <div className="px-6 sm:px-8 py-5 flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center justify-between text-xs font-mono uppercase text-muted-foreground/80 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-5">
                <span className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  Decentralized Death Protocol
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-5">
                <span className="hidden md:inline text-primary">EIP-191 Secure</span>
                <span className="hidden md:inline opacity-40">•</span>
                <span className="hidden md:inline">Multi-Chain</span>
                <span className="hidden md:inline opacity-40">•</span>
                <span className="text-chart-1">v2.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  )
}
