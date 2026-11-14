import { NextResponse } from "next/server"
import { TABLES } from "@/lib/supabase/constants"

/**
 * Debug endpoint to check auth configuration
 * GET /api/auth/debug
 */
export async function GET() {
  const diagnostics = {
    environment: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasThirdwebClientId: !!process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
      supabaseUrlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL 
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...` 
        : "NOT SET",
    },
    configuration: {
      tableNames: TABLES,
    },
    timestamp: new Date().toISOString(),
  }

  // Try to connect to Supabase
  try {
    const { createClient } = require("@/lib/supabase/server")
    const supabase = createClient()
    
    // Test connection by checking if profiles table exists
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select("count")
      .limit(1)
    
    if (error) {
      return NextResponse.json({
        ...diagnostics,
        supabase: {
          status: "error",
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
      })
    }
    
    return NextResponse.json({
      ...diagnostics,
      supabase: {
        status: "connected",
        tableExists: true,
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      ...diagnostics,
      supabase: {
        status: "connection_failed",
        error: error.message,
      },
    })
  }
}

