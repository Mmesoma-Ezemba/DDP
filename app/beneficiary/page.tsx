"use client"

import { useState } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { BeneficiaryCard } from "@/components/beneficiaries/beneficiary-card"
import { AddBeneficiaryCard } from "@/components/beneficiaries/add-beneficiary-card"
import { AnimatedBackground } from "@/components/vaults/animated-background"
import { TechDecoration } from "@/components/vaults/tech-decoration"
import { DataStream } from "@/components/vaults/data-stream"
import { CircuitLines } from "@/components/vaults/circuit-lines"
import ProcessorIcon from "@/components/icons/proccesor"
import UsersIcon from "@/components/icons/users"
import ShieldCheckIcon from "@/components/icons/shield-check"
import KeyIcon from "@/components/icons/key"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockBeneficiaries } from "@/data/beneficiaries-mock"
import type { Beneficiary, BeneficiaryStatus } from "@/types/beneficiary"
import { Bullet } from "@/components/ui/bullet"
import { AddBeneficiaryDialog } from "@/components/dialogs/add-beneficiary-dialog"
import { ViewBeneficiaryDialog } from "@/components/dialogs/view-beneficiary-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"

export default function BeneficiaryPage() {
  const [filter, setFilter] = useState<BeneficiaryStatus | "all">("all")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null)
  const [beneficiaries, setBeneficiaries] = useState(mockBeneficiaries)

  const filteredBeneficiaries =
    filter === "all" ? beneficiaries : beneficiaries.filter((b) => b.status === filter)

  const stats = {
    total: beneficiaries.length,
    active: beneficiaries.filter((b) => b.status === "active").length,
    pending: beneficiaries.filter((b) => b.status === "pending").length,
    primary: beneficiaries.filter((b) => b.isPrimary).length,
  }

  const handleAddBeneficiary = () => {
    setAddDialogOpen(true)
  }

  const handleAddSubmit = (data: Partial<Beneficiary>) => {
    const newBeneficiary: Beneficiary = {
      id: `beneficiary-${Date.now()}`,
      name: data.name || "New Beneficiary",
      walletAddress: data.walletAddress || "0x0000...0000",
      email: data.email,
      relationship: data.relationship || "Unknown",
      status: "pending",
      accessLevel: data.accessLevel || "view-only",
      notificationPreference: data.notificationPreference || "both",
      linkedVaults: [],
      addedAt: new Date().toISOString(),
      lastUpdated: "Just now",
      isPrimary: false,
    }
    setBeneficiaries([...beneficiaries, newBeneficiary])
    toast.success("Beneficiary added successfully")
    setAddDialogOpen(false)
  }

  const handleViewBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary)
    setViewDialogOpen(true)
  }

  const handleEditBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary)
    toast.info("Edit functionality coming soon")
  }

  const handleRemoveBeneficiary = (beneficiary: Beneficiary) => {
    setBeneficiaries(beneficiaries.filter((b) => b.id !== beneficiary.id))
    toast.success("Beneficiary removed successfully")
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Beneficiaries",
        description: "Manage recipients of your digital legacy",
        icon: ProcessorIcon,
      }}
    >
      {/* Animated SVG Backgrounds */}
      <div className="fixed inset-0 -z-10">
        <AnimatedBackground />
        <DataStream />
      </div>

      {/* Header Decorations */}
      <div className="relative mb-6">
        <CircuitLines />
        <TechDecoration />
      </div>

      {/* Stats Bar - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-accent/50 rounded-lg p-4 border border-border/50 hover:border-chart-1/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-2">
                <Bullet />
                Total Recipients
              </p>
              <p className="text-3xl font-display">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-chart-1/10">
              <UsersIcon className="size-6 text-chart-1" />
            </div>
          </div>
        </div>

        <div className="bg-accent/50 rounded-lg p-4 border border-border/50 hover:border-success/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-2">
                <Bullet />
                Active
              </p>
              <p className="text-3xl font-display text-success">{stats.active}</p>
            </div>
            <Badge variant="default" className="bg-success/20 text-success border-success/30">
              [VERIFIED]
            </Badge>
          </div>
        </div>

        <div className="bg-accent/50 rounded-lg p-4 border border-border/50 hover:border-warning/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-2">
                <Bullet />
                Pending
              </p>
              <p className="text-3xl font-display text-warning">{stats.pending}</p>
            </div>
            <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
              [REVIEW]
            </Badge>
          </div>
        </div>

        <div className="bg-accent/50 rounded-lg p-4 border border-border/50 hover:border-chart-2/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-2">
                <Bullet />
                Primary
              </p>
              <p className="text-3xl font-display text-chart-1">{stats.primary}</p>
            </div>
            <Badge variant="outline" className="bg-chart-1/20 text-chart-1 border-chart-1/30">
              ⭐
            </Badge>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as BeneficiaryStatus | "all")}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-4">
          <TabsList className="w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All Recipients</TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">Active</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending</TabsTrigger>
            <TabsTrigger value="suspended" className="text-xs sm:text-sm">Suspended</TabsTrigger>
          </TabsList>

          <Button onClick={handleAddBeneficiary} size="sm" className="uppercase font-mono bg-chart-1 hover:bg-chart-1/80 text-xs w-full sm:w-auto">
            + Add Beneficiary
          </Button>
        </div>

        <TabsContent value={filter} className="mt-0">
          {/* Beneficiaries Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Add Beneficiary Card - only show in "all" tab */}
            {filter === "all" && <AddBeneficiaryCard onAdd={handleAddBeneficiary} />}

            {/* Beneficiary Cards */}
            {filteredBeneficiaries.map((beneficiary) => (
              <BeneficiaryCard
                key={beneficiary.id}
                beneficiary={beneficiary}
                onView={handleViewBeneficiary}
                onEdit={handleEditBeneficiary}
                onRemove={handleRemoveBeneficiary}
              />
            ))}
          </div>

          {/* Dialogs */}
          <AddBeneficiaryDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            onSubmit={handleAddSubmit}
          />
          <ViewBeneficiaryDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            beneficiary={selectedBeneficiary}
          />

          {/* Empty State */}
          {filteredBeneficiaries.length === 0 && filter !== "all" && (
            <div className="text-center py-12 bg-accent/30 rounded-lg border-2 border-dashed border-border">
              <UsersIcon className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-display mb-2">No {filter} beneficiaries found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You don't have any beneficiaries with "{filter}" status
              </p>
              <Button onClick={handleAddBeneficiary} variant="outline" className="uppercase font-mono">
                Add Your First Beneficiary
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Info Panel */}
      <div className="mt-6 bg-chart-1/5 border border-chart-1/20 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-chart-1/10 shrink-0">
            <ShieldCheckIcon className="size-6 text-chart-1" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-display mb-2 flex items-center gap-2">
              <Bullet />
              ABOUT BENEFICIARIES
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Beneficiaries are trusted individuals who will receive your digital assets, messages,
              and files when your vault triggers. Each beneficiary can be assigned different access
              levels and linked to specific vaults. Primary beneficiaries have priority access and
              enhanced permissions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-accent/50 rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheckIcon className="size-3 text-success" />
                  <p className="text-muted-foreground uppercase">Security</p>
                </div>
                <p className="font-mono">Wallet Verification Required</p>
              </div>
              <div className="bg-accent/50 rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <KeyIcon className="size-3 text-chart-1" />
                  <p className="text-muted-foreground uppercase">Access Control</p>
                </div>
                <p className="font-mono">Full, Partial, or View-Only</p>
              </div>
              <div className="bg-accent/50 rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <UsersIcon className="size-3 text-chart-2" />
                  <p className="text-muted-foreground uppercase">Notifications</p>
                </div>
                <p className="font-mono">Email, Wallet, or Both</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  )
}

