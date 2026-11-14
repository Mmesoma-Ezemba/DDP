"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bullet } from "@/components/ui/bullet"
import CubeIcon from "@/components/icons/cube"
import ShieldCheckIcon from "@/components/icons/shield-check"
import TimerIcon from "@/components/icons/timer"
import WalletIcon from "@/components/icons/wallet"
import { VaultIconAnimated } from "./vault-icon-animated"
import type { Vault } from "@/types/vault"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DotsVerticalIcon from "@/components/icons/dots-vertical"

interface VaultCardProps {
  vault: Vault
  onView?: (vault: Vault) => void
  onEdit?: (vault: Vault) => void
  onDelete?: (vault: Vault) => void
}

export function VaultCard({ vault, onView, onEdit, onDelete }: VaultCardProps) {
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
    triggered: {
      label: "[TRIGGERED]",
      variant: "destructive" as const,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    draft: {
      label: "[DRAFT]",
      variant: "outline" as const,
      color: "text-muted-foreground",
      bg: "bg-muted/10",
    },
  }

  const config = statusConfig[vault.status]

  return (
    <Card
      className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
      onClick={() => onView?.(vault)}
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

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1" onClick={(e) => e.stopPropagation()}>
            <div
              className={cn(
                "p-2 rounded-lg shrink-0 transition-all duration-300 group-hover:scale-110 relative",
                config.bg
              )}
            >
              <div className={cn("relative z-10", config.color)}>
                <VaultIconAnimated />
              </div>
              {/* Animated ring behind icon */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.3"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 50 50"
                      to="360 50 50"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-display truncate mb-1">{vault.name}</h3>
              <p className="text-xs text-muted-foreground uppercase flex items-center gap-2">
                <Bullet className="shrink-0" />
                ID: {vault.id.slice(0, 8)}...{vault.id.slice(-4)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
                <DropdownMenuItem onClick={() => onView?.(vault)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(vault)}>
                  Edit Vault
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(vault)}
                  className="text-destructive focus:text-destructive"
                >
                  Delete Vault
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Encryption Status */}
          <div className="bg-accent/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-4 text-success" />
              <span className="text-xs text-muted-foreground uppercase">Encryption</span>
            </div>
            <p className="text-sm font-medium uppercase">
              {vault.encryptionStatus === "enabled" ? "AES-256" : "PENDING"}
            </p>
          </div>

          {/* Inactivity Timer */}
          <div className="bg-accent/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2">
              <TimerIcon className="size-4 text-warning" />
              <span className="text-xs text-muted-foreground uppercase">Timer</span>
            </div>
            <p className="text-sm font-medium">
              {vault.daysUntilTrigger > 0 ? `${vault.daysUntilTrigger}D` : "EXPIRED"}
            </p>
          </div>

          {/* Beneficiaries */}
          <div className="bg-accent/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2">
              <WalletIcon className="size-4 text-chart-1" />
              <span className="text-xs text-muted-foreground uppercase">Recipients</span>
            </div>
            <p className="text-sm font-medium">{vault.beneficiaries.length}</p>
          </div>
        </div>

        {/* Assets Summary */}
        <div className="bg-accent/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Bullet />
            <span className="text-xs text-muted-foreground uppercase">Secured Assets</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {vault.assets.slice(0, 3).map((asset) => (
              <Badge key={asset.id} variant="outline" className="text-xs font-mono">
                {asset.type.toUpperCase()}: {asset.name}
              </Badge>
            ))}
            {vault.assets.length > 3 && (
              <Badge variant="outline" className="text-xs font-mono">
                +{vault.assets.length - 3} MORE
              </Badge>
            )}
          </div>
        </div>

        {/* Message Preview */}
        {vault.messagePreview && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-2">
              <Bullet />
              Legacy Message
            </p>
            <p className="text-sm italic line-clamp-2">{vault.messagePreview}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          <Button
            onClick={() => onView?.(vault)}
            variant="outline"
            className="flex-1 uppercase font-mono text-xs"
          >
            View Details
          </Button>
          <Button
            onClick={() => onEdit?.(vault)}
            variant="default"
            className="flex-1 uppercase font-mono text-xs"
          >
            Manage
          </Button>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <span>Created: {new Date(vault.createdAt).toLocaleDateString()}</span>
          <span className="flex items-center gap-1">
            Last Activity: {vault.lastActivity}
          </span>
        </div>
      </div>

      {/* Glow effect on hover */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 -z-10" />
    </Card>
  )
}

