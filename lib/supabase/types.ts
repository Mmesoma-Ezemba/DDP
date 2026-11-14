/**
 * Supabase Database Types
 * Auto-generated types matching the database schema
 */

// =====================================================
// USER TYPES
// =====================================================

export interface User {
  id: string
  wallet_address: string
  name?: string
  email?: string
  username?: string
  avatar_url?: string
  created_at: string
  updated_at: string
  last_active?: string
  metadata?: Record<string, any>
}

export interface UserInsert extends Omit<User, 'id' | 'created_at' | 'updated_at'> {
  id?: string
  created_at?: string
  updated_at?: string
}

export interface UserUpdate extends Partial<Omit<User, 'id' | 'wallet_address' | 'created_at'>> {}

// =====================================================
// VAULT TYPES
// =====================================================

export interface Vault {
  id: string
  owner_wallet: string
  name: string
  description?: string
  
  // Encryption & Storage
  encrypted_data_uri?: string
  encryption_method?: string
  
  // Inactivity & Deadman Switch
  inactivity_timer_days: number
  last_heartbeat?: string
  is_triggered: boolean
  triggered_at?: string
  
  // Smart Contract Integration
  contract_address?: string
  chain_id?: number
  
  // Metadata
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export interface VaultInsert extends Omit<Vault, 'id' | 'created_at' | 'updated_at' | 'is_triggered'> {
  id?: string
  created_at?: string
  updated_at?: string
  is_triggered?: boolean
}

export interface VaultUpdate extends Partial<Omit<Vault, 'id' | 'owner_wallet' | 'created_at'>> {}

export interface VaultWithOwner extends Vault {
  owner_name?: string
  owner_email?: string
  days_since_heartbeat?: number
}

// =====================================================
// BENEFICIARY TYPES
// =====================================================

export type UnlockCondition = 'inactivity' | 'manual' | 'time-based'

export interface Beneficiary {
  id: string
  vault_id: string
  address: string
  name?: string
  
  // Access Control
  unlock_condition: UnlockCondition
  unlock_date?: string
  shares_percentage: number
  
  // Status
  has_accessed: boolean
  accessed_at?: string
  notified: boolean
  notified_at?: string
  
  // Metadata
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export interface BeneficiaryInsert extends Omit<Beneficiary, 'id' | 'created_at' | 'updated_at' | 'has_accessed' | 'notified'> {
  id?: string
  created_at?: string
  updated_at?: string
  has_accessed?: boolean
  notified?: boolean
}

export interface BeneficiaryUpdate extends Partial<Omit<Beneficiary, 'id' | 'vault_id' | 'created_at'>> {}

export interface BeneficiaryWithVault extends Beneficiary {
  vault_name?: string
  owner_wallet?: string
  is_triggered?: boolean
  owner_name?: string
}

// =====================================================
// ACTIVITY LOG TYPES
// =====================================================

export type ActivityType = 
  | 'heartbeat'
  | 'login'
  | 'logout'
  | 'vault_created'
  | 'vault_updated'
  | 'vault_triggered'
  | 'vault_accessed'
  | 'beneficiary_added'
  | 'beneficiary_removed'
  | 'beneficiary_notified'
  | 'encryption_completed'
  | 'decryption_completed'
  | string // Allow custom types

export interface DeviceInfo {
  browser?: string
  os?: string
  device_type?: string
  user_agent?: string
  [key: string]: any
}

export interface LocationInfo {
  country?: string
  city?: string
  region?: string
  latitude?: number
  longitude?: number
  timezone?: string
  [key: string]: any
}

export interface ActivityLog {
  id: string
  wallet_address: string
  vault_id?: string
  
  // Activity Details
  activity_type: ActivityType
  description?: string
  
  // Device & Location Info
  device_info?: DeviceInfo
  ip_address?: string
  location?: LocationInfo
  
  // Metadata
  created_at: string
  metadata?: Record<string, any>
}

export interface ActivityLogInsert extends Omit<ActivityLog, 'id' | 'created_at'> {
  id?: string
  created_at?: string
}

// =====================================================
// HEARTBEAT TYPES (Deprecated - use ActivityLog)
// =====================================================

export interface Heartbeat {
  id: string
  wallet_address: string
  vault_id?: string
  timestamp: string
  device_info?: DeviceInfo
  location?: LocationInfo
  created_at: string
}

export interface HeartbeatInsert extends Omit<Heartbeat, 'id' | 'created_at' | 'timestamp'> {
  id?: string
  created_at?: string
  timestamp?: string
}

// =====================================================
// UTILITY TYPES
// =====================================================

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  total_pages: number
}

export interface SupabaseResponse<T> {
  data: T | null
  error: Error | null
}

export interface SupabaseListResponse<T> {
  data: T[]
  error: Error | null
  count?: number
}

// =====================================================
// QUERY FILTERS
// =====================================================

export interface VaultFilters {
  owner_wallet?: string
  is_triggered?: boolean
  chain_id?: number
  created_after?: string
  created_before?: string
}

export interface ActivityLogFilters {
  wallet_address?: string
  vault_id?: string
  activity_type?: ActivityType | ActivityType[]
  start_date?: string
  end_date?: string
}

export interface BeneficiaryFilters {
  vault_id?: string
  address?: string
  has_accessed?: boolean
  unlock_condition?: UnlockCondition
}
