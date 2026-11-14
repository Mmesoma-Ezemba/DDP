"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bullet } from "@/components/ui/bullet"
import type { Vault } from "@/types/vault"
import { cn } from "@/lib/utils"
import ShieldCheckIcon from "@/components/icons/shield-check"
import TimerIcon from "@/components/icons/timer"
import WalletIcon from "@/components/icons/wallet"
import CubeIcon from "@/components/icons/cube"

interface ViewVaultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vault: Vault | null
}

export function ViewVaultDialog({ open, onOpenChange, vault }: ViewVaultDialogProps) {
  if (!vault) return null

  const statusConfig = {
    active: { label: "[ACTIVE]", color: "text-success", bg: "bg-success/10" },
    pending: { label: "[PENDING]", color: "text-warning", bg: "bg-warning/10" },
    triggered: { label: "[TRIGGERED]", color: "text-destructive", bg: "bg-destructive/10" },
    draft: { label: "[DRAFT]", color: "text-muted-foreground", bg: "bg-muted/10" },
  }

  const config = statusConfig[vault.status]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{vault.name}</DialogTitle>
            <Badge variant={vault.status === "active" ? "default" : "outline"} className={cn("font-mono", config.color)}>
              {config.label}
            </Badge>
          </div>
          <DialogDescription>Vault ID: {vault.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheckIcon className="size-5 text-success" />
                <span className="text-xs text-muted-foreground uppercase">Encryption</span>
              </div>
              <p className="text-lg font-medium">{vault.encryptionStatus === "enabled" ? "AES-256" : "PENDING"}</p>
            </div>

            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TimerIcon className="size-5 text-warning" />
                <span className="text-xs text-muted-foreground uppercase">Days Until Trigger</span>
              </div>
              <p className="text-lg font-medium">{vault.daysUntilTrigger > 0 ? `${vault.daysUntilTrigger}D` : "EXPIRED"}</p>
            </div>

            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <WalletIcon className="size-5 text-chart-1" />
                <span className="text-xs text-muted-foreground uppercase">Beneficiaries</span>
              </div>
              <p className="text-lg font-medium">{vault.beneficiaries.length}</p>
            </div>
          </div>

          {/* Assets */}
          <div>
            <h3 className="text-lg font-display uppercase mb-3 flex items-center gap-2">
              <Bullet />
              Secured Assets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vault.assets.map((asset) => (
                <div key={asset.id} className="bg-accent/30 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="font-mono">{asset.type.toUpperCase()}</Badge>
                    <span className="text-xs text-muted-foreground">{asset.value}</span>
                  </div>
                  <p className="font-medium">{asset.name}</p>
                  {asset.description && (
                    <p className="text-xs text-muted-foreground mt-1">{asset.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Beneficiaries */}
          <div>
            <h3 className="text-lg font-display uppercase mb-3 flex items-center gap-2">
              <Bullet />
              Beneficiaries
            </h3>
            <div className="space-y-2">
              {vault.beneficiaries.map((beneficiary) => (
                <div key={beneficiary.walletAddress} className="bg-accent/30 rounded-lg p-3 border border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm">{beneficiary.walletAddress}</p>
                      <p className="text-xs text-muted-foreground">{beneficiary.name}</p>
                    </div>
                    {beneficiary.isPrimary && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        PRIMARY
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Preview */}
          {vault.messagePreview && (
            <div>
              <h3 className="text-lg font-display uppercase mb-3 flex items-center gap-2">
                <Bullet />
                Legacy Message
              </h3>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm italic">{vault.messagePreview}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground pt-4 border-t border-border/50">
            <div>
              <p className="uppercase mb-1">Created</p>
              <p className="font-mono">{new Date(vault.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="uppercase mb-1">Last Activity</p>
              <p className="font-mono">{vault.lastActivity}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="uppercase font-mono text-xs">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

