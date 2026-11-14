/**
 * Shared JWT secret configuration for authentication
 * 
 * IMPORTANT: This secret must be IDENTICAL across all API routes
 * to ensure JWTs signed in one route can be verified in another.
 * 
 * In serverless environments (Vercel), each route is a separate Lambda,
 * so we CANNOT use dynamic values like Date.now() as fallbacks.
 */

// Deterministic fallback secret for development
// In production, NEXTAUTH_SECRET environment variable MUST be set
const FALLBACK_SECRET = "ddp-dev-secret-change-in-production-do-not-use-in-prod"

let hasWarnedAboutSecret = false

/**
 * Get the JWT secret as an encoded Uint8Array
 * This ensures the same secret is used across all API routes
 */
export function getJWTSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET || FALLBACK_SECRET
  
  // Warn once if using fallback secret
  if (!process.env.NEXTAUTH_SECRET && !hasWarnedAboutSecret) {
    console.warn(
      "⚠️  NEXTAUTH_SECRET is not set. Using fallback secret for development.\n" +
      "   Set NEXTAUTH_SECRET environment variable for production deployment.\n" +
      "   Generate a secure secret: openssl rand -base64 32"
    )
    hasWarnedAboutSecret = true
  }
  
  return new TextEncoder().encode(secret)
}

