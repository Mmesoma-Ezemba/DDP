# Thirdweb SDK Integration - DDP Application

**Decentralized Death Protocol - Complete Thirdweb Reference**

---

## Table of Contents
1. [Installation](#installation)
2. [Client Setup](#client-setup)
3. [Provider Configuration](#provider-configuration)
4. [Supported Chains (Celo)](#supported-chains-celo)
5. [Wallet Connection](#wallet-connection)
6. [Contract Interaction](#contract-interaction)
7. [Authentication Flow](#authentication-flow)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Installation

### Install thirdweb SDK

```bash
npm install thirdweb
# or
npx thirdweb install
```

### Current Version
- **thirdweb**: Latest (v5)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript

---

## Client Setup

### Create Thirdweb Client ID

1. Open **Thirdweb Dashboard**: https://thirdweb.com/dashboard
2. Click **Add New** → **Project**
3. Enter project name: `Decentralized Death Protocol`
4. Add **Allowed Domains**:
   - `localhost:3000` (development)
   - Your Vercel domain (production)
5. Copy the **Client ID** (not the Secret ID)

### Environment Variables

**Required in `.env.local`:**

```bash
# Thirdweb
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Vercel Deployment:**
Add these same variables in **Vercel Dashboard** → **Settings** → **Environment Variables**

---

## Provider Configuration

### File: `lib/thirdweb-provider.tsx`

```typescript
"use client"

import { createThirdwebClient } from "thirdweb"
import { ThirdwebProvider } from "thirdweb/react"
import { defineChain } from "thirdweb/chains"
import type { ReactNode } from "react"
import { useMemo } from "react"

// Lazily create the thirdweb client at runtime
let cachedClient: ReturnType<typeof createThirdwebClient> | null = null

export function getThirdwebClient() {
  const isSSR = typeof window === "undefined"
  
  // Use placeholder during SSR to prevent build errors
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || 
    (isSSR ? "placeholder-ssr-client-id" : undefined)
  
  if (!clientId && !isSSR) {
    console.warn("⚠️ NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set")
    return null
  }
  
  if (!cachedClient) {
    cachedClient = createThirdwebClient({ clientId })
  }
  
  return cachedClient
}

// Supported chains - Celo ecosystem only
export const supportedChains = {
  celo: defineChain(42220), // Celo Mainnet
  celoSepolia: defineChain({
    id: 11142220,
    name: "Celo Sepolia Testnet",
    nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
    rpc: "https://alfajores-forno.celo-testnet.org",
    blockExplorers: [
      { name: "Blockscout", url: "https://celo-sepolia.blockscout.com" },
    ],
    testnet: true,
  }),
}

export function ThirdwebWeb3Provider({ children }: { children: ReactNode }) {
  // Call directly without useMemo - the function has its own caching
  // This allows SSR→client transition detection to work properly
  const client = getThirdwebClient()

  if (!client) {
    return <>{children}</>
  }

  return (
    <ThirdwebProvider 
      client={client}
      autoConnect={false} // IMPORTANT: Prevent auto-connect on page load
      appMetadata={{
        name: "Decentralized Death Protocol",
        url: process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : "http://localhost:3000",
        description: "Secure digital legacy management on Web3",
        logoUrl: "/placeholder-logo.svg",
      }}
    >
      {children}
    </ThirdwebProvider>
  )
}
```

### Wrap Your App

**File: `app/layout.tsx`**

```typescript
import { ThirdwebWeb3Provider } from "@/lib/thirdweb-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThirdwebWeb3Provider>
          {children}
        </ThirdwebWeb3Provider>
      </body>
    </html>
  )
}
```

---

## Supported Chains (Celo)

### Why Celo?

The DDP application **exclusively supports Celo blockchain** for:
- Low transaction fees
- Fast block times (~5 seconds)
- Mobile-first design
- Native stablecoin support (cUSD, cEUR)
- Full ERC-20 token compatibility

### Chain Configuration

```typescript
// Celo Mainnet (Production)
export const celoMainnet = defineChain(42220)

// Celo Sepolia Testnet (Development)
export const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia Testnet",
  nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
  rpc: "https://alfajores-forno.celo-testnet.org",
  blockExplorers: [
    { name: "Blockscout", url: "https://celo-sepolia.blockscout.com" },
  ],
  testnet: true,
})
```

### Network Switching

**File: `hooks/use-wallet-auth.ts`**

```typescript
import { useSwitchActiveWalletChain } from "thirdweb/react"
import { supportedChains } from "@/lib/thirdweb-provider"

export function useWalletAuth() {
  const switchChain = useSwitchActiveWalletChain()
  
  // Force switch to Celo Sepolia before authentication
  const authenticate = async () => {
    try {
      await switchChain(supportedChains.celoSepolia)
      // ... rest of auth logic
    } catch (error) {
      if (error.message?.includes("User rejected")) {
        return { success: false, error: "Network switch cancelled" }
      }
      // Prevent auth on wrong network
      return { 
        success: false, 
        error: "Failed to switch network. Please switch manually." 
      }
    }
  }
}
```

---

## Wallet Connection

### ConnectButton Component

**File: `components/web3/connect-button.tsx`**

```typescript
"use client"

import { ConnectButton as ThirdwebConnectButton } from "thirdweb/react"
import { getThirdwebClient, supportedChains } from "@/lib/thirdweb-provider"
import { 
  createWallet,
  walletConnect,
  inAppWallet,
} from "thirdweb/wallets"

// Supported wallets for mobile + desktop
const wallets = [
  createWallet("io.metamask"), // MetaMask
  createWallet("com.coinbase.wallet"), // Coinbase Wallet
  walletConnect(), // WalletConnect (QR code)
  inAppWallet(), // Email/social login
  createWallet("me.rainbow"), // Rainbow
]

export function ConnectButton({ variant = "default" }) {
  const client = getThirdwebClient()

  if (!client) {
    return (
      <button disabled>
        Connect Wallet
      </button>
    )
  }

  return (
    <ThirdwebConnectButton
      client={client}
      wallets={wallets}
      chains={[
        supportedChains.celoSepolia, // Primary testnet
        supportedChains.celo, // Mainnet
      ]}
      connectButton={{
        label: "CONNECT WALLET",
        className: "uppercase font-mono text-xs",
      }}
      connectModal={{
        size: "wide",
        title: "CONNECT YOUR WALLET",
        showThirdwebBranding: false,
      }}
    />
  )
}
```

### Usage in Pages

```typescript
import dynamic from "next/dynamic"

// Dynamic import to prevent SSR issues
const ConnectButton = dynamic(
  () => import("@/components/web3/connect-button").then(mod => mod.ConnectButton),
  { ssr: false }
)

export default function AuthPage() {
  return (
    <div>
      <h1>Connect Your Wallet</h1>
      <ConnectButton variant="cyberpunk" />
    </div>
  )
}
```

---

## Contract Interaction

### Get Contract Instance

**File: `lib/contracts/vault-contract.ts`**

```typescript
import { getContract } from "thirdweb/contract"
import { getThirdwebClient, supportedChains } from "@/lib/thirdweb-provider"

// Get vault contract instance
export function getVaultContract(
  vaultAddress: string,
  chain = supportedChains.celoSepolia
) {
  const client = getThirdwebClient()
  
  if (!client) {
    throw new Error("Thirdweb client not configured")
  }
  
  return getContract({
    client,
    address: vaultAddress,
    chain,
  })
}
```

### Read Contract Data

```typescript
import { useReadContract } from "thirdweb/react"

export function VaultInfo({ vaultAddress }) {
  const contract = getVaultContract(vaultAddress)
  
  // Read vault owner
  const { data: owner, isPending } = useReadContract({
    contract,
    method: "function owner() view returns (address)",
    params: [],
  })
  
  // Read vault status
  const { data: isActive } = useReadContract({
    contract,
    method: "function isActive() view returns (bool)",
    params: [],
  })
  
  return (
    <div>
      <p>Owner: {owner}</p>
      <p>Active: {isActive ? "Yes" : "No"}</p>
    </div>
  )
}
```

### Write Contract Data

```typescript
import { prepareContractCall } from "thirdweb"
import { useSendTransaction } from "thirdweb/react"

export function CreateVault() {
  const { mutate: sendTransaction } = useSendTransaction()
  
  const handleCreateVault = async () => {
    const contract = getVaultContract(CONTRACT_ADDRESS)
    
    const transaction = prepareContractCall({
      contract,
      method: "function createVault(address beneficiary, uint256 unlockTime)",
      params: [beneficiaryAddress, unlockTimestamp],
    })
    
    sendTransaction(transaction, {
      onSuccess: (result) => {
        console.log("Vault created:", result)
      },
      onError: (error) => {
        console.error("Error:", error)
      },
    })
  }
  
  return (
    <button onClick={handleCreateVault}>
      Create Vault
    </button>
  )
}
```

---

## Authentication Flow

### Wallet-Based Authentication

**DDP uses EIP-191 signature-based authentication:**

1. User connects wallet via thirdweb
2. Backend generates a nonce
3. User signs authentication message
4. Backend verifies signature
5. Session established in Supabase

**File: `hooks/use-wallet-auth.ts`**

```typescript
import { useActiveAccount, useSwitchActiveWalletChain } from "thirdweb/react"
import { generateNonce, authenticateWithWallet } from "@/lib/auth/wallet-auth"
import { generateAuthMessage } from "@/lib/auth/auth-message"
import { supportedChains } from "@/lib/thirdweb-provider"

export function useWalletAuth() {
  const account = useActiveAccount()
  const switchChain = useSwitchActiveWalletChain()
  
  const authenticate = async () => {
    if (!account?.address) {
      return { success: false, error: "No wallet connected" }
    }
    
    try {
      // Step 1: Switch to Celo Sepolia
      await switchChain(supportedChains.celoSepolia)
      
      // Step 2: Generate nonce
      const nonce = await generateNonce(account.address)
      
      // Step 3: Create message to sign
      const message = generateAuthMessage(account.address, nonce)
      
      // Step 4: Sign with wallet
      const signature = await account.signMessage({ message })
      
      // Step 5: Authenticate with backend
      const result = await authenticateWithWallet(
        account.address,
        signature,
        nonce
      )
      
      return result
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  return { authenticate }
}
```

---

## Best Practices

### 1. **Always Use Dynamic Imports for Client Components**

```typescript
// ❌ BAD: Causes hydration errors
import { ConnectButton } from "@/components/web3/connect-button"

// ✅ GOOD: Prevents SSR issues
const ConnectButton = dynamic(
  () => import("@/components/web3/connect-button").then(mod => mod.ConnectButton),
  { ssr: false }
)
```

### 2. **Handle SSR Gracefully**

```typescript
export function useWeb3() {
  const [isMounted, setIsMounted] = useState(false)
  const account = useActiveAccount() // Always call hooks unconditionally
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Only return real data on client
  return {
    address: isMounted ? account?.address : null,
    isConnected: isMounted ? !!account : false,
  }
}
```

### 3. **Disable Auto-Connect**

```typescript
// Always set autoConnect={false} in ThirdwebProvider
<ThirdwebProvider 
  client={client}
  autoConnect={false} // Prevents race conditions and hydration errors
>
```

### 4. **Clear Cache on Auth Pages**

```typescript
useEffect(() => {
  if (typeof window !== 'undefined') {
    // Clear thirdweb's auto-connect cache
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.startsWith('thirdweb') || key.startsWith('tw-')
    )
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }
}, [])
```

### 5. **Suppress Harmless Hydration Warnings**

```typescript
// Browser extensions (MetaMask) cause false-positive hydration warnings
<html suppressHydrationWarning>
  <body suppressHydrationWarning>
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. **Hydration Error #418**
**Cause:** Browser extensions injecting content before React hydrates  
**Solution:** Add `suppressHydrationWarning` to html/body tags

#### 2. **"Cannot set wallet without account"**
**Cause:** Auto-connect attempting to restore non-existent session  
**Solution:** Set `autoConnect={false}` and clear localStorage cache

#### 3. **401 Unauthorized from thirdweb**
**Cause:** Missing or invalid `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`  
**Solution:** Add valid Client ID to environment variables

#### 4. **ERR_CERT_AUTHORITY_INVALID (Celo RPC)**
**Cause:** SSL certificate issue with default Celo RPC  
**Solution:** Use `https://alfajores-forno.celo-testnet.org`

#### 5. **"User rejected" during authentication**
**Cause:** User cancelled wallet signature request  
**Solution:** Handle gracefully with toast notification

```typescript
try {
  const signature = await account.signMessage({ message })
} catch (error) {
  if (error.message?.includes("User rejected")) {
    toast.info("Authentication cancelled")
    return
  }
  throw error
}
```

---

## Additional Resources

- **Thirdweb Portal**: https://portal.thirdweb.com
- **Thirdweb SDK Reference**: https://portal.thirdweb.com/references/typescript/v5
- **Celo Documentation**: https://docs.celo.org
- **DDP PRD**: `../PRD.md`
- **Deployment Guide**: `./DEPLOYMENT_CHECKLIST.md`

---

## Quick Reference Commands

```bash
# Install dependencies
npm install thirdweb @supabase/supabase-js viem

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Deploy to IPFS (thirdweb)
npx thirdweb deploy --app
```

---

**Last Updated:** November 2024  
**Version:** 1.0.0  
**Maintainer:** DDP Development Team

