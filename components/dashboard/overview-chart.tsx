"use client"

import * as React from "react"
import { XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bullet } from "@/components/ui/bullet"
import type { TimePeriod, ChartDataPoint } from "@/types/dashboard"

interface OverviewChartProps {
  initialData: ChartDataPoint[]
}

const chartConfig = {
  vaultsCreated: {
    label: "Vaults Created",
    color: "var(--chart-1)",
  },
  assetsSecured: {
    label: "Assets Secured",
    color: "var(--chart-2)",
  },
  beneficiariesLinked: {
    label: "Beneficiaries Linked",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function OverviewChart({ initialData }: OverviewChartProps) {
  const [activeTab, setActiveTab] = React.useState<TimePeriod>("week")
  const [chartData, setChartData] = React.useState(initialData)

  const handleTabChange = (value: string) => {
    if (value === "week" || value === "month" || value === "year") {
      setActiveTab(value as TimePeriod)
    }
  }

  const formatYAxisValue = (value: number) => {
    if (value === 0) {
      return ""
    }

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toString()
  }

  // For now, we only have week data. In the future, we can fetch month/year data
  const displayData = activeTab === "week" ? chartData : []

  if (chartData.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Bullet />
          <h2 className="text-lg font-semibold uppercase">Activity Overview</h2>
        </div>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
          <div className="text-center">
            <p className="text-sm uppercase mb-2">No Activity Data</p>
            <p className="text-xs text-muted-foreground/70">
              Create vaults and add beneficiaries to see activity trends
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Bullet />
        <h2 className="text-lg font-semibold uppercase">Activity Overview</h2>
      </div>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          {displayData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={displayData}>
                <defs>
                  <linearGradient id="fillVaultsCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillAssetsSecured" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillBeneficiariesLinked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                  tickFormatter={formatYAxisValue}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="vaultsCreated"
                  stroke="var(--chart-1)"
                  fill="url(#fillVaultsCreated)"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="assetsSecured"
                  stroke="var(--chart-2)"
                  fill="url(#fillAssetsSecured)"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="beneficiariesLinked"
                  stroke="var(--chart-3)"
                  fill="url(#fillBeneficiariesLinked)"
                  stackId="1"
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available for {activeTab} period
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

