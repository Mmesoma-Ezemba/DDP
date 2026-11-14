-- ============================================
-- DDP (Decentralized Death Protocol)
-- Profile Information Database Schema
-- ============================================
-- This schema defines the structure for user profile information
-- including the metadata JSONB structure and related operations
-- ============================================

-- ============================================
-- PROFILES TABLE STRUCTURE
-- ============================================
-- The profiles table stores user wallet information and profile data
-- Profile-specific fields are stored in the metadata JSONB column

-- Table already exists from main schema, but here's the structure:
/*
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  username TEXT UNIQUE, -- Add unique constraint if not exists
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);
*/

-- ============================================
-- ADD MISSING CONSTRAINTS
-- ============================================

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

-- Add check constraint for username format (optional, for validation)
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

-- ============================================
-- METADATA JSONB STRUCTURE
-- ============================================
-- The metadata column stores profile information as JSONB
-- Structure:
/*
{
  "name": "string",              // Display name (stored in metadata.name)
  "avatar_url": "string",        // Profile picture URL
  "bio": "string",               // User biography
  "website": "string",           // Personal website URL
  "twitter": "string",           // Twitter handle (e.g., "@username")
  "location": "string",          // User location (e.g., "City, Country")
  "achievements": [              // Array of achievement objects
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "icon": "string",
      "unlockedAt": "string",    // ISO timestamp
      "rarity": "string"         // "common" | "rare" | "epic" | "legendary"
    }
  ],
  "settings": {                  // User preferences (optional)
    "notifications": {},
    "privacy": {},
    "display": {}
  }
}
*/

-- ============================================
-- INDEXES FOR PROFILE QUERIES
-- ============================================

-- Index for username lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON public.profiles(LOWER(username)) 
WHERE username IS NOT NULL;

-- Index for metadata queries (GIN index for JSONB)
CREATE INDEX IF NOT EXISTS idx_profiles_metadata_gin 
ON public.profiles USING GIN (metadata);

-- Index for email lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON public.profiles(LOWER(email)) 
WHERE email IS NOT NULL;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_username 
ON public.profiles(LOWER(wallet_address), LOWER(username));

-- ============================================
-- HELPER FUNCTIONS FOR PROFILE OPERATIONS
-- ============================================

-- Function to get profile by wallet address
CREATE OR REPLACE FUNCTION get_profile_by_wallet(wallet_addr TEXT)
RETURNS TABLE (
  id UUID,
  wallet_address TEXT,
  email TEXT,
  username TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_active TIMESTAMPTZ,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.wallet_address,
    p.email,
    p.username,
    p.created_at,
    p.updated_at,
    p.last_active,
    p.metadata
  FROM public.profiles p
  WHERE LOWER(p.wallet_address) = LOWER(wallet_addr);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update profile metadata
CREATE OR REPLACE FUNCTION update_profile_metadata(
  wallet_addr TEXT,
  metadata_updates JSONB
)
RETURNS JSONB AS $$
DECLARE
  current_metadata JSONB;
  updated_metadata JSONB;
BEGIN
  -- Get current metadata
  SELECT metadata INTO current_metadata
  FROM public.profiles
  WHERE LOWER(wallet_address) = LOWER(wallet_addr);
  
  -- Merge with updates (metadata_updates takes precedence)
  updated_metadata := current_metadata || metadata_updates;
  
  -- Update profile
  UPDATE public.profiles
  SET 
    metadata = updated_metadata,
    updated_at = NOW()
  WHERE LOWER(wallet_address) = LOWER(wallet_addr);
  
  RETURN updated_metadata;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate username uniqueness
CREATE OR REPLACE FUNCTION check_username_unique(
  new_username TEXT,
  exclude_wallet TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  exists_count INT;
BEGIN
  SELECT COUNT(*) INTO exists_count
  FROM public.profiles
  WHERE LOWER(username) = LOWER(new_username)
    AND (exclude_wallet IS NULL OR LOWER(wallet_address) != LOWER(exclude_wallet));
  
  RETURN exists_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS POLICIES FOR PROFILE UPDATES
-- ============================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Enable update for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.profiles;

-- Policy: Users can update their own profile
-- Note: In a wallet-based system, we verify wallet_address matches
CREATE POLICY "Enable update for own profile" 
ON public.profiles FOR UPDATE 
USING (true)  -- In production, you'd verify wallet_address matches
WITH CHECK (true);

-- Policy: Users can insert their own profile
DROP POLICY IF EXISTS "Enable insert for all users" ON public.profiles;
CREATE POLICY "Enable insert for all users" 
ON public.profiles FOR INSERT 
WITH CHECK (true);

-- Policy: Users can read all profiles (for public display)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
CREATE POLICY "Enable read access for all users" 
ON public.profiles FOR SELECT 
USING (true);

-- ============================================
-- TRIGGERS FOR PROFILE UPDATES
-- ============================================

-- Trigger to update updated_at timestamp (already exists, but ensure it's correct)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
BEFORE UPDATE ON public.profiles
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update last_active on any update
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_active = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_last_active ON public.profiles;
CREATE TRIGGER update_profiles_last_active 
BEFORE UPDATE ON public.profiles
FOR EACH ROW 
EXECUTE FUNCTION update_last_active();

-- ============================================
-- VALIDATION FUNCTIONS
-- ============================================

-- Function to validate profile metadata structure
CREATE OR REPLACE FUNCTION validate_profile_metadata(meta JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if metadata has valid structure
  -- Allow any JSONB structure, but you can add specific validations here
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS FOR PROFILE DATA
-- ============================================

-- View for public profile information (excludes sensitive data)
CREATE OR REPLACE VIEW public.profile_public AS
SELECT 
  id,
  wallet_address,
  username,
  metadata->>'name' AS display_name,
  metadata->>'avatar_url' AS avatar_url,
  metadata->>'bio' AS bio,
  metadata->>'website' AS website,
  metadata->>'twitter' AS twitter,
  metadata->>'location' AS location,
  created_at,
  updated_at
FROM public.profiles
WHERE username IS NOT NULL;

-- Grant access to the view
GRANT SELECT ON public.profile_public TO authenticated, anon;

-- ============================================
-- EXAMPLE QUERIES
-- ============================================

-- Get profile by wallet address
-- SELECT * FROM get_profile_by_wallet('0x...');

-- Update profile metadata
-- SELECT update_profile_metadata('0x...', '{"name": "New Name", "bio": "New bio"}'::jsonb);

-- Check if username is available
-- SELECT check_username_unique('newusername', '0x...');

-- Get public profile information
-- SELECT * FROM profile_public WHERE username = 'username';

-- ============================================
-- MIGRATION NOTES
-- ============================================
-- 
-- To apply this schema:
-- 1. Run the main schema first: supabase-schema.sql
-- 2. Then run this profile schema: supabase-profile-schema.sql
-- 3. Verify indexes and constraints were created
-- 4. Test the helper functions
-- 
-- To verify the schema:
-- SELECT 
--   table_name,
--   column_name,
--   data_type,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name = 'profiles'
-- ORDER BY ordinal_position;
--
-- To check indexes:
-- SELECT 
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE tablename = 'profiles';
--
-- To check constraints:
-- SELECT 
--   conname,
--   contype,
--   pg_get_constraintdef(oid) AS definition
-- FROM pg_constraint
-- WHERE conrelid = 'public.profiles'::regclass;

