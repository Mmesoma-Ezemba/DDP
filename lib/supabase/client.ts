"use client"

import type { SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

let supabaseInstance: SupabaseClient | null = null

// Check if we're in a build environment
const isBuildTime = typeof window === "undefined"

/**
 * Supabase client for client-side operations
 * Lazy-loaded to prevent build-time initialization
 */
export const supabase = (() => {
  // During build time without env vars, return a safe mock that won't crash
  if (isBuildTime && (!supabaseUrl || !supabaseAnonKey)) {
    // Return a mock object with common methods to prevent build errors
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
        setSession: async () => ({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
        update: () => ({
          eq: async () => ({ data: null, error: null }),
        }),
      }),
    } as unknown as SupabaseClient
  }

  // Create a proxy that lazily initializes the client at runtime
  const handler: ProxyHandler<SupabaseClient> = {
    get(_target, prop) {
      if (!supabaseInstance) {
        // Lazy initialization - only happens at runtime
        try {
          const { createClient } = require("@supabase/supabase-js")
          if (!supabaseUrl || !supabaseAnonKey) {
            // Create placeholder client
            supabaseInstance = createClient(
              "https://placeholder.supabase.co",
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder",
              {
                auth: {
                  persistSession: false,
                  autoRefreshToken: false,
                  detectSessionInUrl: false,
                },
              }
            )
          } else {
            supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
              auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
              },
            })
          }
        } catch (error) {
          // If initialization fails, return mock
          console.warn("Supabase initialization failed:", error)
          supabaseInstance = {} as SupabaseClient
        }
      }
      const client = supabaseInstance!
      const value = client[prop as keyof SupabaseClient]
      if (typeof value === "function") {
        return value.bind(client)
      }
      return value
    },
  }
  return new Proxy({} as SupabaseClient, handler)
})()

/**
 * Re-export TABLES from shared constants file
 * This allows client components to import from this file for convenience
 */
export { TABLES, type TableNames } from "./constants"

/**
 * User profile interface matching Supabase schema
 */
export interface UserProfile {
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

/**
 * Authentication result
 */
export interface AuthResult {
  success: boolean
  user?: UserProfile | null
  error?: string
  session?: any
}

