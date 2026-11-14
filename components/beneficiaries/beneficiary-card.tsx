"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bullet } from "@/components/ui/bullet"
import { BeneficiaryAvatarAnimated } from "./beneficiary-avatar-animated"
import ShieldCheckIcon from "@/components/icons/shield-check"
import CubeIcon from "@/components/icons/cube"
import KeyIcon from "@/components/icons/key"
import type { Beneficiary } from "@/types/beneficiary"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DotsVerticalIcon from "@/components/icons/dots-vertical"

interface BeneficiaryCardProps {
  beneficiary: Beneficiary
  onView?: (beneficiary: Beneficiary) => void
  onEdit?: (beneficiary: Beneficiary) => void
  onRemove?: (beneficiary: Beneficiary) => void
}

export function BeneficiaryCard({ beneficiary, onView, onEdit, onRemove }: BeneficiaryCardProps) {
  const statusConfig = {
    active: {
      label: "[ACTIVE]",
      variant: "default" as const,
      color: "text-success",
      bg: "bg-success/10",
    },
    pending: {
      label: "[PENDING]",
      variant: "secondary" as const,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    suspended: {
      label: "[SUSPENDED]",
      variant: "destructive" as const,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  }

  const accessLevelConfig = {
    full: { label: "FULL ACCESS", color: "text-success" },
    partial: { label: "PARTIAL", color: "text-warning" },
    "view-only": { label: "VIEW ONLY", color: "text-muted-foreground" },
  }

  const config = statusConfig[beneficiary.status]
  const accessConfig = accessLevelConfig[beneficiary.accessLevel]

  return (
    <Card
      className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
      onClick={() => onView?.(beneficiary)}
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      {/* SVG Corner Decoration */}
      <div className="absolute top-2 right-2 w-16 h-16 opacity-20 group-hover:opacity-40 transition-opacity">
        <svg width="100%" height="100%" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 0,0 L 64,0 L 64,64"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray="4 4"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="16"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>

      {/* Primary Badge Glow */}
      {beneficiary.isPrimary && (
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-chart-1/20 text-chart-1 border-chart-1/30 font-mono text-xs animate-pulse">
            ⭐ PRIMARY
          </Badge>
        </div>
      )}

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4" onClick={(e) => e.stopPropagation()}>
          <BeneficiaryAvatarAnimated
            avatar={beneficiary.avatar}
            name={beneficiary.name}
            isPrimary={beneficiary.isPrimary}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="text-xl font-display mb-1">{beneficiary.name}</h3>
                <p className="text-xs text-muted-foreground uppercase flex items-center gap-2">
                  <Bullet className="shrink-0" />
                  {beneficiary.relationship}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={config.variant} className="shrink-0 font-mono text-xs">
                  {config.label}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <DotsVerticalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onView?.(beneficiary)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(beneficiary)}>
                      Edit Beneficiary
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onRemove?.(beneficiary)}
                      className="text-destructive focus:text-destructive"
                    >
                      Remove Beneficiary
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="bg-accent/50 rounded px-2 py-1 font-mono text-xs truncate">
              {beneficiary.walletAddress.slice(0, 10)}...
              {beneficiary.walletAddress.slice(-8)}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Access Level */}
          <div className="bg-accent/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2">
              <KeyIcon className={cn("size-4", accessConfig.color)} />
              <span className="text-xs text-muted-foreground uppercase">Access</span>
            </div>
            <p className={cn("text-sm font-medium uppercase", accessConfig.color)}>
              {accessConfig.label}
            </p>
          </div>

          {/* Linked Vaults */}
          <div className="bg-accent/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2">
              <CubeIcon className="size-4 text-chart-2" />
              <span className="text-xs text-muted-foreground uppercase">Vaults</span>
            </div>
            <p className="text-sm font-medium">{beneficiary.linkedVaults.length}</p>
          </div>

          {/* Verification */}
          <div className="bg-accent/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-4 text-success" />
              <span className="text-xs text-muted-foreground uppercase">Status</span>
            </div>
            <p className="text-sm font-medium">{beneficiary.lastVerified || "Not Verified"}</p>
          </div>
        </div>

        {/* Linked Vaults */}
        {beneficiary.linkedVaults.length > 0 && (
          <div className="bg-accent/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Bullet />
              <span className="text-xs text-muted-foreground uppercase">Linked Vaults</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {beneficiary.linkedVaults.slice(0, 2).map((vault) => (
                <Badge key={vault.vaultId} variant="outline" className="text-xs font-mono">
                  {vault.vaultName}
                  {vault.estimatedValue && (
                    <span className="ml-2 text-chart-1">({vault.estimatedValue})</span>
                  )}
                </Badge>
              ))}
              {beneficiary.linkedVaults.length > 2 && (
                <Badge variant="outline" className="text-xs font-mono">
                  +{beneficiary.linkedVaults.length - 2} MORE
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Contact Info */}
        {beneficiary.email && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-2">
              <Bullet />
              Contact Email
            </p>
            <p className="text-sm font-mono">{beneficiary.email}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          <Button
            onClick={() => onView?.(beneficiary)}
            variant="outline"
            size="sm"
            className="flex-1 uppercase font-mono text-xs"
          >
            View Details
          </Button>
          <Button
            onClick={() => onEdit?.(beneficiary)}
            variant="default"
            size="sm"
            className="flex-1 uppercase font-mono text-xs"
          >
            Manage
          </Button>
          {beneficiary.status !== "suspended" && (
            <Button
              onClick={() => onRemove?.(beneficiary)}
              variant="destructive"
              size="sm"
              className="uppercase font-mono text-xs"
            >
              Remove
            </Button>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <span>Added: {new Date(beneficiary.addedDate).toLocaleDateString()}</span>
          <span className="flex items-center gap-1">
            Notification: {beneficiary.notificationPreference.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Glow effect on hover */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 -z-10" />
    </Card>
  )
}

