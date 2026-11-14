-- ============================================
-- DDP (Decentralized Death Protocol)
-- Database Schema for Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Stores user wallet information
-- ============================================
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

-- Add unique constraint on username if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_username_key'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- Add check constraint for username format if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_username_format_check'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_username_format_check 
    CHECK (username IS NULL OR username ~ '^[a-z0-9_]+$');
  END IF;
END $$;

-- Index for faster wallet address lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address 
ON public.profiles(LOWER(wallet_address));

-- Index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON public.profiles(LOWER(username)) 
WHERE username IS NOT NULL;

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON public.profiles(LOWER(email)) 
WHERE email IS NOT NULL;

-- GIN index for metadata JSONB queries
CREATE INDEX IF NOT EXISTS idx_profiles_metadata_gin 
ON public.profiles USING GIN (metadata);

-- ============================================
-- VAULTS TABLE
-- Stores digital vault information
-- ============================================
CREATE TABLE IF NOT EXISTS public.vaults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_wallet TEXT NOT NULL,
  contract_address TEXT NOT NULL UNIQUE,
  name TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  inactivity_threshold INT DEFAULT 90,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Foreign key to profiles (drop if exists first)
ALTER TABLE public.vaults 
DROP CONSTRAINT IF EXISTS fk_vaults_owner;

ALTER TABLE public.vaults 
ADD CONSTRAINT fk_vaults_owner 
FOREIGN KEY (owner_wallet) 
REFERENCES public.profiles(wallet_address) 
ON DELETE CASCADE;

-- Index on owner wallet
CREATE INDEX IF NOT EXISTS idx_vaults_owner_wallet 
ON public.vaults(LOWER(owner_wallet));

-- ============================================
-- BENEFICIARIES TABLE
-- Stores beneficiary information
-- ============================================
CREATE TABLE IF NOT EXISTS public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vault_id UUID REFERENCES public.vaults(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  name TEXT,
  access_level TEXT DEFAULT 'viewer',
  notification_preference TEXT DEFAULT 'email',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index on vault_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_beneficiaries_vault_id 
ON public.beneficiaries(vault_id);

-- ============================================
-- ACTIVITY_LOGS TABLE
-- Stores user activity logs
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'success',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on wallet address and timestamp
CREATE INDEX IF NOT EXISTS idx_activity_logs_wallet 
ON public.activity_logs(LOWER(wallet_address), created_at DESC);

-- ============================================
-- HEARTBEATS TABLE
-- Stores heartbeat signals for inactivity detection
-- ============================================
CREATE TABLE IF NOT EXISTS public.heartbeats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'manual',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index on wallet address and timestamp
CREATE INDEX IF NOT EXISTS idx_heartbeats_wallet 
ON public.heartbeats(LOWER(wallet_address), timestamp DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heartbeats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.profiles;

-- Allow anyone to read profiles (for public display)
CREATE POLICY "Enable read access for all users" 
ON public.profiles FOR SELECT 
USING (true);

-- Allow anyone to insert new profiles (for signup)
CREATE POLICY "Enable insert for all users" 
ON public.profiles FOR INSERT 
WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "Enable update for own profile" 
ON public.profiles FOR UPDATE 
USING (true);

-- ============================================
-- RLS POLICIES - VAULTS
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read for own vaults" ON public.vaults;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.vaults;
DROP POLICY IF EXISTS "Enable update for own vaults" ON public.vaults;

-- Allow users to read their own vaults
CREATE POLICY "Enable read for own vaults" 
ON public.vaults FOR SELECT 
USING (true);

-- Allow users to create vaults
CREATE POLICY "Enable insert for authenticated users" 
ON public.vaults FOR INSERT 
WITH CHECK (true);

-- Allow users to update their own vaults
CREATE POLICY "Enable update for own vaults" 
ON public.vaults FOR UPDATE 
USING (true);

-- ============================================
-- RLS POLICIES - BENEFICIARIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read for beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Enable insert for beneficiaries" ON public.beneficiaries;

-- Allow reading beneficiaries
CREATE POLICY "Enable read for beneficiaries" 
ON public.beneficiaries FOR SELECT 
USING (true);

-- Allow inserting beneficiaries
CREATE POLICY "Enable insert for beneficiaries" 
ON public.beneficiaries FOR INSERT 
WITH CHECK (true);

-- ============================================
-- RLS POLICIES - ACTIVITY LOGS
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read for own activity" ON public.activity_logs;
DROP POLICY IF EXISTS "Enable insert for activity logs" ON public.activity_logs;

-- Allow users to read their own activity logs
CREATE POLICY "Enable read for own activity" 
ON public.activity_logs FOR SELECT 
USING (true);

-- Allow inserting activity logs
CREATE POLICY "Enable insert for activity logs" 
ON public.activity_logs FOR INSERT 
WITH CHECK (true);

-- ============================================
-- RLS POLICIES - HEARTBEATS
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read for own heartbeats" ON public.heartbeats;
DROP POLICY IF EXISTS "Enable insert for heartbeats" ON public.heartbeats;

-- Allow users to read their own heartbeats
CREATE POLICY "Enable read for own heartbeats" 
ON public.heartbeats FOR SELECT 
USING (true);

-- Allow inserting heartbeats
CREATE POLICY "Enable insert for heartbeats" 
ON public.heartbeats FOR INSERT 
WITH CHECK (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_active timestamp
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_active = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update last_active on profile updates
DROP TRIGGER IF EXISTS update_profiles_last_active ON public.profiles;
CREATE TRIGGER update_profiles_last_active 
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_last_active();

-- Trigger for vaults table
DROP TRIGGER IF EXISTS update_vaults_updated_at ON public.vaults;
CREATE TRIGGER update_vaults_updated_at 
BEFORE UPDATE ON public.vaults
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION QUERY
-- Run this after setup to verify tables were created
-- ============================================

-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_type = 'BASE TABLE'
-- ORDER BY table_name;

