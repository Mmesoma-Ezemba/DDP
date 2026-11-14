/**
 * Shared constants for Supabase
 * This file is NOT marked as "use client" so it can be imported by both
 * server components (API routes) and client components
 */

/**
 * Database table names
 * NOTE: Must match the actual Supabase schema table names
 */
export const TABLES = {
  USERS: "profiles", // Actual table name in Supabase
  PROFILES: "profiles", // Alias for clarity
  VAULTS: "vaults",
  BENEFICIARIES: "beneficiaries",
  ACTIVITY_LOGS: "activity_logs",
  HEARTBEATS: "heartbeats",
} as const

/**
 * Type for table names
 */
export type TableNames = typeof TABLES

