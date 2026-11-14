"use client"

import { useState } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { VaultCard } from "@/components/vaults/vault-card"
import { CreateVaultCard } from "@/components/vaults/create-vault-card"
import { AnimatedBackground } from "@/components/vaults/animated-background"
import { TechDecoration } from "@/components/vaults/tech-decoration"
import { DataStream } from "@/components/vaults/data-stream"
import { FloatingIcons } from "@/components/vaults/floating-icons"
import { CircuitLines } from "@/components/vaults/circuit-lines"
import AtomIcon from "@/components/icons/atom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockVaults } from "@/data/vaults-mock"
import type { Vault, VaultStatus, VaultPayloadContent } from "@/types/vault"
import { Bullet } from "@/components/ui/bullet"
import { CreateVaultDialog } from "@/components/dialogs/create-vault-dialog"
import { ViewVaultDialog } from "@/components/dialogs/view-vault-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"
import { createEncryptedVault, isEncryptionAvailable } from "@/lib/encryption/vault-encryption"

export default function VaultsPage() {
  const [filter, setFilter] = useState<VaultStatus | "all">("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null)
  const [vaults, setVaults] = useState(mockVaults)

  const filteredVaults =
    filter === "all" ? vaults : vaults.filter((v) => v.status === filter)

  const stats = {
    total: vaults.length,
    active: vaults.filter((v) => v.status === "active").length,
    pending: vaults.filter((v) => v.status === "pending").length,
    draft: vaults.filter((v) => v.status === "draft").length,
  }

  const handleCreateVault = () => {
    setCreateDialogOpen(true)
  }

  const handleCreateSubmit = async (data: Partial<Vault>) => {
    try {
      // Check if encryption is available
      const encryptionEnabled = isEncryptionAvailable()
      
      // Create base vault
      const baseVault: Omit<Vault, 'encryptedPayload' | 'payloadHash'> = {
        id: `vault-${Date.now()}`,
        name: data.name || "New Vault",
        status: "draft",
        encryptionStatus: encryptionEnabled ? "pending" : "disabled",
        daysUntilTrigger: data.daysUntilTrigger || 90,
        inactivityThreshold: data.daysUntilTrigger || 90,
        beneficiaries: [],
        assets: [],
        messagePreview: data.messagePreview,
        createdAt: new Date().toISOString(),
        lastActivity: "Just now",
      }

      let newVault: Vault

      // If message provided and encryption available, encrypt it
      if (data.messagePreview && encryptionEnabled) {
        const payloadContent: VaultPayloadContent = {
          messages: [{
            beneficiaryId: "all",
            content: data.messagePreview,
            subject: "Legacy Message",
            timestamp: new Date().toISOString(),
          }],
          notes: "Vault created via UI",
        }

        newVault = await createEncryptedVault(baseVault, payloadContent)
        toast.success("Vault created with encrypted content")
      } else {
        newVault = baseVault as Vault
        if (!encryptionEnabled) {
          toast.warning("Vault created without encryption (key not configured)")
        } else {
          toast.success("Vault created successfully")
        }
      }

      setVaults([...vaults, newVault])
      setCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create vault:', error)
      toast.error("Failed to create vault: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const handleViewVault = (vault: Vault) => {
    setSelectedVault(vault)
    setViewDialogOpen(true)
  }

  const handleEditVault = (vault: Vault) => {
    setSelectedVault(vault)
    toast.info("Edit functionality coming soon")
  }

  const handleDeleteVault = (vault: Vault) => {
    setVaults(vaults.filter((v) => v.id !== vault.id))
    toast.success("Vault deleted successfully")
  }

  return (
    <DashboardPageLayout
      header={{
        title: "My Vaults",
        description: "Manage your digital legacy vaults and secured assets",
        icon: AtomIcon,
      }}
    >
      {/* Animated SVG Backgrounds */}
      <div className="fixed inset-0 -z-10">
        <AnimatedBackground />
        <DataStream />
        <FloatingIcons />
      </div>

      {/* Header Decorations */}
      <div className="relative mb-6">
        <CircuitLines />
        <TechDecoration />
      </div>

      {/* Stats Bar - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-accent/50 rounded-lg p-4 border border-border/50 hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-2">
                <Bullet />
                Total Vaults
              </p>
              <p className="text-3xl font-display">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <AtomIcon className="size-6 text-primary" />
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
              [LIVE]
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
              [SETUP]
            </Badge>
          </div>
        </div>

        <div className="bg-accent/50 rounded-lg p-4 border border-border/50 hover:border-muted-foreground/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-2">
                <Bullet />
                Drafts
              </p>
              <p className="text-3xl font-display text-muted-foreground">{stats.draft}</p>
            </div>
            <Badge variant="outline" className="bg-muted/20">
              [DRAFT]
            </Badge>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as VaultStatus | "all")} className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-4">
          <TabsList className="w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All Vaults</TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">Active</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending</TabsTrigger>
            <TabsTrigger value="draft" className="text-xs sm:text-sm">Drafts</TabsTrigger>
          </TabsList>

          <Button onClick={handleCreateVault} size="sm" className="uppercase font-mono text-xs w-full sm:w-auto">
            + Create New Vault
          </Button>
        </div>

        <TabsContent value={filter} className="mt-0">
          {/* Vaults Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Vault Card - only show in "all" and "draft" tabs */}
            {(filter === "all" || filter === "draft") && (
              <CreateVaultCard onCreate={handleCreateVault} />
            )}

            {/* Vault Cards */}
            {filteredVaults.map((vault) => (
              <VaultCard
                key={vault.id}
                vault={vault}
                onView={handleViewVault}
                onEdit={handleEditVault}
                onDelete={handleDeleteVault}
              />
            ))}
          </div>

          {/* Dialogs */}
          <CreateVaultDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onSubmit={handleCreateSubmit}
          />
          <ViewVaultDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            vault={selectedVault}
          />

          {/* Empty State */}
          {filteredVaults.length === 0 && filter !== "all" && filter !== "draft" && (
            <div className="text-center py-12 bg-accent/30 rounded-lg border-2 border-dashed border-border">
              <AtomIcon className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-display mb-2">No {filter} vaults found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You don't have any vaults with "{filter}" status
              </p>
              <Button onClick={handleCreateVault} variant="outline" className="uppercase font-mono">
                Create Your First Vault
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Info Panel */}
      <div className="mt-6 bg-primary/5 border border-primary/20 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10 shrink-0">
            <AtomIcon className="size-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-display mb-2 flex items-center gap-2">
              <Bullet />
              ABOUT DIGITAL VAULTS
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Digital vaults use AES-256 encryption and smart contracts to securely store your
              assets, messages, and files. Each vault is monitored for inactivity, and will
              automatically release its contents to your designated beneficiaries if you don't
              interact with the system within your specified timeframe.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-accent/50 rounded p-3">
                <p className="text-muted-foreground uppercase mb-1">Security</p>
                <p className="font-mono">AES-256 + On-Chain Verification</p>
              </div>
              <div className="bg-accent/50 rounded p-3">
                <p className="text-muted-foreground uppercase mb-1">Automation</p>
                <p className="font-mono">Inactivity-Based Triggers</p>
              </div>
              <div className="bg-accent/50 rounded p-3">
                <p className="text-muted-foreground uppercase mb-1">Privacy</p>
                <p className="font-mono">End-to-End Encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  )
}

