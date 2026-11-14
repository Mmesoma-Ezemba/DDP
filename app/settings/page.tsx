"use client"

import { useState, useEffect } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { AnimatedBackground } from "@/components/vaults/animated-background"
import { TechDecoration } from "@/components/vaults/tech-decoration"
import { DataStream } from "@/components/vaults/data-stream"
import { CircuitLines } from "@/components/vaults/circuit-lines"
import SettingsIcon from "@/components/icons/settings"
import BellIcon from "@/components/icons/bell"
import ShieldIcon from "@/components/icons/shield-check"
import LockIcon from "@/components/icons/lock"
import EyeIcon from "@/components/icons/eye"
import WalletIcon from "@/components/icons/wallet"
import UserIcon from "@/components/icons/user"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bullet } from "@/components/ui/bullet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { mockUserSettings } from "@/data/profile-mock"
import type { UserProfile } from "@/types/profile"
import { cn } from "@/lib/utils"
import TimerIcon from "@/components/icons/timer"
import { useWeb3, SUPPORTED_NETWORKS } from "@/lib/web3-context"
import { supportedChains } from "@/lib/thirdweb-provider"
import { AvatarSelector } from "@/components/profile/avatar-selector"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { updateUser } from "@/lib/supabase/users"
import { toast } from "sonner"
import { useGeolocation } from "@/hooks/use-geolocation"

export default function SettingsPage() {
  const [settings, setSettings] = useState(mockUserSettings)
  const [activeTab, setActiveTab] = useState<"avatar" | "notifications" | "security" | "privacy" | "display" | "web3">("avatar")
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState("/avatars/user_krimson.png")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    username: "",
    bio: "",
    website: "",
    twitter: "",
    location: "",
  })
  const { wallet, network, switchNetwork } = useWeb3()
  const location = useGeolocation()

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!wallet.address) {
        setIsLoadingProfile(false)
        return
      }

      try {
        const response = await fetch("/api/profile")
        if (response.ok) {
          const data = await response.json()
          if (data.profile) {
            setProfile(data.profile)
            setProfileForm({
              displayName: data.profile.displayName || "",
              username: data.profile.username || "",
              bio: data.profile.bio || "",
              website: data.profile.website || "",
              twitter: data.profile.twitter || "",
              location: data.profile.location || "",
            })
            setCurrentAvatar(data.profile.avatar || "/placeholder.svg")
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [wallet.address])

  // Update location when geolocation is available
  useEffect(() => {
    if (location.city && location.country && !profileForm.location) {
      setProfileForm((prev) => ({
        ...prev,
        location: `${location.city}, ${location.country}`,
      }))
    }
  }, [location.city, location.country, profileForm.location])

  const tabs = [
    { id: "avatar", label: "Avatar", icon: UserIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "security", label: "Security", icon: ShieldIcon },
    { id: "privacy", label: "Privacy", icon: EyeIcon },
    { id: "display", label: "Display", icon: SettingsIcon },
    { id: "web3", label: "Web3", icon: WalletIcon },
  ] as const

  const handleAvatarSelect = async (avatarUrl: string) => {
    setCurrentAvatar(avatarUrl)
    // Update user avatar in database
    if (wallet.address) {
      try {
        await updateUser(wallet.address, { avatar_url: avatarUrl })
      } catch (error) {
        console.error("Failed to update avatar:", error)
      }
    }
  }

  const handleAvatarUploadSuccess = (avatarUrl: string) => {
    setCurrentAvatar(avatarUrl)
    setShowAvatarUpload(false)
  }

  const handleProfileSave = async () => {
    if (!wallet.address) {
      toast.error("Please connect your wallet")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        toast.success("Profile updated successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleSetting = (category: keyof typeof settings, key: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key as keyof typeof prev[typeof category]],
      },
    }))
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Settings",
        description: "Configure your account and preferences",
        icon: SettingsIcon,
      }}
    >
      {/* Animated SVG Backgrounds */}
      <div className="fixed inset-0 -z-10">
        <AnimatedBackground />
        <DataStream />
      </div>

      {/* Header Decorations */}
      <div className="relative mb-6">
        <CircuitLines />
        <TechDecoration />
      </div>

      {/* Tab Navigation - Responsive with scroll */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border-2 transition-all duration-300 whitespace-nowrap font-mono text-[10px] sm:text-xs uppercase",
                isActive
                  ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Avatar Settings */}
      {activeTab === "avatar" && (
        <div className="space-y-4">
          {/* Profile Information */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserIcon className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-display uppercase">Profile Information</h3>
                <p className="text-xs text-muted-foreground uppercase flex items-center gap-2">
                  <Bullet />
                  Edit your profile details
                </p>
              </div>
            </div>

            {isLoadingProfile ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Display Name */}
                <div>
                  <Label htmlFor="displayName" className="text-xs uppercase font-mono mb-2 block">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={profileForm.displayName}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, displayName: e.target.value }))
                    }
                    placeholder="Enter your display name"
                    className="font-mono text-sm"
                    maxLength={50}
                  />
                </div>

                {/* Username */}
                <div>
                  <Label htmlFor="username" className="text-xs uppercase font-mono mb-2 block">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={profileForm.username}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") }))
                    }
                    placeholder="Enter your username"
                    className="font-mono text-sm"
                    maxLength={30}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Only lowercase letters, numbers, and underscores allowed
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio" className="text-xs uppercase font-mono mb-2 block">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Tell us about yourself"
                    className="font-mono text-sm min-h-[100px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {profileForm.bio.length}/500 characters
                  </p>
                </div>

                {/* Website */}
                <div>
                  <Label htmlFor="website" className="text-xs uppercase font-mono mb-2 block">
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={profileForm.website}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, website: e.target.value }))
                    }
                    placeholder="https://example.com"
                    className="font-mono text-sm"
                  />
                </div>

                {/* Twitter */}
                <div>
                  <Label htmlFor="twitter" className="text-xs uppercase font-mono mb-2 block">
                    Twitter Handle
                  </Label>
                  <Input
                    id="twitter"
                    value={profileForm.twitter}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, twitter: e.target.value }))
                    }
                    placeholder="@username"
                    className="font-mono text-sm"
                    maxLength={50}
                  />
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location" className="text-xs uppercase font-mono mb-2 block">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={profileForm.location}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="City, Country"
                    className="font-mono text-sm"
                    maxLength={100}
                  />
                  {location.loading && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Detecting location...
                    </p>
                  )}
                  {location.city && location.country && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs mt-1"
                      onClick={() =>
                        setProfileForm((prev) => ({
                          ...prev,
                          location: `${location.city}, ${location.country}`,
                        }))
                      }
                    >
                      Use detected location
                    </Button>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="uppercase font-mono text-xs"
                    onClick={() => {
                      if (profile) {
                        setProfileForm({
                          displayName: profile.displayName || "",
                          username: profile.username || "",
                          bio: profile.bio || "",
                          website: profile.website || "",
                          twitter: profile.twitter || "",
                          location: profile.location || "",
                        })
                      }
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    className="uppercase font-mono text-xs"
                    onClick={handleProfileSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Avatar Settings */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserIcon className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-display uppercase">Avatar Settings</h3>
                <p className="text-xs text-muted-foreground uppercase flex items-center gap-2">
                  <Bullet />
                  Customize your profile picture
                </p>
              </div>
            </div>

            {showAvatarUpload ? (
              <AvatarUpload
                userId={wallet.address || "user-001"}
                currentAvatar={currentAvatar}
                onUploadSuccess={handleAvatarUploadSuccess}
                onCancel={() => setShowAvatarUpload(false)}
              />
            ) : (
              <AvatarSelector
                currentAvatar={currentAvatar}
                onAvatarSelect={handleAvatarSelect}
                onUploadClick={() => setShowAvatarUpload(true)}
              />
            )}
          </Card>
        </div>
      )}

      {/* Notifications Settings */}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <BellIcon className="size-6 text-chart-2" />
              </div>
              <div>
                <h3 className="text-lg font-display uppercase">Notification Preferences</h3>
                <p className="text-xs text-muted-foreground uppercase flex items-center gap-2">
                  <Bullet />
                  Manage how you receive updates
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => {
                const labels = {
                  emailNotifications: { title: "Email Notifications", desc: "Receive updates via email" },
                  walletNotifications: { title: "Wallet Notifications", desc: "On-chain transaction alerts" },
                  heartbeatReminders: { title: "Heartbeat Reminders", desc: "Reminders to confirm activity" },
                  vaultTriggerAlerts: { title: "Vault Trigger Alerts", desc: "Critical vault events" },
                  beneficiaryUpdates: { title: "Beneficiary Updates", desc: "Changes to beneficiary status" },
                  securityAlerts: { title: "Security Alerts", desc: "Important security notices" },
                  marketingEmails: { title: "Marketing Emails", desc: "Product updates and news" },
                }
                const label = labels[key as keyof typeof labels]

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div>
                      <p className="font-mono text-sm mb-1">{label.title}</p>
                      <p className="text-xs text-muted-foreground">{label.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleSetting("notifications", key)}
                      className={cn(
                        "relative w-12 h-6 rounded-full transition-colors duration-300",
                        value ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-background rounded-full transition-transform duration-300",
                          value ? "translate-x-6" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-success/10">
                <ShieldIcon className="size-6 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-display uppercase">Security Settings</h3>
                <p className="text-xs text-muted-foreground uppercase flex items-center gap-2">
                  <Bullet />
                  Protect your account and assets
                </p>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="mb-6 p-4 border-2 rounded-lg border-success/30 bg-success/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <LockIcon className="size-5 text-success" />
                  <p className="font-mono text-sm">Two-Factor Authentication</p>
                </div>
                <Badge variant="outline" className="text-success border-success/30">
                  {settings.security.twoFactorEnabled ? "ENABLED" : "DISABLED"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Add an extra layer of security to your account
              </p>
              <Button variant="outline" size="sm" className="uppercase font-mono text-xs">
                {settings.security.twoFactorEnabled ? "Disable" : "Enable"} 2FA
              </Button>
            </div>

            {/* Multi-Sig */}
            <div className="mb-6 p-4 border-2 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldIcon className="size-5 text-chart-1" />
                  <p className="font-mono text-sm">Multi-Signature Protection</p>
                </div>
                <Badge variant="outline">
                  {settings.security.multiSigEnabled ? "ENABLED" : "DISABLED"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Require multiple signatures for critical actions
              </p>
              <Button variant="outline" size="sm" className="uppercase font-mono text-xs">
                Configure Multi-Sig
              </Button>
            </div>

            {/* Session Timeout */}
            <div className="mb-6 p-4 border-2 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TimerIcon className="size-5 text-warning" />
                <p className="font-mono text-sm">Session Timeout</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Automatically log out after {settings.security.sessionTimeout} minutes of inactivity
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="uppercase font-mono text-xs">
                  15 min
                </Button>
                <Button variant="outline" size="sm" className="uppercase font-mono text-xs bg-primary/10">
                  30 min
                </Button>
                <Button variant="outline" size="sm" className="uppercase font-mono text-xs">
                  60 min
                </Button>
              </div>
            </div>

            {/* Trusted Devices */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-mono text-sm uppercase">Trusted Devices</h4>
                <Badge variant="outline">{settings.security.trustedDevices.length} ACTIVE</Badge>
              </div>
              <div className="space-y-2">
                {settings.security.trustedDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-mono text-sm mb-1">{device.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {device.location} • Last used: {device.lastUsed}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Privacy Settings */}
      {activeTab === "privacy" && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-chart-3/10">
                <EyeIcon className="size-6 text-chart-3" />
              </div>
              <div>
                <h3 className="text-lg font-display uppercase">Privacy Settings</h3>
                <p className="text-xs text-muted-foreground uppercase flex items-center gap-2">
                  <Bullet />
                  Control your data and visibility
                </p>
              </div>
            </div>

            {/* Profile Visibility */}
            <div className="mb-6 p-4 border-2 rounded-lg">
              <p className="font-mono text-sm mb-2">Profile Visibility</p>
              <p className="text-xs text-muted-foreground mb-3">Who can see your profile information</p>
              <div className="flex gap-2">
                {["public", "connections-only", "private"].map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "uppercase font-mono text-xs",
                      settings.privacy.profileVisibility === option && "bg-primary/10 border-primary"
                    )}
                  >
                    {option.replace("-", " ")}
                  </Button>
                ))}
              </div>
            </div>

            {/* Privacy Toggles */}
            <div className="space-y-4">
              {[
                { key: "showVaultCount", title: "Show Vault Count", desc: "Display number of vaults on profile" },
                { key: "showAssetValues", title: "Show Asset Values", desc: "Display total asset value publicly" },
                { key: "allowSearch", title: "Allow Search", desc: "Let others find your profile via search" },
                { key: "dataSharing", title: "Data Sharing", desc: "Share anonymized data for analytics" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div>
                    <p className="font-mono text-sm mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleSetting("privacy", item.key)}
                    className={cn(
                      "relative w-12 h-6 rounded-full transition-colors duration-300",
                      settings.privacy[item.key as keyof typeof settings.privacy]
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 bg-background rounded-full transition-transform duration-300",
                        settings.privacy[item.key as keyof typeof settings.privacy]
                          ? "translate-x-6"
                          : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Data Management */}
            <div className="mt-6 p-4 border-2 border-destructive/30 rounded-lg bg-destructive/5">
              <p className="font-mono text-sm mb-2 text-destructive">Data Management</p>
              <p className="text-xs text-muted-foreground mb-3">
                Export or delete your personal data
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="uppercase font-mono text-xs">
                  Export Data
                </Button>
                <Button variant="outline" size="sm" className="uppercase font-mono text-xs text-destructive border-destructive/30">
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Display Settings */}
      {activeTab === "display" && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-warning/10">
                <SettingsIcon className="size-6 text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-display uppercase">Display Settings</h3>
                <p className="text-xs text-muted-foreground uppercase flex items-center gap-2">
                  <Bullet />
                  Customize your experience
                </p>
              </div>
            </div>

            {/* Theme */}
            <div className="mb-6 p-4 border-2 rounded-lg">
              <p className="font-mono text-sm mb-2">Theme</p>
              <p className="text-xs text-muted-foreground mb-3">Choose your preferred color scheme</p>
              <div className="flex gap-2">
                {["dark", "light", "system"].map((theme) => (
                  <Button
                    key={theme}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "uppercase font-mono text-xs",
                      settings.display.theme === theme && "bg-primary/10 border-primary"
                    )}
                  >
                    {theme}
                  </Button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="mb-6 p-4 border-2 rounded-lg">
              <p className="font-mono text-sm mb-2">Language</p>
              <p className="text-xs text-muted-foreground mb-3">Select your preferred language</p>
              <select className="w-full px-3 py-2 bg-background border-2 rounded-lg font-mono text-sm">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            {/* Timezone */}
            <div className="mb-6 p-4 border-2 rounded-lg">
              <p className="font-mono text-sm mb-2">Timezone</p>
              <p className="text-xs text-muted-foreground mb-3">Current: {settings.display.timezone}</p>
              <Button variant="outline" size="sm" className="uppercase font-mono text-xs">
                Change Timezone
              </Button>
            </div>

            {/* Date Format */}
            <div className="mb-6 p-4 border-2 rounded-lg">
              <p className="font-mono text-sm mb-2">Date Format</p>
              <p className="text-xs text-muted-foreground mb-3">How dates are displayed</p>
              <div className="flex gap-2 flex-wrap">
                {["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].map((format) => (
                  <Button
                    key={format}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "uppercase font-mono text-xs",
                      settings.display.dateFormat === format && "bg-primary/10 border-primary"
                    )}
                  >
                    {format}
                  </Button>
                ))}
              </div>
            </div>

            {/* Currency */}
            <div className="p-4 border-2 rounded-lg">
              <p className="font-mono text-sm mb-2">Display Currency</p>
              <p className="text-xs text-muted-foreground mb-3">Current: {settings.display.currency}</p>
              <select className="w-full px-3 py-2 bg-background border-2 rounded-lg font-mono text-sm">
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="ETH">ETH - Ethereum</option>
                <option value="BTC">BTC - Bitcoin</option>
              </select>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" className="uppercase font-mono text-xs">
              Reset to Default
            </Button>
            <Button className="uppercase font-mono text-xs">
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Web3 Settings */}
      {activeTab === "web3" && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <WalletIcon className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-display uppercase">Web3 Configuration</h3>
                <p className="text-xs text-muted-foreground uppercase flex items-center gap-2">
                  <Bullet />
                  Manage blockchain and transaction settings
                </p>
              </div>
            </div>

            {/* Current Connection Status */}
            {wallet.isConnected && wallet.address ? (
              <div className="mb-6 p-4 border-2 border-success/30 rounded-lg bg-success/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-success animate-pulse" />
                    <p className="font-mono text-sm">Wallet Connected</p>
                  </div>
                  <Badge variant="outline" className="text-success border-success/30">
                    {network?.name || "Unknown Network"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{wallet.address}</p>
              </div>
            ) : (
              <div className="mb-6 p-4 border-2 border-muted/30 rounded-lg bg-muted/5">
                <p className="font-mono text-sm mb-2">No Wallet Connected</p>
                <p className="text-xs text-muted-foreground">Connect a wallet to configure Web3 settings</p>
              </div>
            )}

            {/* Default Network */}
            <div className="mb-6 p-4 border-2 rounded-lg">
              <p className="font-mono text-sm mb-2">Default Network</p>
              <p className="text-xs text-muted-foreground mb-3">
                Preferred blockchain network for transactions
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.values(SUPPORTED_NETWORKS).map((net) => (
                  <button
                    key={net.chainId}
                    onClick={() => {
                      setSettings((prev) => ({
                        ...prev,
                        web3: { ...prev.web3, defaultNetwork: net.chainId },
                      }))
                      if (wallet.isConnected) switchNetwork(net.chainId)
                    }}
                    className={cn(
                      "p-3 border-2 rounded-lg text-left transition-all hover:border-primary/50",
                      settings.web3.defaultNetwork === net.chainId
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-sm">{net.name}</p>
                        <p className="text-xs text-muted-foreground">{net.nativeCurrency.symbol}</p>
                      </div>
                      {settings.web3.defaultNetwork === net.chainId && (
                        <Badge variant="outline" className="text-xs">
                          DEFAULT
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gas Price Preference */}
            <div className="mb-6 p-4 border-2 rounded-lg">
              <p className="font-mono text-sm mb-2">Gas Price Preference</p>
              <p className="text-xs text-muted-foreground mb-3">
                Choose transaction speed vs cost
              </p>
              <div className="flex gap-2 flex-wrap">
                {(["slow", "standard", "fast"] as const).map((speed) => (
                  <Button
                    key={speed}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        web3: { ...prev.web3, gasPrice: speed },
                      }))
                    }
                    className={cn(
                      "uppercase font-mono text-xs",
                      settings.web3.gasPrice === speed && "bg-primary/10 border-primary"
                    )}
                  >
                    {speed}
                  </Button>
                ))}
              </div>
            </div>

            {/* Transaction Settings */}
            <div className="mb-6 p-4 border-2 rounded-lg">
              <p className="font-mono text-sm mb-4">Transaction Settings</p>
              
              <div className="space-y-4">
                {/* Auto Approve */}
                <div className="flex items-center justify-between p-3 border-2 rounded-lg hover:border-primary/50 transition-colors">
                  <div>
                    <p className="font-mono text-sm mb-1">Auto-Approve Transactions</p>
                    <p className="text-xs text-muted-foreground">
                      Automatically approve transactions without confirmation
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSetting("web3", "autoApproveTransactions")}
                    className={cn(
                      "relative w-12 h-6 rounded-full transition-colors duration-300",
                      settings.web3.autoApproveTransactions ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 bg-background rounded-full transition-transform duration-300",
                        settings.web3.autoApproveTransactions ? "translate-x-6" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                {/* Show Transaction Details */}
                <div className="flex items-center justify-between p-3 border-2 rounded-lg hover:border-primary/50 transition-colors">
                  <div>
                    <p className="font-mono text-sm mb-1">Show Transaction Details</p>
                    <p className="text-xs text-muted-foreground">
                      Display detailed transaction information before signing
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSetting("web3", "showTransactionDetails")}
                    className={cn(
                      "relative w-12 h-6 rounded-full transition-colors duration-300",
                      settings.web3.showTransactionDetails ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 bg-background rounded-full transition-transform duration-300",
                        settings.web3.showTransactionDetails ? "translate-x-6" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Slippage Tolerance */}
            <div className="mb-6 p-4 border-2 rounded-lg">
              <p className="font-mono text-sm mb-2">Slippage Tolerance</p>
              <p className="text-xs text-muted-foreground mb-3">
                Maximum acceptable price slippage: {settings.web3.slippageTolerance}%
              </p>
              <div className="flex gap-2 flex-wrap">
                {[0.1, 0.5, 1.0, 3.0].map((value) => (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        web3: { ...prev.web3, slippageTolerance: value },
                      }))
                    }
                    className={cn(
                      "uppercase font-mono text-xs",
                      settings.web3.slippageTolerance === value && "bg-primary/10 border-primary"
                    )}
                  >
                    {value}%
                  </Button>
                ))}
              </div>
            </div>

            {/* Transaction Deadline */}
            <div className="p-4 border-2 rounded-lg">
              <p className="font-mono text-sm mb-2">Transaction Deadline</p>
              <p className="text-xs text-muted-foreground mb-3">
                Transaction timeout: {settings.web3.transactionDeadline} minutes
              </p>
              <div className="flex gap-2 flex-wrap">
                {[10, 20, 30, 60].map((minutes) => (
                  <Button
                    key={minutes}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        web3: { ...prev.web3, transactionDeadline: minutes },
                      }))
                    }
                    className={cn(
                      "uppercase font-mono text-xs",
                      settings.web3.transactionDeadline === minutes && "bg-primary/10 border-primary"
                    )}
                  >
                    {minutes} min
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" className="uppercase font-mono text-xs">
              Reset to Default
            </Button>
            <Button className="uppercase font-mono text-xs">
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </DashboardPageLayout>
  )
}

