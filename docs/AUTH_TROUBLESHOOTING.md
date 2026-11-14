# Authentication Troubleshooting Guide

**DDP - Fixing Authentication Issues**

---

## Quick Diagnostic Checklist

Run through this checklist in order:

### ✅ Step 1: Check Environment Variables

**Visit:** http://localhost:3000/api/auth/debug

You should see:
```json
{
  "environment": {
    "hasSupabaseUrl": true,
    "hasSupabaseKey": true,
    "hasThirdwebClientId": true
  },
  "supabase": {
    "status": "connected",
    "tableExists": true
  }
}
```

**If any `false` values appear:**

1. Check your `.env.local` file exists in the project root
2. Verify it contains:
   ```bash
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_actual_client_id
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
   ```
3. Restart your dev server after adding variables:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

---

### ✅ Step 2: Verify Supabase Project Setup

1. **Login to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project (or create one if you haven't)

2. **Get Your Credentials:**
   - Go to **Settings** → **API**
   - Copy **Project URL** → This is `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon public** key → This is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Check if credentials are correct:**
   - Visit: http://localhost:3000/api/auth/debug
   - Should show `"status": "connected"`

---

### ✅ Step 3: Create Database Tables

**CRITICAL:** The database schema MUST be created before authentication will work.

1. **Open Supabase SQL Editor:**
   - Go to **SQL Editor** in Supabase Dashboard
   - Click **New Query**

2. **Copy the entire schema:**
   - Open: `supabase-schema.sql` in your project
   - Copy ALL 236 lines
   - Paste into Supabase SQL Editor

3. **Run the schema:**
   - Click **RUN** button
   - Wait for "Success. No rows returned"

4. **Verify tables were created:**
   - Go to **Table Editor** in Supabase
   - You should see:
     - ✅ `profiles` table
     - ✅ `vaults` table
     - ✅ `beneficiaries` table
     - ✅ `activity_logs` table
     - ✅ `heartbeats` table

---

### ✅ Step 4: Test Database Connection

**Visit:** http://localhost:3000/api/auth/debug

**Expected Response:**
```json
{
  "environment": {
    "hasSupabaseUrl": true,
    "hasSupabaseKey": true,
    "hasThirdwebClientId": true,
    "supabaseUrlPreview": "https://gxpvmfrpjszzfhnwlwfu..."
  },
  "configuration": {
    "tableNames": {
      "USERS": "profiles",
      "PROFILES": "profiles",
      "VAULTS": "vaults",
      "BENEFICIARIES": "beneficiaries",
      "ACTIVITY_LOGS": "activity_logs",
      "HEARTBEATS": "heartbeats"
    }
  },
  "supabase": {
    "status": "connected",
    "tableExists": true
  }
}
```

**If you see errors:**

#### Error: "relation 'profiles' does not exist"
**Solution:** Run the SQL schema (Step 3)

#### Error: "Invalid API key"
**Solution:** 
1. Get fresh credentials from Supabase Dashboard
2. Update `.env.local`
3. Restart dev server

#### Error: "Failed to fetch"
**Solution:**
1. Check your internet connection
2. Verify Supabase project is not paused
3. Check Supabase status: https://status.supabase.com

---

### ✅ Step 5: Test Wallet Connection

1. **Visit login page:** http://localhost:3000/login

2. **Click "CONNECT WALLET"**
   - Should see thirdweb wallet selection modal
   - Should NOT see any console errors

3. **Select a wallet** (e.g., MetaMask)
   - Wallet should open
   - Should show "Connect to Celo Sepolia Testnet"

4. **Connect wallet**
   - Should switch to Celo Sepolia network
   - Should close wallet modal

**Common Wallet Issues:**

#### "Network switch cancelled"
**Cause:** User rejected network switch  
**Solution:** Accept the network switch to Celo Sepolia

#### "AutoConnect timeout"
**Cause:** Stale localStorage cache  
**Solution:** Clear browser localStorage and refresh

#### "User rejected the request"
**Cause:** User cancelled wallet connection  
**Solution:** Try again and approve the connection

---

### ✅ Step 6: Test Authentication

1. **After wallet connects, watch the browser console**

2. **Expected flow:**
   ```
   ✅ Switching to Celo Sepolia Testnet...
   ✅ Authenticating...
   ✅ Authenticated successfully
   ✅ Redirecting to dashboard
   ```

3. **If authentication fails, check console for specific error**

**Common Auth Errors:**

#### "Invalid or expired nonce"
**Cause:** Nonce generation failed or expired  
**Solution:** 
- Check `/api/auth/nonce` endpoint is working
- Try authentication again (nonces expire in 5 minutes)

#### "Invalid signature"
**Cause:** Signature verification failed  
**Solution:**
- Ensure you're signing with the correct wallet
- Check that wallet address matches

#### "Failed to create/get user"
**Cause:** Database insert failed  
**Solution:**
- Check `/api/auth/debug` shows `tableExists: true`
- Verify RLS policies in Supabase are correctly set
- Check Supabase logs for detailed error

#### "406 Not Acceptable"
**Cause:** Wrong table name or query  
**Solution:**
- Verify `TABLES.USERS` = `"profiles"` in `lib/supabase/client.ts`
- This should already be fixed in your current branch

---

## Advanced Debugging

### Enable Verbose Logging

Add this to your `.env.local`:
```bash
NEXT_PUBLIC_DEBUG_AUTH=true
```

### Check Supabase Logs

1. Go to **Supabase Dashboard** → **Logs**
2. Select **API Logs**
3. Look for errors during authentication

### Check Network Tab

1. Open browser DevTools → **Network** tab
2. Try to authenticate
3. Check for failed requests:
   - `/api/auth/nonce` - Should return 200 with nonce
   - `/api/auth/wallet` - Should return 200 with user data

### Check Database Directly

1. Go to **Supabase Dashboard** → **Table Editor**
2. Open `profiles` table
3. After successful auth, should see your wallet address

---

## Common Error Messages & Solutions

### "Missing Supabase environment variables"
**Fix:** Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`

### "Cannot coerce the result to a single JSON object"
**Fix:** Table name mismatch. Verify `TABLES.USERS = "profiles"`

### "ERR_CERT_AUTHORITY_INVALID"
**Fix:** Celo RPC SSL error. Should be fixed with `alfajores-forno` RPC endpoint

### "Hydration failed"
**Fix:** Add `suppressHydrationWarning` to html/body tags (should already be done)

### "Cannot set wallet without account"
**Fix:** Clear localStorage and set `autoConnect={false}` (should already be done)

---

## Still Having Issues?

### 1. Fresh Start

```bash
# Clear all caches
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

### 2. Check File Checksums

Verify critical files match expected content:
- `lib/supabase/client.ts` - Line 97: `USERS: "profiles"`
- `lib/thirdweb-provider.tsx` - Line 61: `rpc: "https://alfajores-forno.celo-testnet.org"`
- `app/layout.tsx` - Line 53: `suppressHydrationWarning`

### 3. Verify Git Branch

```bash
git status
git diff main
```

All fixes should be in your current branch.

---

## Contact Support

If none of these steps work:

1. **Check diagnostic output:**
   ```bash
   curl http://localhost:3000/api/auth/debug | jq
   ```

2. **Share the error:**
   - Browser console error messages
   - Network tab failed requests
   - Supabase logs

3. **Environment info:**
   - Node version: `node --version`
   - npm version: `npm --version`
   - OS: Windows/Mac/Linux

---

**Last Updated:** November 2024  
**Version:** 1.0.0

