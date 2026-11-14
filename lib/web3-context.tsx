"use client"

import { useState, useEffect } from "react"
import { useActiveAccount, useActiveWalletChain, useDisconnect } from "thirdweb/react"
import { supportedChains } from "./thirdweb-provider"

export interface WalletConnection {
  address: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
}

export interface NetworkConfig {
  chainId: number
  name: string
  rpcUrl: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  blockExplorer?: string
}

export const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  // Celo ecosystem - supports native CELO and all ERC-20 tokens
  42220: {
    chainId: 42220,
    name: "Celo Mainnet",
    rpcUrl: "https://forno.celo.org",
    nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
    blockExplorer: "https://celoscan.io",
  },
  11142220: {
    chainId: 11142220,
    name: "Celo Sepolia Testnet",
    // Thirdweb handles RPC routing - no need to specify
    rpcUrl: "https://celo-sepolia.drpc.org",
    nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
    blockExplorer: "https://celo-sepolia.blockscout.com",
  },
}

/**
 * Hook to use Web3 functionality via thirdweb SDK
 * This replaces the custom useWeb3 hook and uses thirdweb's hooks instead
 */
export function useWeb3() {
  const [isMounted, setIsMounted] = useState(false)
  
  // Always call hooks unconditionally (Rules of Hooks)
  // They will return null/undefined during SSR, which is fine
  const account = useActiveAccount()
  const chain = useActiveWalletChain()
  const { disconnect } = useDisconnect()

  // Track when component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Only return real data when mounted on client
  const wallet: WalletConnection = {
    address: isMounted ? (account?.address || null) : null,
    chainId: isMounted ? (chain?.id || null) : null,
    isConnected: isMounted ? !!account : false,
    isConnecting: false,
    error: null,
  }

  const network = isMounted && chain?.id ? SUPPORTED_NETWORKS[chain.id] || null : null

  const disconnectWallet = () => {
    if (isMounted && disconnect) {
      disconnect()
    }
  }

  const switchNetwork = async (chainId: number) => {
    if (isMounted) {
      console.log("Switch network to:", chainId)
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return {
    wallet,
    network,
    disconnectWallet,
    switchNetwork,
    formatAddress,
    // Additional thirdweb-specific exports
    account: isMounted ? account : null,
    chain: isMounted ? chain : null,
  }
}
