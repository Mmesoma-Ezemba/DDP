/**
 * Dashboard Data Operations for Supabase
 * Fetches real data for the dashboard overview page
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import { TABLES } from "./constants"
import type { DashboardStat, ChartDataPoint } from "@/types/dashboard"

export interface DashboardData {
  stats: DashboardStat[]
  chartData: ChartDataPoint[]
  totalVaults: number
  totalBeneficiaries: number
  totalAssets: number
  inactiveVaults: number
}

/**
 * Get dashboard statistics for a user
 */
export async function getDashboardData(
  supabaseClient: SupabaseClient,
  walletAddress: string
): Promise<DashboardData> {
  try {
    const walletLower = walletAddress.toLowerCase()

    // Fetch vaults
    const { data: vaults, error: vaultsError } = await supabaseClient
      .from(TABLES.VAULTS)
      .select("*")
      .eq("owner_wallet", walletLower)
      .order("created_at", { ascending: false })

    if (vaultsError) {
      console.error("Error fetching vaults:", vaultsError)
    }

    const vaultsList = vaults || []

    // Fetch beneficiaries
    const { data: beneficiaries, error: beneficiariesError } = await supabaseClient
      .from(TABLES.BENEFICIARIES)
      .select("*")
      .in(
        "vault_id",
        vaultsList.map((v) => v.id)
      )

    if (beneficiariesError) {
      console.error("Error fetching beneficiaries:", beneficiariesError)
    }

    const beneficiariesList = beneficiaries || []

    // Count active vaults
    const activeVaults = vaultsList.filter((v) => v.status === "active").length
    const inactiveVaults = vaultsList.filter((v) => v.status === "inactive" || v.status === "triggered").length

    // Calculate total assets (from vault metadata if available)
    let totalAssets = 0
    vaultsList.forEach((vault) => {
      if (vault.metadata && typeof vault.metadata === "object") {
        const assets = (vault.metadata as any).assets || []
        if (Array.isArray(assets)) {
          assets.forEach((asset: any) => {
            if (asset.value && typeof asset.value === "number") {
              totalAssets += asset.value
            }
          })
        }
      }
    })

    // Format assets value
    const formatAssets = (value: number): string => {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`
      }
      return value.toString()
    }

    // Build stats
    const stats: DashboardStat[] = [
      {
        label: "VAULTS CREATED",
        value: activeVaults.toString(),
        description: "ACTIVE DIGITAL WILLS",
        intent: "positive",
        icon: "gear",
        direction: "up",
      },
      {
        label: "ASSETS SECURED",
        value: totalAssets > 0 ? formatAssets(totalAssets) : "0",
        description: "TOTAL VALUE SECURED",
        intent: "positive",
        icon: "proccesor",
        direction: "up",
      },
      {
        label: "INACTIVITY DETECTED",
        value: inactiveVaults.toString(),
        description: inactiveVaults === 0 ? "ALL SYSTEMS OPERATIONAL" : "TRIGGERED VAULTS",
        intent: inactiveVaults === 0 ? "neutral" : "negative",
        icon: "boom",
        tag: inactiveVaults === 0 ? "No triggers 🔥" : undefined,
      },
    ]

    // Build chart data from vault creation dates
    const chartData: ChartDataPoint[] = []
    const now = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (6 - i))
      return date
    })

    last7Days.forEach((date) => {
      const dateStr = date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      // Count vaults created on this day
      const vaultsOnDay = vaultsList.filter((v) => {
        const created = new Date(v.created_at)
        return created >= dayStart && created <= dayEnd
      }).length

      // Count beneficiaries linked on this day
      const beneficiariesOnDay = beneficiariesList.filter((b) => {
        const created = new Date(b.created_at)
        return created >= dayStart && created <= dayEnd
      }).length

      // Calculate assets secured on this day (sum of vaults created that day)
      const assetsOnDay = vaultsOnDay > 0
        ? vaultsList
            .filter((v) => {
              const created = new Date(v.created_at)
              return created >= dayStart && created <= dayEnd
            })
            .reduce((sum, v) => {
              if (v.metadata && typeof v.metadata === "object") {
                const assets = (v.metadata as any).assets || []
                if (Array.isArray(assets)) {
                  return (
                    sum +
                    assets.reduce((assetSum: number, asset: any) => {
                      return assetSum + (asset.value && typeof asset.value === "number" ? asset.value : 0)
                    }, 0)
                  )
                }
              }
              return sum
            }, 0)
        : 0

      chartData.push({
        date: dateStr,
        assetsSecured: assetsOnDay,
        vaultsCreated: vaultsOnDay,
        beneficiariesLinked: beneficiariesOnDay,
      })
    })

    return {
      stats,
      chartData,
      totalVaults: vaultsList.length,
      totalBeneficiaries: beneficiariesList.length,
      totalAssets,
      inactiveVaults,
    }
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error)
    // Return empty data on error
    return {
      stats: [],
      chartData: [],
      totalVaults: 0,
      totalBeneficiaries: 0,
      totalAssets: 0,
      inactiveVaults: 0,
    }
  }
}

