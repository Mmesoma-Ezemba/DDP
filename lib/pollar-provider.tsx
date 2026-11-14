"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface PollarContextType {
  isPollarAvailable: boolean
  isAuthenticated: boolean
  user: { email?: string; address?: string; provider?: string } | null
  login: (options?: { provider?: string }) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const PollarContext = createContext<PollarContextType>({
  isPollarAvailable: false,
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: false,
})

export function PollarProviderWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ email?: string; address?: string; provider?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Check saved session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("ddp_pollar_user")
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser)
          setUser(parsed)
          setIsAuthenticated(true)
        } catch (e) {
          localStorage.removeItem("ddp_pollar_user")
        }
      }
    }
  }, [])

  const login = async (options?: { provider?: string }) => {
    setIsLoading(true)
    const provider = options?.provider || "google"
    
    // Simulate real Pollar wallet abstraction login (Google Social Auth -> On-chain Managed Wallet)
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Generate simulated non-custodial wallet address abstraction powered by Pollar
        const simulatedAddress = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
        const pollarUser = {
          email: "beneficiary.family@gmail.com",
          address: simulatedAddress,
          provider: provider,
        }
        
        setUser(pollarUser)
        setIsAuthenticated(true)
        setIsLoading(false)
        
        if (typeof window !== "undefined") {
          localStorage.setItem("ddp_pollar_user", JSON.stringify(pollarUser))
          document.cookie = `wallet-address=${simulatedAddress}; path=/; max-age=86400; samesite=strict`
        }
        resolve()
      }, 1200)
    })
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    if (typeof window !== "undefined") {
      localStorage.removeItem("ddp_pollar_user")
      document.cookie = "wallet-address=; path=/; max-age=0; samesite=strict"
    }
  }

  return (
    <PollarContext.Provider
      value={{
        isPollarAvailable: true,
        isAuthenticated,
        user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </PollarContext.Provider>
  )
}

export function usePollarAuth() {
  return useContext(PollarContext)
}

