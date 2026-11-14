"use client"

import { useState, useEffect, useRef } from "react"

/**
 * Generate a unique ID that only exists on the client-side
 * Returns null during SSR, preventing hydration mismatches
 * Once hydrated, returns a unique ID for SVG elements
 * 
 * This is the safest approach for SVG filters/gradients that need unique IDs
 * but aren't critical for initial render.
 */
export function useStableId(prefix: string = "id"): string | null {
  const [id, setId] = useState<string | null>(null)
  const idRef = useRef<string | null>(null)

  useEffect(() => {
    // Generate ID only once on client mount
    if (!idRef.current) {
      idRef.current = `${prefix}-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`
      setId(idRef.current)
    }
  }, [prefix])

  return id
}

/**
 * For components that need an ID immediately (including SSR),
 * use React's built-in useId() and suppress hydration warnings
 * by wrapping the component in a client-only boundary
 */
export function useClientOnlyId(prefix: string = "id"): string | null {
  return useStableId(prefix)
}

