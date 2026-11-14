"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import UserPlusIcon from "@/components/icons/user-plus"

interface AddBeneficiaryCardProps {
  onAdd?: () => void
}

export function AddBeneficiaryCard({ onAdd }: AddBeneficiaryCardProps) {
  return (
    <Card className="group relative overflow-hidden border-2 border-dashed border-chart-1/30 hover:border-chart-1/70 transition-all duration-300 hover:shadow-lg hover:shadow-chart-1/20 bg-chart-1/5">
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

      <div className="relative p-8 flex flex-col items-center justify-center min-h-[420px] space-y-6">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-chart-1/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative p-6 rounded-2xl bg-chart-1/10 border-2 border-chart-1/30 group-hover:border-chart-1/60 transition-all duration-300 group-hover:scale-110">
            <UserPlusIcon className="size-12 text-chart-1" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-display uppercase">Add Beneficiary</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Designate a trusted individual to receive your digital assets and legacy messages
          </p>
        </div>

        {/* Button */}
        <Button
          onClick={onAdd}
          size="lg"
          className="uppercase font-mono text-sm px-8 group-hover:scale-105 transition-transform duration-300 bg-chart-1 hover:bg-chart-1/80"
        >
          <UserPlusIcon className="size-4 mr-2" />
          Add Recipient
        </Button>

        {/* Stats */}
        <div className="flex items-center gap-6 pt-4 text-xs text-muted-foreground uppercase">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-chart-1 animate-pulse" />
            <span>Wallet Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-success animate-pulse" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-[2px] bg-gradient-to-r from-chart-1/0 via-chart-1/30 to-chart-1/0 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500 -z-10" />
    </Card>
  )
}

