import { NextRequest, NextResponse } from "next/server"
import { SignJWT } from "jose"
import { getJWTSecret } from "@/lib/auth/jwt-secret"

const NONCE_EXPIRY = 5 * 60 * 1000 // 5 minutes

/**
 * Generate a nonce for wallet authentication
 * POST /api/auth/nonce
 * 
 * IMPORTANT: Uses JWT in cookies instead of in-memory storage
 * because Vercel serverless functions don't share memory between invocations
 */
export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      )
    }

    // Generate random nonce
    const nonce = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15)
    
    const expiresAt = Date.now() + NONCE_EXPIRY

    // Create JWT token containing nonce (solves serverless statelessness)
    const token = await new SignJWT({ 
      nonce, 
      walletAddress: walletAddress.toLowerCase(),
      expiresAt 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("5m")
      .sign(getJWTSecret())

    console.log("[NONCE] Generated for", walletAddress, "- nonce:", nonce.substring(0, 10) + "...")

    // Return nonce and set JWT in cookie
    const response = NextResponse.json({ nonce })
    response.cookies.set("auth-nonce", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300, // 5 minutes
      path: "/",
    })

    return response
  } catch (error: any) {
    console.error("Error generating nonce:", error)
    return NextResponse.json(
      { error: "Failed to generate nonce" },
      { status: 500 }
    )
  }
}