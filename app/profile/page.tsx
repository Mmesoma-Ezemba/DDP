"use client"

import { useEffect, useState } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { AnimatedBackground } from "@/components/vaults/animated-background"
import { TechDecoration } from "@/components/vaults/tech-decoration"
import { DataStream } from "@/components/vaults/data-stream"
import { CircuitLines } from "@/components/vaults/circuit-lines"
import { BeneficiaryAvatarAnimated } from "@/components/beneficiaries/beneficiary-avatar-animated"
import UserIcon from "@/components/icons/user"
import AwardIcon from "@/components/icons/award"
import CubeIcon from "@/components/icons/cube"
import UsersIcon from "@/components/icons/users"
import HeartIcon from "@/components/icons/heart"
import ActivityIcon from "@/components/icons/activity"
import WalletIcon from "@/components/icons/wallet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bullet } from "@/components/ui/bullet"
import { mockUserProfile } from "@/data/profile-mock"
import type { UserProfile } from "@/types/profile"
import { cn } from "@/lib/utils"
import { useWeb3 } from "@/lib/web3-context"
import NextDynamic from "next/dynamic"
import { useGeolocation } from "@/hooks/use-geolocation"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"

// Disable SSR for ConnectButton to avoid hydration mismatches
const ConnectButton = NextDynamic(
  () => import("@/components/web3/connect-button").then((m) => m.ConnectButton),
  { ssr: false }
)

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { wallet, network, disconnectWallet, formatAddress } = useWeb3()
  const location = useGeolocation()
  const router = useRouter()

  // Fetch real profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!wallet.address) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/profile")
        if (response.ok) {
          const data = await response.json()
          setProfile(data.profile)
        } else {
          // Fallback to mock if no profile exists
          setProfile(mockUserProfile)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        // Fallback to mock on error
        setProfile(mockUserProfile)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [wallet.address])

  // Handle Edit Profile button
  const handleEditProfile = () => {
    router.push("/settings")
    toast.info("Redirecting to settings...")
  }

  if (isLoading) {
    return (
      <DashboardPageLayout
        header={{
          title: "Profile",
          description: "Manage your digital legacy identity",
          icon: UserIcon,
        }}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground uppercase">Loading profile...</p>
          </div>
        </div>
      </DashboardPageLayout>
    )
  }

  const displayProfile = profile || mockUserProfile

  // Use dynamic location if available, fallback to profile location
  const displayLocation = location.loading
    ? "Detecting location..."
    : location.error
    ? displayProfile.location
    : location.city && location.country
    ? `${location.city}, ${location.country}`
    : displayProfile.location

  const rarityConfig = {
    common: { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-muted/30" },
    rare: { color: "text-chart-2", bg: "bg-chart-2/10", border: "border-chart-2/30" },
    epic: { color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30" },
    legendary: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Profile",
        description: "Manage your digital legacy identity",
        icon: UserIcon,
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

      {/* Profile Header Card - Responsive */}
      <Card className="relative overflow-hidden border-2 p-4 sm:p-6 mb-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="relative flex items-start gap-6 flex-col md:flex-row">
          {/* Avatar */}
          <div className="shrink-0">
            <BeneficiaryAvatarAnimated
              avatar={displayProfile.avatar}
              name={displayProfile.displayName}
              isPrimary={true}
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
              <div>
                <h1 className="text-3xl font-display uppercase mb-1">{displayProfile.displayName}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  @{displayProfile.username}
                </p>
              </div>
              <Button 
                variant="outline" 
                className="uppercase font-mono text-xs"
                onClick={handleEditProfile}
              >
                Edit Profile
              </Button>
            </div>

            {/* Bio */}
            {displayProfile.bio && (
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed max-w-2xl">
                {displayProfile.bio}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {displayLocation && (
                <div className="flex items-center gap-2">
                  <Bullet />
                  <span className={cn(location.loading && "animate-pulse")}>{displayLocation}</span>
                  {!location.loading && !location.error && location.city && (
                    <span className="text-[10px] text-success">●</span>
                  )}
                </div>
              )}
              {displayProfile.website && (
                <div className="flex items-center gap-2">
                  <Bullet />
                  <a href={displayProfile.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    {displayProfile.website.replace('https://', '')}
                  </a>
                </div>
              )}
              {displayProfile.twitter && (
                <div className="flex items-center gap-2">
                  <Bullet />
                  <span>{displayProfile.twitter}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Bullet />
                <span>Joined {new Date(displayProfile.joinedDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Wallet Connection Card - Responsive */}
      <Card className="p-4 sm:p-6 mb-6 border-2 border-primary/30 bg-primary/5">
        {wallet.isConnected && wallet.address ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <WalletIcon className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Connected Wallet</p>
                  <p className="font-mono text-sm truncate">{wallet.address}</p>
                  {network && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {network.name}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="uppercase font-mono text-xs"
                  onClick={() => navigator.clipboard.writeText(wallet.address || "")}
                >
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="uppercase font-mono text-xs text-destructive hover:text-destructive"
                  onClick={disconnectWallet}
                >
                  Disconnect
                </Button>
              </div>
            </div>
            {network?.blockExplorer && (
              <a
                href={`${network.blockExplorer}/address/${wallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-2"
              >
                <Bullet />
                View on {network.name === "Polygon" ? "Polygonscan" : "Etherscan"}
              </a>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-lg bg-muted/10 shrink-0">
                <WalletIcon className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Wallet Not Connected</p>
                <p className="text-sm">Connect your Web3 wallet to manage your digital legacy</p>
              </div>
            </div>
            <ConnectButton variant="cyberpunk" size="default" />
          </div>
        )}
        {wallet.error && (
          <div className="mt-3 p-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive">
            {wallet.error}
          </div>
        )}
      </Card>

      {/* Stats Grid */}
      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        <Card className="p-4 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <CubeIcon className="size-4 text-chart-1" />
            <p className="text-xs text-muted-foreground uppercase">Vaults</p>
          </div>
          <p className="text-2xl font-display">{displayProfile.stats.vaultsCreated}</p>
        </Card>

        <Card className="p-4 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <UsersIcon className="size-4 text-chart-2" />
            <p className="text-xs text-muted-foreground uppercase">Recipients</p>
          </div>
          <p className="text-2xl font-display">{displayProfile.stats.beneficiariesAdded}</p>
        </Card>

        <Card className="p-4 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <WalletIcon className="size-4 text-success" />
            <p className="text-xs text-muted-foreground uppercase">Secured</p>
          </div>
          <p className="text-2xl font-display">{displayProfile.stats.totalAssetsSecured}</p>
        </Card>

        <Card className="p-4 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <HeartIcon className="size-4 text-destructive" />
            <p className="text-xs text-muted-foreground uppercase">Heartbeats</p>
          </div>
          <p className="text-2xl font-display">{displayProfile.stats.heartbeatsThisMonth}</p>
        </Card>

        <Card className="p-4 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <ActivityIcon className="size-4 text-warning" />
            <p className="text-xs text-muted-foreground uppercase">Activities</p>
          </div>
          <p className="text-2xl font-display">{displayProfile.stats.activitiesLogged}</p>
        </Card>

        <Card className="p-4 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <UserIcon className="size-4 text-chart-3" />
            <p className="text-xs text-muted-foreground uppercase">Days</p>
          </div>
          <p className="text-2xl font-display">{displayProfile.stats.daysSinceJoined}</p>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <AwardIcon className="size-6 text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-display uppercase">Achievements</h3>
              <p className="text-xs text-muted-foreground uppercase flex items-center gap-2">
                <Bullet />
                {displayProfile.achievements.length} Unlocked
              </p>
            </div>
          </div>
        </div>

        {/* Achievements Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {displayProfile.achievements.map((achievement) => {
            const config = rarityConfig[achievement.rarity]
            return (
              <div
                key={achievement.id}
                className={cn(
                  "group relative overflow-hidden border-2 rounded-lg p-4 transition-all duration-300 hover:shadow-lg",
                  config.bg,
                  config.border,
                  "hover:border-primary/50"
                )}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                      backgroundSize: "10px 10px",
                    }}
                  />
                </div>

                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <Badge variant="outline" className={cn("font-mono text-xs", config.color)}>
                      {achievement.rarity.toUpperCase()}
                    </Badge>
                  </div>

                  <h4 className="font-display text-sm mb-1">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{achievement.description}</p>

                  <p className="text-xs text-muted-foreground">
                    Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </DashboardPageLayout>
  )
}

