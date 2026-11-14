# Vercel Environment Variables Setup Guide

## Required Environment Variables

Add these environment variables to your Vercel project settings:

### 1. thirdweb SDK (Required)
```
NEXT_PUBLIC_THIRDWEB_CLIENT_ID
```

**How to get it:**
1. Go to [thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Sign in or create an account
3. Create a new project (or select existing)
4. Copy your **Client ID** from the project settings
5. Add it to Vercel as `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`

**Example value:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

### 2. Supabase Configuration (Required)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**How to get them:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Sign in or create an account
3. Create a new project (or select existing)
4. Go to **Settings** → **API**
5. Copy:
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Example values:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3. JWT Secret for Authentication (HIGHLY RECOMMENDED)
```
NEXTAUTH_SECRET
```

**How to generate:**
```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Why it's needed:**
- Used to sign and verify JWT tokens for wallet authentication
- Without this, a fallback development secret is used (not secure for production)
- MUST be set for production deployments

**Example value:**
```
NEXTAUTH_SECRET=sK9mP2vX8qR4tN6wL3jD7fH5gB1cY0zA
```

**⚠️ IMPORTANT:** 
- Keep this secret safe - never commit it to git
- Use different secrets for development, staging, and production
- If compromised, regenerate immediately and redeploy

---

### 4. Encryption Key (Optional - for future use)
```
NEXT_PUBLIC_ENCRYPTION_KEY
```

**How to generate:**
```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Note:** This is optional and only needed if you implement AES-256 encryption for file storage.

---

## How to Add Variables in Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add each variable:
   - **Key**: `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`
   - **Value**: Your thirdweb Client ID
   - **Environment**: Select all (Production, Preview, Development)
6. Repeat for all variables
7. Click **Save**

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project (if not already linked)
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_THIRDWEB_CLIENT_ID
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXTAUTH_SECRET

# Optional: Add encryption key
vercel env add NEXT_PUBLIC_ENCRYPTION_KEY
```

---

## Environment Variable Checklist

- [ ] `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` - thirdweb SDK Client ID
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase Project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase Anon/Public Key
- [ ] `NEXTAUTH_SECRET` - JWT secret for authentication (HIGHLY RECOMMENDED)
- [ ] `NEXT_PUBLIC_ENCRYPTION_KEY` - (Optional) Encryption key for file storage

---

## Important Notes

1. **NEXT_PUBLIC_ prefix**: All variables must start with `NEXT_PUBLIC_` to be accessible in the browser/client-side code.

2. **Redeploy after adding**: After adding environment variables in Vercel, you need to redeploy your application for changes to take effect.

3. **Environment-specific values**: You can set different values for Production, Preview, and Development environments if needed.

4. **Security**: Never commit `.env.local` files to git. Vercel environment variables are encrypted and secure.

5. **Automatic variables**: Vercel automatically provides `VERCEL_URL` - you don't need to set this manually.

---

## Verification

After adding variables and redeploying, verify they're working:

1. Check browser console for any warnings about missing environment variables
2. Test wallet connection (should work with thirdweb)
3. Test authentication (should connect to Supabase)

---

## Troubleshooting

### Variables not working?
- Make sure they start with `NEXT_PUBLIC_`
- Redeploy your application after adding variables
- Check for typos in variable names
- Verify values are correct (no extra spaces)

### Supabase connection issues?
- Verify your Supabase project is active
- Check that the URL and key are correct
- Ensure your Supabase project allows connections from your Vercel domain

### thirdweb connection issues?
- Verify your Client ID is correct
- Check that your thirdweb project is active
- Ensure the Client ID matches your project

