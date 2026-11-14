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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Vault } from "@/types/vault"

interface CreateVaultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<Vault>) => void
}

export function CreateVaultDialog({ open, onOpenChange, onSubmit }: CreateVaultDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    daysUntilTrigger: 90,
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: formData.name,
      messagePreview: formData.message.slice(0, 100),
      daysUntilTrigger: formData.daysUntilTrigger,
      status: "draft",
    })
    onOpenChange(false)
    setFormData({ name: "", description: "", daysUntilTrigger: 90, message: "" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Vault</DialogTitle>
          <DialogDescription>
            Initialize a new digital legacy vault to secure your assets and messages
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Vault Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Family Legacy Vault"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this vault's purpose"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="daysUntilTrigger">Inactivity Threshold (Days)</Label>
            <Select
              value={formData.daysUntilTrigger.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, daysUntilTrigger: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
                <SelectItem value="180">180 Days</SelectItem>
                <SelectItem value="365">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Legacy Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="A message to be delivered to your beneficiaries..."
              rows={5}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="uppercase font-mono text-xs">
              Create Vault
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

