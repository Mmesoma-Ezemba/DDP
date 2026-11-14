# Deployment Checklist for DDP

## Current Errors Summary

Your application is experiencing these errors because **backend services are not yet configured**:

### 1. ❌ Supabase Database Not Set Up
```
Error: Cannot coerce the result to a single JSON object
GET /rest/v1/users 406 (Not Acceptable)
```

**Issue**: The Supabase database and tables don't exist yet.

**Solution Required**:
1. Create a Supabase project at https://supabase.com
2. Set up the database schema (see below)
3. Add environment variables to Vercel

### 2. ⚠️ Celo Sepolia RPC SSL Issue
```
POST https://sepolia-forno.celo-testnet.org/ net::ERR_CERT_AUTHORITY_INVALID
```

**Issue**: The Celo Sepolia RPC endpoint has SSL certificate issues.

**Solution**: Use alternative RPC endpoints (see below)

### 3. ❌ Wallet Authentication Failing (401)
```
POST /api/auth/wallet 401 (Unauthorized)
```

**Issue**: Cannot verify wallet signatures without Supabase database.

---

## ✅ Setup Steps

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Set project name: `ddp-production` or `ddp-dev`
4. Set strong database password
5. Choose region closest to you
6. Wait for project to finish setting up

### Step 2: Create Database Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index on wallet_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address 
ON public.profiles(wallet_address);

-- Create vaults table (for future use)
CREATE TABLE IF NOT EXISTS public.vaults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_wallet TEXT NOT NULL REFERENCES public.profiles(wallet_address),
  contract_address TEXT NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create beneficiaries table (for future use)
CREATE TABLE IF NOT EXISTS public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vault_id UUID REFERENCES public.vaults(id),
  wallet_address TEXT NOT NULL,
  access_level TEXT DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_logs table (for future use)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create heartbeats table (for future use)
CREATE TABLE IF NOT EXISTS public.heartbeats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heartbeats ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - allow all for now, refine later)
CREATE POLICY "Enable read access for all users" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for own profile" ON public.profiles
  FOR UPDATE USING (true);
```

### Step 3: Get Supabase Credentials

1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Step 4: Add Environment Variables to Vercel

Go to your Vercel project → **Settings** → **Environment Variables**

Add these 3 variables:

```bash
# Thirdweb
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_from_thirdweb

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your_key_here
```

### Step 5: Fix Celo Sepolia RPC (Optional)

If you continue to see SSL errors, update the RPC URL:

**File**: `lib/web3-context.tsx`

Change:
```typescript
11142220: {
  chainId: 11142220,
  name: "Celo Sepolia Testnet",
  rpcUrl: "https://sepolia-forno.celo-testnet.org", // ❌ Has SSL issues
  ...
}
```

To:
```typescript
11142220: {
  chainId: 11142220,
  name: "Celo Sepolia Testnet",
  rpcUrl: "https://alfajores-forno.celo-testnet.org", // ✅ Stable testnet
  ...
}
```

**Note**: Alfajores is the official Celo testnet and more stable than Sepolia for development.

### Step 6: Redeploy on Vercel

After adding environment variables:

1. Go to Vercel project
2. Click **Deployments** tab
3. Find latest deployment
4. Click **⋮ (three dots)** → **Redeploy**
5. Check "Use existing Build Cache" (optional)
6. Click **Redeploy**

---

## ✅ After Setup Checklist

Once you've completed the above steps, verify:

- [ ] Supabase project is created
- [ ] Database tables exist (run SQL above)
- [ ] Environment variables are set in Vercel
- [ ] Vercel deployment is redeployed
- [ ] Visit your site and try to connect wallet
- [ ] Check browser console - errors should be gone
- [ ] Successful wallet authentication creates a profile in Supabase

---

## Current vs. Required State

| Component | Current Status | Required Status |
|-----------|---------------|-----------------|
| Frontend | ✅ Deployed | ✅ Working |
| Thirdweb SDK | ✅ Integrated | ✅ Working |
| Supabase DB | ❌ Not set up | ❌ **NEEDS SETUP** |
| Environment Vars | ⚠️ Partial | ❌ **NEEDS SUPABASE VARS** |
| Celo RPC | ⚠️ SSL Issues | ⚠️ **MAY NEED UPDATE** |
| Auth Flow | ❌ Failing | Will work after Supabase |

---

## Quick Test After Setup

1. Visit: `https://your-app.vercel.app/login`
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. App will switch to Celo Sepolia (approve in MetaMask)
5. Sign authentication message (approve in MetaMask)
6. Should redirect to dashboard
7. Check Supabase → Table Editor → profiles table
8. You should see your wallet address stored!

---

## Need Help?

**Supabase**: https://supabase.com/docs
**Thirdweb**: https://portal.thirdweb.com/
**Celo**: https://docs.celo.org/

**Common Issues**:
- RLS blocking inserts → Disable RLS or adjust policies
- Wrong table name → Use `profiles` not `users`
- Wrong env var names → Must start with `NEXT_PUBLIC_`

