"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PlusIcon from "@/components/icons/plus"
import { cn } from "@/lib/utils"

interface CreateVaultCardProps {
  onCreate?: () => void
}

export function CreateVaultCard({ onCreate }: CreateVaultCardProps) {
  return (
    <Card className="group relative overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary/70 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 bg-primary/5">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="relative p-8 flex flex-col items-center justify-center min-h-[400px] space-y-6">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative p-6 rounded-2xl bg-primary/10 border-2 border-primary/30 group-hover:border-primary/60 transition-all duration-300 group-hover:scale-110">
            <PlusIcon className="size-12 text-primary" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-display uppercase">Create New Vault</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Initialize a new digital will to secure your assets and messages for the future
          </p>
        </div>

        {/* Button */}
        <Button
          onClick={onCreate}
          size="lg"
          className="uppercase font-mono text-sm px-8 group-hover:scale-105 transition-transform duration-300"
        >
          <PlusIcon className="size-4 mr-2" />
          Initialize Vault
        </Button>

        {/* Stats */}
        <div className="flex items-center gap-6 pt-4 text-xs text-muted-foreground uppercase">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-success animate-pulse" />
            <span>AES-256 Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-chart-1 animate-pulse" />
            <span>On-Chain Verification</span>
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-[2px] bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500 -z-10" />
    </Card>
  )
}

