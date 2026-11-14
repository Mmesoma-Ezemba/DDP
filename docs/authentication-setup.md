# Authentication Setup Guide

This document explains how to set up and use the authentication system for DDP.

## Overview

DDP uses **wallet signature authentication** for Web3 users, following the PRD requirements. Users connect their wallet via thirdweb SDK and sign a message to authenticate.

## Architecture

### Flow
1. User connects wallet via thirdweb `ConnectButton`
2. User clicks "Sign In" → System generates a nonce
3. User signs a message containing the nonce with their wallet
4. Backend verifies the signature
5. User profile is created/updated in Supabase
6. Session is established

### Components

- **`hooks/use-wallet-auth.ts`** - React hook for wallet authentication
- **`lib/auth/wallet-auth.ts`** - Client-side auth utilities
- **`lib/auth/wallet-auth-server.ts`** - Server-side signature verification
- **`lib/supabase/client.ts`** - Supabase client configuration
- **`lib/supabase/server.ts`** - Server-side Supabase client
- **`app/api/auth/nonce/route.ts`** - API route for nonce generation
- **`app/api/auth/wallet/route.ts`** - API route for wallet authentication

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr viem --legacy-peer-deps
```

### 2. Environment Variables

Create a `.env.local` file (copy from `.env.example`):

```env
# thirdweb SDK (Required)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Supabase Database Setup

Create the following table in Supabase:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for faster lookups
CREATE INDEX idx_profiles_wallet_address ON profiles(wallet_address);
CREATE INDEX idx_profiles_last_active ON profiles(last_active);
```

### 4. Usage in Components

#### Login Page

```tsx
import { useWalletAuth } from "@/hooks/use-wallet-auth"

const { authenticate, isLoading, isConnected } = useWalletAuth()

const handleLogin = async () => {
  const result = await authenticate()
  if (result.success) {
    router.push("/")
  }
}
```

#### Signup Page

```tsx
import { useWalletAuth } from "@/hooks/use-wallet-auth"

const { signup, isLoading, isConnected } = useWalletAuth()

const handleSignup = async () => {
  const result = await signup({
    email: "user@example.com",
    username: "username",
  })
  if (result.success) {
    router.push("/")
  }
}
```

## Security Considerations

1. **Nonce Expiration**: Nonces expire after 5 minutes
2. **Signature Verification**: Uses `viem` to verify EIP-191 signatures
3. **Wallet Address Normalization**: All addresses are stored in lowercase
4. **Session Management**: Currently uses mock tokens; implement proper JWT in production

## Next Steps

- [ ] Implement proper JWT token generation
- [ ] Add session refresh mechanism
- [ ] Add protected route middleware
- [ ] Implement email/password authentication (optional)
- [ ] Add rate limiting for nonce generation
- [ ] Move nonce storage to Redis/database (production)

## API Endpoints

### POST `/api/auth/nonce`
Generate a nonce for wallet authentication.

**Request:**
```json
{
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "nonce": "random_nonce_string"
}
```

### POST `/api/auth/wallet`
Authenticate with wallet signature.

**Request:**
```json
{
  "walletAddress": "0x...",
  "signature": "0x...",
  "nonce": "nonce_string"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "session": { ... }
}
```

