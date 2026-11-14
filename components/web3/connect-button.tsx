"use client"

import { ConnectButton as ThirdwebConnectButton } from "thirdweb/react"
import { getThirdwebClient, supportedChains } from "@/lib/thirdweb-provider"
import { 
  createWallet,
  walletConnect,
  inAppWallet,
} from "thirdweb/wallets"
import { Button } from "@/components/ui/button"
import WalletIcon from "@/components/icons/wallet"
import { cn } from "@/lib/utils"
import { useStableId } from "@/hooks/use-stable-id"

// Configure wallets for mobile and desktop support
const wallets = [
  createWallet("io.metamask"), // MetaMask (mobile + desktop)
  createWallet("com.coinbase.wallet"), // Coinbase Wallet (mobile + desktop)
  walletConnect(), // WalletConnect (mobile via QR code)
  inAppWallet(), // Email/social login (mobile + desktop)
  createWallet("me.rainbow"), // Rainbow (mobile)
]

interface ConnectButtonProps {
  className?: string
  variant?: "default" | "outline" | "ghost" | "cyberpunk"
  size?: "default" | "sm" | "lg"
}

/**
 * Custom ConnectButton component using thirdweb SDK
 * Styled to match the DDP cyberpunk aesthetic with neon glow effects
 */
export function ConnectButton({ className, variant = "default", size = "default" }: ConnectButtonProps) {
  const client = getThirdwebClient()
  const filterId = useStableId("connect-glow")
  
  // Fallback UI when thirdweb client is not configured
  if (!client) {
    return (
      <button
        type="button"
        title="Thirdweb client not configured"
        className={cn(
          "uppercase font-mono text-xs cursor-not-allowed opacity-60",
          size === "sm" && "h-8 px-3",
          size === "default" && "h-10 px-6",
          size === "lg" && "h-12 px-8 text-sm",
          className
        )}
        disabled
      >
        Connect Wallet
      </button>
    )
  }

  // Cyberpunk button with custom SVG effects
  if (variant === "cyberpunk") {
    return (
      <div className="relative group">
        {/* SVG Filters for glow effects - only render on client */}
        {filterId && (
          <svg width="0" height="0" className="absolute" aria-hidden="true">
            <defs>
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>
        )}

        {/* Animated border */}
        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary via-chart-1 to-primary bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity blur-sm pointer-events-none" aria-hidden="true" />
        
        {/* Main button */}
        <ThirdwebConnectButton
      client={client}
      wallets={wallets}
      chains={[
        supportedChains.celoSepolia, // Celo Alfajores testnet (primary for development)
        supportedChains.celo, // Celo mainnet (production)
      ]}
          connectButton={{
            label: "CONNECT WALLET",
            className: cn(
              "relative z-10 uppercase font-mono text-xs font-bold",
              "bg-primary/10 backdrop-blur-sm",
              "border-2 border-primary",
              "hover:bg-primary/20 hover:border-chart-1 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]",
              "transition-all duration-300",
              "rounded-md",
              "flex items-center gap-2",
              size === "sm" && "h-8 px-4 text-[10px]",
              size === "default" && "h-10 px-6 text-xs",
              size === "lg" && "h-12 px-8 text-sm",
              className
            ),
          }}
          connectModal={{
            size: "wide",
            title: "CONNECT YOUR WALLET",
            titleIcon: "",
            showThirdwebBranding: false,
          }}
        />

        {/* Corner decorations */}
        <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" aria-hidden="true" />
        <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" aria-hidden="true" />
        
        {/* Pulse effect on hover */}
        <div className="absolute inset-0 rounded-md bg-primary/20 opacity-0 group-hover:animate-pulse-glow pointer-events-none" aria-hidden="true" />
      </div>
    )
  }

  // Default styles for non-cyberpunk variants
  return (
    <ThirdwebConnectButton
      client={client}
      wallets={wallets}
      chains={[
        supportedChains.celoSepolia, // Celo Sepolia testnet (primary)
        supportedChains.celo, // Celo mainnet
      ]}
      connectButton={{
        label: "Connect Wallet",
        className: cn(
          "uppercase font-mono text-xs",
          variant === "outline" && "border-2",
          size === "sm" && "h-8 px-3",
          size === "lg" && "h-12 px-6 text-sm",
          className
        ),
      }}
      connectModal={{
        size: "wide",
        title: "Connect Wallet",
        titleIcon: "",
      }}
    />
  )
}

/**
 * Simple wallet connection button with custom styling
 */
export function WalletConnectButton({ className }: { className?: string }) {
  const client = getThirdwebClient()

  if (!client) {
    return (
      <button
        type="button"
        title="Thirdweb client not configured"
        className={cn("uppercase font-mono text-xs cursor-not-allowed opacity-60", className)}
        disabled
      >
        Connect
      </button>
    )
  }

  return (
    <ThirdwebConnectButton
      client={client}
      wallets={wallets}
      chains={[
        supportedChains.celoSepolia, // Celo Sepolia testnet (primary)
        supportedChains.celo, // Celo mainnet
      ]}
      connectButton={{
        label: "Connect",
        className: cn("uppercase font-mono text-xs", className),
      }}
    />
  )
}
