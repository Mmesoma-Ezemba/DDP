# Supabase + Thirdweb Integration Setup

Quick setup guide for the Thirdweb Auth + Supabase integration.

## 🚀 Quick Setup (5 minutes)

### 1. Run Database Migration

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and run the SQL

**Option B: Using Supabase CLI**
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push migration
supabase db push
```

### 2. Verify Tables Created

In Supabase dashboard → Table Editor, you should see:
- ✅ users
- ✅ vaults
- ✅ beneficiaries
- ✅ activity_logs
- ✅ heartbeats

### 3. Environment Variables

Already set in your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
```

### 4. Test Authentication

Start your dev server and try logging in:
```bash
npm run dev
```

Navigate to `/login` and connect your wallet. Check Supabase `users` table to verify user creation.

## 📖 Documentation

- **Complete Guide**: `docs/thirdweb-supabase-integration.md`
- **Implementation Summary**: `docs/INTEGRATION_SUMMARY.md`

## 🧪 Test Checklist

- [ ] Database migration ran successfully
- [ ] Can connect wallet on login page
- [ ] User created in `users` table after authentication
- [ ] Activity logged in `activity_logs` table
- [ ] Can create vaults
- [ ] Can add beneficiaries

## 🔧 Troubleshooting

### Issue: Migration fails with "relation already exists"

**Solution**: Tables might already exist. Drop them first:
```sql
DROP TABLE IF EXISTS heartbeats CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS beneficiaries CASCADE;
DROP TABLE IF EXISTS vaults CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

Then run the migration again.

### Issue: RLS blocking queries

**Solution**: Check that your JWT includes the wallet_address claim, or temporarily disable RLS for testing:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

(Don't forget to re-enable it in production!)

### Issue: Can't connect to Supabase

**Solution**: Verify your environment variables are correct:
```typescript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

## 📚 Usage Examples

### Create a Vault
```typescript
import { createVault } from "@/lib/supabase"

const vault = await createVault(walletAddress, {
  name: "My Emergency Vault",
  inactivity_timer_days: 90,
})
```

### Add Beneficiaries
```typescript
import { addBeneficiary } from "@/lib/supabase"

await addBeneficiary(vault.id, {
  address: "0xbeneficiary...",
  name: "Alice",
  shares_percentage: 100,
})
```

### Log Activity
```typescript
import { logHeartbeat } from "@/lib/supabase"

await logHeartbeat(walletAddress, vaultId)
```

## 🎯 Next Steps

1. ✅ Complete setup (you're here!)
2. Implement vault creation UI
3. Build beneficiary management interface
4. Add heartbeat monitoring
5. Deploy smart contracts to Celo
6. Test end-to-end flow

## 🆘 Need Help?

- Check `docs/thirdweb-supabase-integration.md` for detailed docs
- Review `docs/INTEGRATION_SUMMARY.md` for architecture overview
- Search existing issues in the repo

---

**You're all set! 🎉**
