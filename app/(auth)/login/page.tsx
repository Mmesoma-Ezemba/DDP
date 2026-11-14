"use client"

import { Suspense, useEffect } from "react"
import { useRedirectIfAuthenticated } from "@/hooks/use-auth"
import { AuthBackground } from "@/components/auth/auth-background"
import { AuthParticles } from "@/components/auth/auth-particles"
import { SimpleAuthCard } from "@/components/auth/simple-auth-card"

function LoginPageContent() {
  const { isChecking } = useRedirectIfAuthenticated()

  // Clear any stale wallet connection attempts on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear thirdweb's auto-connect cache
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('thirdweb') || key.startsWith('tw-')
      )
      keysToRemove.forEach(key => localStorage.removeItem(key))
    }
  }, [])

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground uppercase">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Animated Backgrounds */}
      <AuthBackground />
      <AuthParticles />

      {/* Main Content - Simple Auth Card */}
      <SimpleAuthCard mode="login" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground uppercase">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}


