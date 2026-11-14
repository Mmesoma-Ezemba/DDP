"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DEFAULT_AVATARS, DEFAULT_AVATAR_URL, isDefaultAvatar } from "@/lib/constants/default-avatars"
import { cn } from "@/lib/utils"
import { Check, Upload } from "lucide-react"

interface AvatarSelectorProps {
  currentAvatar?: string
  onAvatarSelect: (avatarUrl: string) => void
  onUploadClick?: () => void
  className?: string
}

export function AvatarSelector({
  currentAvatar,
  onAvatarSelect,
  onUploadClick,
  className,
}: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    currentAvatar || DEFAULT_AVATAR_URL
  )

  const handleSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl)
    onAvatarSelect(avatarUrl)
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-lg font-display uppercase">Choose Your Avatar</h3>
          <p className="text-sm text-muted-foreground">
            Select from default avatars or upload your own
          </p>
        </div>

        {/* Current Avatar Preview */}
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/50">
            <Image
              src={selectedAvatar}
              alt="Selected avatar"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Current Selection</p>
            <p className="text-xs text-muted-foreground">
              {isDefaultAvatar(selectedAvatar) ? "Default Avatar" : "Custom Avatar"}
            </p>
          </div>
        </div>

        {/* Default Avatars Grid */}
        <div>
          <h4 className="text-sm font-medium mb-3 uppercase text-muted-foreground">
            Default Avatars
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DEFAULT_AVATARS.map((avatar) => {
              const isSelected = selectedAvatar === avatar.url
              return (
                <button
                  key={avatar.id}
                  onClick={() => handleSelect(avatar.url)}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                    "hover:border-primary/50 hover:scale-105",
                    isSelected
                      ? "border-primary shadow-lg shadow-primary/20"
                      : "border-border"
                  )}
                >
                  <Image
                    src={avatar.url}
                    alt={avatar.name}
                    fill
                    className="object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-5 h-5 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/90 to-transparent">
                    <p className="text-xs font-medium truncate">{avatar.name}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Custom Upload Button */}
        {onUploadClick && (
          <div>
            <h4 className="text-sm font-medium mb-3 uppercase text-muted-foreground">
              Custom Avatar
            </h4>
            <Button
              variant="outline"
              className="w-full"
              onClick={onUploadClick}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Custom Avatar
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              PNG, JPG or WEBP. Max 2MB.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
