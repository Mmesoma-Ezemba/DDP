# 🚀 Quick Start Guide

## Your Integration is Live! ✅

The Thirdweb + Supabase integration is complete and your database is set up.

---

## 🎯 Test It Now (2 minutes)

### 1. Start Your Dev Server

```bash
npm run dev
```

### 2. Test Authentication

1. Open http://localhost:3000/login
2. Click "Connect Wallet"
3. Sign the authentication message
4. ✅ You should be redirected to the dashboard

### 3. Verify in Supabase

Go to: https://supabase.com/dashboard/project/gxpvmfrpjszzfhnwlwfu

Click "Table Editor" → "users" table

You should see your wallet address! 🎉

---

## 💡 Quick Examples

### Create a Vault

```typescript
import { createVault } from "@/lib/supabase"
import { useActiveAccount } from "thirdweb/react"

function CreateVault() {
  const account = useActiveAccount()
  
  const handleCreate = async () => {
    const vault = await createVault(account!.address, {
      name: "My Emergency Vault",
      inactivity_timer_days: 90,
    })
    console.log('Vault created:', vault.id)
  }
  
  return <button onClick={handleCreate}>Create Vault</button>
}
```

### Add a Beneficiary

```typescript
import { addBeneficiary } from "@/lib/supabase"

await addBeneficiary(vaultId, {
  address: "0xbeneficiary...",
  name: "Trusted Friend",
  shares_percentage: 100,
})
```

### Log a Heartbeat

```typescript
import { logHeartbeat, updateVaultHeartbeat } from "@/lib/supabase"

// Log activity
await logHeartbeat(walletAddress, vaultId)

// Update vault timestamp
await updateVaultHeartbeat(vaultId)
```

### Get User's Vaults

```typescript
import { getUserVaults } from "@/lib/supabase"

const vaults = await getUserVaults(walletAddress)
console.log(`User has ${vaults.length} vaults`)
```

---

## 📚 Full Documentation

Need more details? Check these files:

1. **`docs/thirdweb-supabase-integration.md`**
   - Complete architecture
   - All API functions
   - Advanced examples

2. **`SETUP_COMPLETE.md`**
   - What was created
   - Verification steps
   - Next actions

3. **`docs/INTEGRATION_SUMMARY.md`**
   - Implementation details
   - File structure
   - Next steps

---

## 🗄️ Database Schema

Your Supabase project now has:

| Table | Purpose |
|-------|---------|
| **users** | User profiles (wallet_address, name, email) |
| **vaults** | Vault metadata (encryption, contracts, heartbeat) |
| **beneficiaries** | Who can access vaults (address, shares) |
| **activity_logs** | Activity tracking (login, heartbeats, operations) |
| **heartbeats** | Legacy support (use activity_logs) |

---

## 🔑 Key Imports

```typescript
import {
  // User Management
  createOrGetUser,
  getUserByWallet,
  updateUser,
  handleUserLogin,
  
  // Vault Management
  createVault,
  getUserVaults,
  getVaultById,
  updateVaultHeartbeat,
  linkVaultToContract,
  triggerVault,
  
  // Beneficiary Management
  addBeneficiary,
  getVaultBeneficiaries,
  markBeneficiaryAccessed,
  
  // Activity Logging
  logHeartbeat,
  logVaultCreated,
  getUserActivityLogs,
  
  // Types
  type User,
  type Vault,
  type Beneficiary,
  type ActivityLog,
} from "@/lib/supabase"
```

---

## ✅ What's Working

- ✅ Wallet-based authentication via Thirdweb
- ✅ User creation in Supabase on login
- ✅ Activity logging (device info, IP address)
- ✅ Vault CRUD operations
- ✅ Beneficiary management
- ✅ Heartbeat monitoring
- ✅ Smart contract linking (ready for deployment)
- ✅ Row Level Security (RLS) enabled
- ✅ Type-safe TypeScript interfaces

---

## 🎯 Build Your Features

Now you can:

1. **Create vault management UI**
   - Form to create vaults
   - List of user's vaults
   - Vault details page

2. **Build beneficiary interface**
   - Add/remove beneficiaries
   - Set share percentages
   - View access status

3. **Add heartbeat monitoring**
   - Manual heartbeat button
   - Automatic periodic heartbeats
   - Visual timer/countdown

4. **Deploy smart contracts**
   - Deploy to Celo testnet
   - Link vaults to contracts
   - Test trigger mechanism

---

## 🆘 Need Help?

### Issue: Can't log in

**Check:**
- Wallet connected?
- Environment variables set?
- Check browser console for errors

### Issue: Can't see data in Supabase

**Check:**
- RLS policies enabled?
- Using correct wallet address?
- Check Supabase logs

### Issue: TypeScript errors

**Fix:**
```bash
npm run build
```

---

## 🎉 You're Ready!

Your full stack is integrated:

```
Thirdweb (Wallet) → Next.js API → Supabase → Celo (Soon)
```

**Start building! 🚀**
