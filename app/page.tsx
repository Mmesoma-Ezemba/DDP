import { cookies } from "next/headers"
import DashboardPageLayout from "@/components/dashboard/layout"
import BracketsIcon from "@/components/icons/brackets"
import { createClient } from "@/lib/supabase/server"
import { getDashboardData } from "@/lib/supabase/dashboard"
import { OverviewStats } from "@/components/dashboard/overview-stats"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { EmptyState } from "@/components/dashboard/empty-state"
import { RecentActivityClient } from "@/components/dashboard/recent-activity-client"
import { SecurityStatusClient } from "@/components/dashboard/security-status-client"

export default async function DashboardOverview() {
  const dummyStats = [
    { label: "Total Assets Secured", value: "$250,000", change: "+12.5%", icon: "boom" },
    { label: "Active Vaults", value: "3", change: "100% Secure", icon: "gear" },
    { label: "Beneficiaries Linked", value: "4", change: "Verified", icon: "proccesor" },
  ] as any

  return (
    <DashboardPageLayout
      header={{
        title: "Overview",
        description: "Your Digital Legacy Status",
        icon: BracketsIcon,
      }}
    >
      <OverviewStats initialStats={dummyStats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <RecentActivityClient />
        <SecurityStatusClient />
      </div>
    </DashboardPageLayout>
  )
}
