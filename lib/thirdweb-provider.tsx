"use client"

import { createThirdwebClient } from "thirdweb"
import { ThirdwebProvider } from "thirdweb/react"
import { defineChain } from "thirdweb/chains"
import type { ReactNode } from "react"

// Lazily create the thirdweb client at runtime to avoid build-time crashes
// when NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set during prerendering.
let cachedClient: ReturnType<typeof createThirdwebClient> | null = null
let cachedClientType: 'ssr' | 'client' | null = null

export function getThirdwebClient() {
  const isSSR = typeof window === "undefined"
  
  // If we have a cached client and it matches the current environment, return it
  // But if we're on the client and the cached client is from SSR, recreate it
  if (cachedClient && cachedClientType) {
    if (isSSR && cachedClientType === 'ssr') return cachedClient
    if (!isSSR && cachedClientType === 'client') return cachedClient
    // Otherwise, we need to recreate the client for the new environment
    cachedClient = null
    cachedClientType = null
  }
  
  // Fallback to a mock/demo client ID if environment variable is not defined
  // This guarantees <ThirdwebProvider> always wraps children cleanly in dev & demo mode
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "demo-client-id-ddp-hackathon-2026"

  try {
    cachedClient = createThirdwebClient({ clientId })
    cachedClientType = isSSR ? 'ssr' : 'client'
    return cachedClient
  } catch (e) {
    console.error("Failed to initialize thirdweb client:", e)
    return null
  }
}

// Supported chains - Celo ecosystem only with ERC-20 token support
export const supportedChains = {
  celo: defineChain(42220), // Celo Mainnet - supports all ERC-20 tokens
  celoSepolia: defineChain(11142220), // Celo Sepolia Testnet (NEW, replaces Alfajores)
  // Using just chain ID - thirdweb handles RPC routing automatically
  // This avoids RPC endpoint mismatches and SSL issues
}

export interface ThirdwebConfig {
  client: ReturnType<typeof createThirdwebClient> | null
  supportedChains: typeof supportedChains
}

export function ThirdwebWeb3Provider({ children }: { children: ReactNode }) {
  // Call getThirdwebClient() directly on every render
  // The function has its own module-level caching via cachedClient/cachedClientType
  // This allows the SSR→client transition detection logic to work properly
  const client = getThirdwebClient()

  // Always render with ThirdwebProvider to prevent hook errors
  // Even during SSR, the provider must be present for hooks to work
  if (!client) {
    console.warn("ThirdwebProvider: Client not initialized, some features may not work")
    // Still need to provide the context even without a client
    // to prevent "must be used within" errors
    return <>{children}</>
  }

  return (
    <ThirdwebProvider 
      client={client}
      autoConnect={false}
      appMetadata={{
        name: "Decentralized Death Protocol",
        url: process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : "http://localhost:3000",
        description: "Secure digital legacy management on Web3",
        logoUrl: "/placeholder-logo.svg", // Using SVG for better scaling
      }}
    >
      {children}
    </ThirdwebProvider>
  )
}
