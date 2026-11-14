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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Beneficiary } from "@/types/beneficiary"

interface AddBeneficiaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<Beneficiary>) => void
}

export function AddBeneficiaryDialog({ open, onOpenChange, onSubmit }: AddBeneficiaryDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    walletAddress: "",
    email: "",
    relationship: "",
    accessLevel: "view-only" as const,
    notificationPreference: "both" as const,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: formData.name,
      walletAddress: formData.walletAddress,
      email: formData.email,
      relationship: formData.relationship,
      accessLevel: formData.accessLevel,
      notificationPreference: formData.notificationPreference,
      status: "pending",
    })
    onOpenChange(false)
    setFormData({
      name: "",
      walletAddress: "",
      email: "",
      relationship: "",
      accessLevel: "view-only",
      notificationPreference: "both",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Beneficiary</DialogTitle>
          <DialogDescription>
            Add a new recipient to receive your digital legacy assets
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="walletAddress">Wallet Address or Pollar Beneficiary Email</Label>
            <Input
              id="walletAddress"
              value={formData.walletAddress}
              onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
              placeholder="0x... or family@gmail.com (Pollar auto-onboarding)"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              ⚡ Supports traditional Web3 addresses or email addresses for automated Pollar social wallet abstraction.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="beneficiary@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Input
              id="relationship"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              placeholder="e.g., Spouse, Child, Friend"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accessLevel">Access Level</Label>
              <Select
                value={formData.accessLevel}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, accessLevel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view-only">View Only</SelectItem>
                  <SelectItem value="full-access">Full Access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notificationPreference">Notifications</Label>
              <Select
                value={formData.notificationPreference}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, notificationPreference: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="uppercase font-mono text-xs">
              Add Beneficiary
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

