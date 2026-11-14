"use client"

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
import type { Beneficiary } from "@/types/beneficiary"
import { cn } from "@/lib/utils"

interface ViewBeneficiaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  beneficiary: Beneficiary | null
}

export function ViewBeneficiaryDialog({ open, onOpenChange, beneficiary }: ViewBeneficiaryDialogProps) {
  if (!beneficiary) return null

  const statusConfig = {
    active: { label: "[ACTIVE]", color: "text-success", bg: "bg-success/10" },
    pending: { label: "[PENDING]", color: "text-warning", bg: "bg-warning/10" },
    suspended: { label: "[SUSPENDED]", color: "text-destructive", bg: "bg-destructive/10" },
  }

  const config = statusConfig[beneficiary.status]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{beneficiary.name}</DialogTitle>
            <Badge variant={beneficiary.status === "active" ? "default" : "outline"} className={cn("font-mono", config.color)}>
              {config.label}
            </Badge>
          </div>
          <DialogDescription>
            {beneficiary.relationship && `Relationship: ${beneficiary.relationship}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-accent/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase mb-1">Wallet Address</p>
              <p className="font-mono text-sm break-all">{beneficiary.walletAddress}</p>
            </div>
            {beneficiary.email && (
              <div className="bg-accent/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground uppercase mb-1">Email</p>
                <p className="text-sm">{beneficiary.email}</p>
              </div>
            )}
          </div>

          {/* Access & Preferences */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-accent/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase mb-1">Access Level</p>
              <Badge variant="outline" className="font-mono">
                {beneficiary.accessLevel.toUpperCase()}
              </Badge>
            </div>
            <div className="bg-accent/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase mb-1">Notifications</p>
              <Badge variant="outline" className="font-mono">
                {beneficiary.notificationPreference.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Linked Vaults */}
          {beneficiary.linkedVaults.length > 0 && (
            <div>
              <h3 className="text-lg font-display uppercase mb-3 flex items-center gap-2">
                <Bullet />
                Linked Vaults ({beneficiary.linkedVaults.length})
              </h3>
              <div className="space-y-2">
                {beneficiary.linkedVaults.map((vault) => (
                  <div key={vault.vaultId} className="bg-accent/30 rounded-lg p-3 border border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-sm">{vault.vaultId}</p>
                        <p className="text-xs text-muted-foreground">{vault.vaultName}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {vault.accessLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground pt-4 border-t border-border/50">
            <div>
              <p className="uppercase mb-1">Added</p>
              <p className="font-mono">{new Date(beneficiary.addedAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="uppercase mb-1">Last Updated</p>
              <p className="font-mono">{beneficiary.lastUpdated}</p>
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

