"use client"

import { useState } from "react"

export interface LocationData {
  city: string | null
  country: string | null
  region: string | null
  latitude: number | null
  longitude: number | null
  loading: boolean
  error: string | null
}

/**
 * Fast local geolocation hook - returns immediately to avoid browser permission popups and network latency
 */
export function useGeolocation() {
  const [location] = useState<LocationData>({
    city: "Enugu",
    country: "Nigeria",
    region: "Enugu State",
    latitude: 6.4584,
    longitude: 7.5464,
    loading: false,
    error: null,
  })

  return location
}

