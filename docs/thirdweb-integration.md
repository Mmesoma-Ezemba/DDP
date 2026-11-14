# thirdweb SDK Integration Guide

## Overview

DDP uses thirdweb SDK for all Web3 functionality as specified in the PRD. This includes wallet connection, smart contract interaction, and blockchain operations.

## Setup

### 1. Get thirdweb Client ID

1. Visit [thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Create an account or sign in
3. Create a new project
4. Copy your Client ID
5. Add it to `.env.local`:

```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here
```

### 2. Installation

The thirdweb SDK is already installed. If you need to reinstall:

```bash
npm install thirdweb
```

## Usage

### Wallet Connection

Use the `ConnectButton` component:

```tsx
import { ConnectButton } from "@/components/web3/connect-button"

<ConnectButton size="sm" />
```

### Accessing Wallet State

Use the `useWeb3` hook:

```tsx
import { useWeb3 } from "@/lib/web3-context"

const { wallet, network, disconnectWallet, formatAddress } = useWeb3()
```

### Smart Contract Interaction

Use the contract utilities:

```tsx
import { getVaultContract, releaseVault } from "@/lib/contracts/vault-contract"
import { supportedChains } from "@/lib/thirdweb-provider"

// Get contract instance
const contract = getVaultContract(vaultAddress, supportedChains.celoSepolia)

// Release vault (called by backend)
await releaseVault(vaultAddress, supportedChains.celoSepolia)
```

## Supported Networks

The app is currently configured for the Celo ecosystem:
- **Celo Mainnet** (Chain ID: 42220)
- **Celo Sepolia Testnet** (Chain ID: 11142220)

## Architecture

### Provider Setup

The `ThirdwebWeb3Provider` wraps the entire app in `app/layout.tsx`:

```tsx
<ThirdwebWeb3Provider>
  {/* Your app */}
</ThirdwebWeb3Provider>
```

### Client Configuration

The thirdweb client is configured in `lib/thirdweb-provider.tsx`:

```tsx
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
})
```

## Next Steps

1. **Smart Contract Development**: Create Solidity contracts for vault management
2. **Contract Deployment**: Deploy contracts using thirdweb
3. **Contract Integration**: Connect frontend to deployed contracts
4. **Backend Integration**: Use thirdweb SDK in Supabase Edge Functions

## Resources

- [thirdweb Documentation](https://portal.thirdweb.com)
- [thirdweb React Hooks](https://portal.thirdweb.com/react)
- [thirdweb Dashboard](https://thirdweb.com/dashboard)

