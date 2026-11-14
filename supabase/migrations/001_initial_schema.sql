-- =====================================================
-- Thirdweb Auth + Supabase Integration Schema
-- =====================================================
-- This schema enables wallet-based authentication with Supabase
-- All users are identified by their wallet address

-- Enable UUID extension (required for uuid_generate_v4())
-- Note: This may already exist in your Supabase project
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
-- Stores user profiles linked to wallet addresses
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Indexes
  CONSTRAINT wallet_address_lowercase CHECK (wallet_address = LOWER(wallet_address))
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);

-- =====================================================
-- VAULTS TABLE
-- =====================================================
-- Stores encrypted vault data and metadata
CREATE TABLE IF NOT EXISTS vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_wallet TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Vault',
  description TEXT,
  
  -- Encryption & Storage
  encrypted_data_uri TEXT, -- IPFS or Arweave URI
  encryption_method TEXT DEFAULT 'lit-protocol',
  
  -- Inactivity & Deadman Switch
  inactivity_timer_days INTEGER DEFAULT 365,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  is_triggered BOOLEAN DEFAULT FALSE,
  triggered_at TIMESTAMPTZ,
  
  -- Smart Contract Integration
  contract_address TEXT,
  chain_id INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vaults_owner_wallet ON vaults(owner_wallet);
CREATE INDEX IF NOT EXISTS idx_vaults_last_heartbeat ON vaults(last_heartbeat);
CREATE INDEX IF NOT EXISTS idx_vaults_is_triggered ON vaults(is_triggered);
CREATE INDEX IF NOT EXISTS idx_vaults_contract_address ON vaults(contract_address) WHERE contract_address IS NOT NULL;

-- =====================================================
-- BENEFICIARIES TABLE
-- =====================================================
-- Stores beneficiaries who can access vaults after trigger
CREATE TABLE IF NOT EXISTS beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  name TEXT,
  
  -- Access Control
  unlock_condition TEXT DEFAULT 'inactivity', -- 'inactivity', 'manual', 'time-based'
  unlock_date TIMESTAMPTZ, -- For time-based unlocking
  shares_percentage DECIMAL(5,2) DEFAULT 100.00, -- For splitting vaults
  
  -- Status
  has_accessed BOOLEAN DEFAULT FALSE,
  accessed_at TIMESTAMPTZ,
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  CONSTRAINT shares_percentage_valid CHECK (shares_percentage >= 0 AND shares_percentage <= 100),
  CONSTRAINT address_lowercase CHECK (address = LOWER(address))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_beneficiaries_vault_id ON beneficiaries(vault_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_address ON beneficiaries(address);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_has_accessed ON beneficiaries(has_accessed);

-- =====================================================
-- ACTIVITY LOGS TABLE
-- =====================================================
-- Tracks user activity, heartbeats, and system events
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
  vault_id UUID REFERENCES vaults(id) ON DELETE SET NULL,
  
  -- Activity Details
  activity_type TEXT NOT NULL, -- 'heartbeat', 'login', 'vault_created', 'vault_triggered', etc.
  description TEXT,
  
  -- Device & Location Info
  device_info JSONB DEFAULT '{}'::jsonb, -- browser, OS, device type
  ip_address INET,
  location JSONB DEFAULT '{}'::jsonb, -- country, city, lat/lng
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_wallet ON activity_logs(wallet_address);
CREATE INDEX IF NOT EXISTS idx_activity_logs_vault_id ON activity_logs(vault_id) WHERE vault_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- =====================================================
-- HEARTBEATS TABLE (Deprecated - use activity_logs instead)
-- =====================================================
-- Keep for backwards compatibility but activity_logs is preferred
CREATE TABLE IF NOT EXISTS heartbeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_info JSONB DEFAULT '{}'::jsonb,
  location JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_heartbeats_wallet ON heartbeats(wallet_address);
CREATE INDEX IF NOT EXISTS idx_heartbeats_vault_id ON heartbeats(vault_id);
CREATE INDEX IF NOT EXISTS idx_heartbeats_timestamp ON heartbeats(timestamp DESC);

-- =====================================================
-- TRIGGERS - Auto-update timestamps
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaults_updated_at BEFORE UPDATE ON vaults
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON beneficiaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE heartbeats ENABLE ROW LEVEL SECURITY;

-- Users: Can read/update their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (wallet_address = LOWER(current_setting('request.jwt.claim.wallet_address', true)));

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (wallet_address = LOWER(current_setting('request.jwt.claim.wallet_address', true)));

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (wallet_address = LOWER(current_setting('request.jwt.claim.wallet_address', true)));

-- Vaults: Owners can do anything, beneficiaries can read triggered vaults
CREATE POLICY "Vault owners can view their vaults" ON vaults
  FOR SELECT USING (owner_wallet = LOWER(current_setting('request.jwt.claim.wallet_address', true)));

CREATE POLICY "Vault owners can create vaults" ON vaults
  FOR INSERT WITH CHECK (owner_wallet = LOWER(current_setting('request.jwt.claim.wallet_address', true)));

CREATE POLICY "Vault owners can update their vaults" ON vaults
  FOR UPDATE USING (owner_wallet = LOWER(current_setting('request.jwt.claim.wallet_address', true)));

CREATE POLICY "Vault owners can delete their vaults" ON vaults
  FOR DELETE USING (owner_wallet = LOWER(current_setting('request.jwt.claim.wallet_address', true)));

-- Beneficiaries can view triggered vaults they're assigned to
CREATE POLICY "Beneficiaries can view triggered vaults" ON vaults
  FOR SELECT USING (
    is_triggered = true AND 
    id IN (
      SELECT vault_id FROM beneficiaries 
      WHERE address = LOWER(current_setting('request.jwt.claim.wallet_address', true))
    )
  );

-- Beneficiaries: Vault owners can manage, beneficiaries can read their assignments
CREATE POLICY "Vault owners can manage beneficiaries" ON beneficiaries
  FOR ALL USING (
    vault_id IN (
      SELECT id FROM vaults 
      WHERE owner_wallet = LOWER(current_setting('request.jwt.claim.wallet_address', true))
    )
  );

CREATE POLICY "Beneficiaries can view their assignments" ON beneficiaries
  FOR SELECT USING (address = LOWER(current_setting('request.jwt.claim.wallet_address', true)));

-- Activity Logs: Users can read their own logs, system can insert
CREATE POLICY "Users can view their own activity" ON activity_logs
  FOR SELECT USING (wallet_address = LOWER(current_setting('request.jwt.claim.wallet_address', true)));

CREATE POLICY "System can insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- Heartbeats: Similar to activity logs
CREATE POLICY "Users can view their own heartbeats" ON heartbeats
  FOR SELECT USING (wallet_address = LOWER(current_setting('request.jwt.claim.wallet_address', true)));

CREATE POLICY "System can insert heartbeats" ON heartbeats
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if a vault should be triggered
CREATE OR REPLACE FUNCTION check_vault_trigger(vault_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  vault_record RECORD;
  days_inactive INTEGER;
BEGIN
  SELECT * INTO vault_record FROM vaults WHERE id = vault_uuid;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  IF vault_record.is_triggered THEN
    RETURN TRUE;
  END IF;
  
  days_inactive := EXTRACT(DAY FROM (NOW() - vault_record.last_heartbeat));
  
  RETURN days_inactive >= vault_record.inactivity_timer_days;
END;
$$ LANGUAGE plpgsql;

-- Function to trigger a vault
CREATE OR REPLACE FUNCTION trigger_vault(vault_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE vaults 
  SET 
    is_triggered = TRUE,
    triggered_at = NOW(),
    updated_at = NOW()
  WHERE id = vault_uuid AND is_triggered = FALSE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS
-- =====================================================

-- View: Active vaults with owner info
CREATE OR REPLACE VIEW vaults_with_owner AS
SELECT 
  v.*,
  u.name as owner_name,
  u.email as owner_email,
  EXTRACT(DAY FROM (NOW() - v.last_heartbeat)) as days_since_heartbeat
FROM vaults v
JOIN users u ON v.owner_wallet = u.wallet_address;

-- View: Beneficiaries with vault info
CREATE OR REPLACE VIEW beneficiaries_with_vault AS
SELECT 
  b.*,
  v.name as vault_name,
  v.owner_wallet,
  v.is_triggered,
  u.name as owner_name
FROM beneficiaries b
JOIN vaults v ON b.vault_id = v.id
JOIN users u ON v.owner_wallet = u.wallet_address;

-- =====================================================
-- SEED DATA (for development/testing)
-- =====================================================

-- Note: In production, remove or comment out seed data
-- Uncomment below for local development:

/*
-- Example user
INSERT INTO users (wallet_address, name, email, username) VALUES
  ('0x1234567890abcdef1234567890abcdef12345678', 'John Doe', 'john@example.com', 'johndoe')
ON CONFLICT (wallet_address) DO NOTHING;

-- Example vault
INSERT INTO vaults (owner_wallet, name, description, inactivity_timer_days) VALUES
  ('0x1234567890abcdef1234567890abcdef12345678', 'My Crypto Vault', 'Emergency access to my crypto', 90)
ON CONFLICT DO NOTHING;
*/
