import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyWalletSignature } from "@/lib/auth/wallet-auth-server"
import { generateAuthMessage } from "@/lib/auth/auth-message"
import { TABLES } from "@/lib/supabase/constants"
import { getDeviceInfoFromUserAgent } from "@/lib/supabase/activity-logs"
import { handleUserLogin } from "@/lib/supabase/users"
import { jwtVerify } from "jose"
import { getJWTSecret } from "@/lib/auth/jwt-secret"

/**
 * Authenticate with wallet signature
 * POST /api/auth/wallet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, signature, nonce } = body

    console.log("[AUTH] Received wallet auth request:", {
      walletAddress,
      hasSignature: !!signature,
      hasNonce: !!nonce,
      signatureLength: signature?.length,
    })

    if (!walletAddress || !signature || !nonce) {
      console.log("[AUTH] Missing required fields")
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify nonce from JWT cookie (serverless-safe)
    const nonceToken = request.cookies.get("auth-nonce")?.value

    if (!nonceToken) {
      console.log("[AUTH] No nonce cookie found")
      return NextResponse.json(
        { error: "No authentication nonce found. Please request a new nonce." },
        { status: 401 }
      )
    }

    let storedNonceData: { nonce: string; walletAddress: string; expiresAt: number }
    try {
      const { payload } = await jwtVerify(nonceToken, getJWTSecret())
      storedNonceData = payload as any
      
      console.log("[AUTH] Nonce check:", {
        hasNonce: !!storedNonceData.nonce,
        nonceMatch: storedNonceData.nonce === nonce,
        walletMatch: storedNonceData.walletAddress === walletAddress.toLowerCase(),
        isExpired: storedNonceData.expiresAt < Date.now(),
      })
    } catch (error) {
      console.log("[AUTH] Invalid nonce token:", error)
      return NextResponse.json(
        { error: "Invalid or expired nonce token" },
        { status: 401 }
      )
    }

    // Verify nonce matches
    if (storedNonceData.nonce !== nonce) {
      console.log("[AUTH] Nonce mismatch")
      return NextResponse.json(
        { error: "Invalid nonce" },
        { status: 401 }
      )
    }

    // Verify wallet address matches
    if (storedNonceData.walletAddress !== walletAddress.toLowerCase()) {
      console.log("[AUTH] Wallet address mismatch")
      return NextResponse.json(
        { error: "Wallet address does not match nonce" },
        { status: 401 }
      )
    }

    // Verify not expired
    if (storedNonceData.expiresAt < Date.now()) {
      console.log("[AUTH] Nonce expired")
      return NextResponse.json(
        { error: "Nonce expired. Please request a new one." },
        { status: 401 }
      )
    }

    // Generate message that should have been signed
    const message = generateAuthMessage(walletAddress, nonce)
    console.log("[AUTH] Generated message for verification:", message.substring(0, 100))

    // Verify signature
    const isValid = await verifyWalletSignature(walletAddress, signature, message)
    console.log("[AUTH] Signature verification result:", isValid)

    if (!isValid) {
      console.log("[AUTH] Signature verification failed")
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }

    // Clear nonce cookie (one-time use)
    // Will be set on the response below

    // Get device info from user agent
    const userAgent = request.headers.get("user-agent") || ""
    const deviceInfo = getDeviceInfoFromUserAgent(userAgent)
    const ipAddress = request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") || 
                      "unknown"

    // Create or get user and log login activity
    // Use server-side Supabase client
    const supabase = createClient()
    const user = await handleUserLogin(supabase, walletAddress, {
      device_info: deviceInfo,
      location: {
        ip_address: ipAddress,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Failed to create/get user" },
        { status: 500 }
      )
    }

    // Return user data with session token and clear nonce cookie
    const response = NextResponse.json({
      success: true,
      user,
      session: {
        access_token: `wallet_auth_${walletAddress.toLowerCase()}`,
        refresh_token: `wallet_refresh_${walletAddress.toLowerCase()}`,
        wallet_address: walletAddress.toLowerCase(),
      },
    })

    // Clear nonce cookie after successful authentication (one-time use)
    response.cookies.set("auth-nonce", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error: any) {
    console.error("Error authenticating wallet:", error)
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    )
  }
}