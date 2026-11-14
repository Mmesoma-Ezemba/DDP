# Thirdweb + Supabase Integration Guide

> **Complete wallet-based authentication with persistent off-chain data storage**

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Setup Instructions](#setup-instructions)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### Full Stack Flow

```
🧍 User
   ↓
🦊 Connects Wallet via Thirdweb
   ↓
🔐 Thirdweb Auth (Signs message + JWT generated)
   ↓
🧰 Next.js API Routes (/api/auth/wallet)
   ↓
🗄️ Supabase (stores user + vault metadata)
   ↓
💾 Smart Contracts on Celo (vault release logic)
```

### Key Components

| Component | Purpose | Technology |
|-----------|---------|------------|
| **Thirdweb** | Wallet connection & signature verification | React SDK + Node.js |
| **Supabase** | Off-chain data persistence & analytics | PostgreSQL + REST API |
| **Celo** | On-chain trustless execution | Smart Contracts (EVM) |
| **Next.js** | Backend API & authentication logic | API Routes + Server Actions |

### Why This Architecture?

- **Thirdweb**: Best-in-class wallet experience, handles wallet connection and signing
- **Supabase**: Scalable off-chain storage for metadata, activity logs, and user data
- **Celo**: Gas-efficient blockchain for smart contract execution
- **Separation of Concerns**: On-chain for trustless logic, off-chain for user experience

---

## 🗄️ Database Schema

### Tables Overview

```sql
users           -- User profiles linked to wallet addresses
vaults          -- Encrypted vault metadata and smart contract links
beneficiaries   -- Users who can access vaults after trigger
activity_logs   -- User activity tracking and heartbeats
heartbeats      -- (Deprecated) Use activity_logs instead
```

### Table: `users`

Stores user profiles identified by wallet address.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);
```

**Key Points:**
- `wallet_address` is the unique identifier (lowercase, indexed)
- `metadata` stores flexible JSON data for custom fields
- `last_active` tracks user activity for inactivity detection

### Table: `vaults`

Stores vault metadata and links to smart contracts.

```sql
CREATE TABLE vaults (
  id UUID PRIMARY KEY,
  owner_wallet TEXT NOT NULL REFERENCES users(wallet_address),
  name TEXT NOT NULL DEFAULT 'My Vault',
  description TEXT,
  encrypted_data_uri TEXT,        -- IPFS/Arweave URI
  encryption_method TEXT,         -- 'lit-protocol', 'aes', etc.
  inactivity_timer_days INTEGER DEFAULT 365,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  is_triggered BOOLEAN DEFAULT FALSE,
  triggered_at TIMESTAMPTZ,
  contract_address TEXT,          -- Smart contract address
  chain_id INTEGER,               -- Celo chain ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);
```

**Key Points:**
- Links to smart contracts via `contract_address` and `chain_id`
- `encrypted_data_uri` points to encrypted data on IPFS/Arweave
- `last_heartbeat` tracks user activity for deadman switch
- `is_triggered` indicates vault has been activated

### Table: `beneficiaries`

Defines who can access vaults and under what conditions.

```sql
CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY,
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  name TEXT,
  unlock_condition TEXT DEFAULT 'inactivity',
  unlock_date TIMESTAMPTZ,
  shares_percentage DECIMAL(5,2) DEFAULT 100.00,
  has_accessed BOOLEAN DEFAULT FALSE,
  accessed_at TIMESTAMPTZ,
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);
```

**Key Points:**
- Multiple beneficiaries can share a vault (split by percentage)
- `unlock_condition`: 'inactivity', 'manual', or 'time-based'
- Tracks notification and access status

### Table: `activity_logs`

Comprehensive activity tracking for all user actions.

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  wallet_address TEXT NOT NULL REFERENCES users(wallet_address),
  vault_id UUID REFERENCES vaults(id),
  activity_type TEXT NOT NULL,
  description TEXT,
  device_info JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  location JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);
```

**Activity Types:**
- `heartbeat` - User activity proof
- `login` / `logout` - Authentication events
- `vault_created` / `vault_updated` / `vault_triggered` - Vault operations
- `vault_accessed` - Beneficiary access
- `beneficiary_added` / `beneficiary_removed` - Beneficiary management

---

## 🔐 Authentication Flow

### Step-by-Step Process

#### 1. **User Connects Wallet**

```typescript
import { ConnectButton } from "thirdweb/react"

<ConnectButton client={client} />
```

Thirdweb handles wallet connection (MetaMask, WalletConnect, etc.)

#### 2. **Generate Nonce**

```typescript
const response = await fetch("/api/auth/nonce", {
  method: "POST",
  body: JSON.stringify({ walletAddress }),
})
const { nonce } = await response.json()
```

Backend generates a unique nonce to prevent replay attacks.

#### 3. **Sign Authentication Message**

```typescript
const message = `Sign this message to authenticate with your wallet.
Wallet: ${walletAddress}
Nonce: ${nonce}
Timestamp: ${timestamp}`

const signature = await account.signMessage({ message })
```

User signs the message with their wallet.

#### 4. **Verify Signature & Create User**

```typescript
// Backend: /api/auth/wallet
const isValid = await verifyWalletSignature(walletAddress, signature, message)

if (isValid) {
  const user = await handleUserLogin(walletAddress, {
    device_info: getDeviceInfoFromUserAgent(userAgent),
    location: { ip_address },
  })
  
  return { success: true, user, session }
}
```

Backend verifies signature and creates/fetches Supabase user.

#### 5. **Store Session**

```typescript
// Client-side
document.cookie = `wallet-address=${walletAddress}; path=/; max-age=86400`
localStorage.setItem('auth-session', JSON.stringify(session))
```

Session data stored in cookies/localStorage for subsequent requests.

### Authentication Hooks

#### `useWalletAuth()`

Handles complete authentication flow.

```typescript
import { useWalletAuth } from "@/hooks/use-wallet-auth"

function LoginPage() {
  const { authenticate, signup, isLoading, error } = useWalletAuth()
  
  const handleLogin = async () => {
    const result = await authenticate()
    if (result.success) {
      router.push('/dashboard')
    }
  }
  
  const handleSignup = async () => {
    const result = await signup({
      email: 'user@example.com',
      username: 'myusername'
    })
  }
}
```

#### `useAuth()`

Checks authentication status and manages sessions.

```typescript
import { useAuth } from "@/hooks/use-auth"

function ProtectedPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  
  if (isLoading) return <Loading />
  if (!isAuthenticated) return <Redirect to="/login" />
  
  return <Dashboard user={user} />
}
```

---

## 📚 API Reference

### User Operations

```typescript
import {
  createOrGetUser,
  getUserByWallet,
  updateUser,
  updateLastActive,
  handleUserLogin,
  handleUserLogout,
} from "@/lib/supabase"
```

#### `createOrGetUser(walletAddress, metadata?)`

Creates a new user or fetches existing one.

```typescript
const user = await createOrGetUser("0x123...", {
  name: "John Doe",
  email: "john@example.com",
  username: "johndoe"
})
```

#### `getUserByWallet(walletAddress)`

Fetches user by wallet address.

```typescript
const user = await getUserByWallet("0x123...")
```

#### `updateUser(walletAddress, updates)`

Updates user profile.

```typescript
await updateUser("0x123...", {
  name: "Jane Doe",
  avatar_url: "https://..."
})
```

### Vault Operations

```typescript
import {
  createVault,
  getUserVaults,
  updateVaultHeartbeat,
  linkVaultToContract,
  triggerVault,
  checkVaultInactivity,
} from "@/lib/supabase"
```

#### `createVault(walletAddress, vaultData)`

Creates a new vault.

```typescript
const vault = await createVault("0x123...", {
  name: "My Emergency Vault",
  description: "Access to crypto in case of emergency",
  inactivity_timer_days: 90,
  encrypted_data_uri: "ipfs://...",
})
```

#### `linkVaultToContract(vaultId, contractAddress, chainId)`

Links vault to deployed smart contract.

```typescript
await linkVaultToContract(
  vaultId,
  "0xcontract...",
  42220 // Celo mainnet
)
```

#### `updateVaultHeartbeat(vaultId)`

Updates last heartbeat (user is active).

```typescript
await updateVaultHeartbeat(vaultId)
```

#### `triggerVault(vaultId)`

Activates deadman switch.

```typescript
const triggered = await triggerVault(vaultId)
```

### Beneficiary Operations

```typescript
import {
  addBeneficiary,
  getVaultBeneficiaries,
  markBeneficiaryAccessed,
  notifyAllBeneficiaries,
} from "@/lib/supabase"
```

#### `addBeneficiary(vaultId, beneficiaryData)`

Adds a beneficiary to a vault.

```typescript
const beneficiary = await addBeneficiary(vaultId, {
  address: "0xbeneficiary...",
  name: "Alice",
  shares_percentage: 50.0,
  unlock_condition: "inactivity"
})
```

#### `getVaultBeneficiaries(vaultId)`

Gets all beneficiaries for a vault.

```typescript
const beneficiaries = await getVaultBeneficiaries(vaultId)
```

### Activity Logging

```typescript
import {
  logActivity,
  logHeartbeat,
  logVaultCreated,
  getUserActivityLogs,
  getUserActivityStats,
} from "@/lib/supabase"
```

#### `logHeartbeat(walletAddress, vaultId?, deviceInfo?, location?)`

Logs user activity heartbeat.

```typescript
await logHeartbeat("0x123...", vaultId, {
  browser: "Chrome",
  os: "macOS",
  device_type: "desktop"
})
```

#### `getUserActivityStats(walletAddress, days?)`

Gets activity statistics.

```typescript
const stats = await getUserActivityStats("0x123...", 30)
// Returns: { totalActivities, heartbeats, vaultOperations, loginCount, lastActive }
```

---

## 💡 Usage Examples

### Example 1: Complete Signup Flow

```typescript
import { useWalletAuth } from "@/hooks/use-wallet-auth"
import { createVault, addBeneficiary } from "@/lib/supabase"

function SignupFlow() {
  const { signup, isLoading, address } = useWalletAuth()
  
  const handleSignup = async (formData) => {
    // 1. Authenticate with wallet
    const authResult = await signup({
      name: formData.name,
      email: formData.email,
    })
    
    if (!authResult.success) return
    
    // 2. Create first vault
    const vault = await createVault(address!, {
      name: "My First Vault",
      inactivity_timer_days: 90,
    })
    
    // 3. Add beneficiary
    await addBeneficiary(vault.id, {
      address: formData.beneficiaryAddress,
      name: formData.beneficiaryName,
      shares_percentage: 100,
    })
    
    // 4. Redirect to dashboard
    router.push('/dashboard')
  }
}
```

### Example 2: Heartbeat Monitoring

```typescript
import { updateVaultHeartbeat, logHeartbeat } from "@/lib/supabase"
import { useActiveAccount } from "thirdweb/react"

function HeartbeatMonitor({ vaultId }: { vaultId: string }) {
  const account = useActiveAccount()
  
  useEffect(() => {
    if (!account?.address) return
    
    // Send heartbeat every 24 hours
    const interval = setInterval(async () => {
      await updateVaultHeartbeat(vaultId)
      await logHeartbeat(account.address, vaultId)
    }, 24 * 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [account?.address, vaultId])
}
```

### Example 3: Vault Trigger Check (Backend Cron Job)

```typescript
// /api/cron/check-vaults
import { getVaultsNeedingTrigger, triggerVault, notifyAllBeneficiaries } from "@/lib/supabase"

export async function GET(request: Request) {
  // Get vaults that exceeded inactivity threshold
  const vaults = await getVaultsNeedingTrigger()
  
  for (const vault of vaults) {
    // Trigger vault
    await triggerVault(vault.id)
    
    // Notify beneficiaries
    await notifyAllBeneficiaries(vault.id)
    
    // Optionally: trigger smart contract
    // await triggerSmartContract(vault.contract_address)
  }
  
  return Response.json({ triggered: vaults.length })
}
```

### Example 4: Beneficiary Access

```typescript
import { getAccessibleVaults, markBeneficiaryAccessed } from "@/lib/supabase"
import { useActiveAccount } from "thirdweb/react"

function BeneficiaryDashboard() {
  const account = useActiveAccount()
  const [vaults, setVaults] = useState([])
  
  useEffect(() => {
    async function loadVaults() {
      if (!account?.address) return
      
      // Get triggered vaults accessible to this beneficiary
      const accessible = await getAccessibleVaults(account.address)
      setVaults(accessible)
    }
    
    loadVaults()
  }, [account?.address])
  
  const handleAccessVault = async (beneficiaryId: string) => {
    // Mark as accessed
    await markBeneficiaryAccessed(beneficiaryId)
    
    // Decrypt and show vault contents
    // ... decryption logic ...
  }
}
```

---

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install thirdweb viem
```

### 2. Set Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your-client-id
```

### 3. Run Database Migrations

```bash
# In Supabase dashboard, run the SQL migration:
psql < supabase/migrations/001_initial_schema.sql
```

Or use Supabase CLI:

```bash
supabase db push
```

### 4. Configure Row Level Security (RLS)

The migration includes RLS policies automatically. Key policies:

- Users can only read/update their own profile
- Vault owners have full access to their vaults
- Beneficiaries can view triggered vaults they're assigned to
- Activity logs are user-scoped

### 5. Test Authentication

```typescript
// Test in your app
import { useWalletAuth } from "@/hooks/use-wallet-auth"

function TestAuth() {
  const { authenticate, isLoading, error } = useWalletAuth()
  
  return (
    <button onClick={authenticate} disabled={isLoading}>
      {isLoading ? "Authenticating..." : "Login with Wallet"}
    </button>
  )
}
```

---

## ✅ Best Practices

### Security

1. **Always lowercase wallet addresses** - Ensures consistency
   ```typescript
   const address = walletAddress.toLowerCase()
   ```

2. **Validate signatures server-side** - Never trust client
   ```typescript
   const isValid = await verifyWalletSignature(address, signature, message)
   ```

3. **Use nonces to prevent replay attacks** - Each authentication attempt needs unique nonce

4. **Set appropriate session timeouts** - Balance UX and security
   ```typescript
   max-age=86400 // 24 hours
   ```

### Performance

1. **Index frequently queried fields** - Already done in migration
   ```sql
   CREATE INDEX idx_users_wallet_address ON users(wallet_address);
   ```

2. **Use pagination for large datasets**
   ```typescript
   const logs = await getUserActivityLogs(address, { limit: 50, offset: 0 })
   ```

3. **Cache user data** - Use React Query or SWR
   ```typescript
   const { data: user } = useQuery(['user', address], () => getUserByWallet(address))
   ```

### Data Management

1. **Clean up old activity logs** - Run periodic cleanup
   ```typescript
   await deleteOldActivityLogs(365) // Keep 1 year
   ```

2. **Validate beneficiary shares** - Ensure they add up to 100%
   ```typescript
   const { isValid } = await validateSharesDistribution(vaultId)
   ```

3. **Use metadata fields for extensibility** - Store custom data in JSONB
   ```typescript
   metadata: { customField: "value", anotherField: 123 }
   ```

---

## 🐛 Troubleshooting

### Issue: User not found after authentication

**Cause**: Race condition between authentication and user creation

**Solution**: Ensure `handleUserLogin` completes before redirecting
```typescript
const user = await handleUserLogin(walletAddress)
if (!user) throw new Error("Failed to create user")
```

### Issue: RLS blocking queries

**Cause**: JWT claims not set correctly

**Solution**: Set wallet_address claim in JWT
```typescript
// In your JWT generation
claims: {
  wallet_address: walletAddress.toLowerCase()
}
```

### Issue: Vault not triggering despite inactivity

**Cause**: Heartbeat timestamp not updating

**Solution**: Ensure heartbeat updates are working
```typescript
await updateVaultHeartbeat(vaultId)
const vault = await getVaultById(vaultId)
console.log('Last heartbeat:', vault.last_heartbeat)
```

### Issue: Signature verification failing

**Cause**: Message format mismatch

**Solution**: Ensure message format matches on client and server
```typescript
// Both client and server must use same format
const message = generateAuthMessage(walletAddress, nonce)
```

---

## 📖 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Thirdweb Documentation](https://portal.thirdweb.com/)
- [Celo Developer Docs](https://docs.celo.org/)
- [Viem (Signature Verification)](https://viem.sh/)

---

## 🤝 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing GitHub issues
3. Create a new issue with detailed reproduction steps

---

**Built with ❤️ using Thirdweb, Supabase, and Celo**
