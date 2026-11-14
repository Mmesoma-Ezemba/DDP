import type { UserProfile, UserSettings } from "@/types/profile"

export const mockUserProfile: UserProfile = {
  id: "user-001",
  username: "krimson",
  displayName: "KRIMSON",
  email: "krimson@joyco.studio",
  walletAddress: "0x8b4e2f9a1c3d5e7f2a6b8c0d1e3f5a7b9c1d3e5f",
  avatar: "/avatars/user_krimson.png",
  bio: "Building the future of digital legacy on Web3. Crypto enthusiast, NFT collector, and decentralization advocate.",
  location: "Auto-detected", // Dynamic location via useGeolocation hook
  website: "https://krimson.io",
  twitter: "@krimson_eth",
  joinedDate: "2024-07-10T10:00:00Z",
  lastActive: "2 hours ago",
  stats: {
    vaultsCreated: 4,
    beneficiariesAdded: 5,
    totalAssetsSecured: "8.6M",
    daysSinceJoined: 119,
    heartbeatsThisMonth: 24,
    activitiesLogged: 127,
  },
  achievements: [
    {
      id: "ach-001",
      title: "First Vault",
      description: "Created your first digital legacy vault",
      icon: "🏆",
      unlockedAt: "2024-07-10T12:00:00Z",
      rarity: "common",
    },
    {
      id: "ach-002",
      title: "Security Champion",
      description: "Enabled AES-256 encryption on all vaults",
      icon: "🛡️",
      unlockedAt: "2024-07-10T14:30:00Z",
      rarity: "rare",
    },
    {
      id: "ach-003",
      title: "Active Guardian",
      description: "Maintained 30+ day heartbeat streak",
      icon: "💚",
      unlockedAt: "2024-08-15T09:00:00Z",
      rarity: "epic",
    },
    {
      id: "ach-004",
      title: "Multi-Vault Master",
      description: "Manage 3 or more active vaults",
      icon: "⚡",
      unlockedAt: "2024-09-20T16:45:00Z",
      rarity: "epic",
    },
    {
      id: "ach-005",
      title: "Early Adopter",
      description: "Among the first 100 users on the platform",
      icon: "🌟",
      unlockedAt: "2024-07-10T10:00:00Z",
      rarity: "legendary",
    },
  ],
}

export const mockUserSettings: UserSettings = {
  notifications: {
    emailNotifications: true,
    walletNotifications: true,
    heartbeatReminders: true,
    vaultTriggerAlerts: true,
    beneficiaryUpdates: true,
    securityAlerts: true,
    marketingEmails: false,
  },
  security: {
    twoFactorEnabled: true,
    multiSigEnabled: false,
    sessionTimeout: 30,
    requirePasswordForActions: true,
    trustedDevices: [
      {
        id: "device-001",
        name: "Chrome on MacBook Pro",
        lastUsed: "2 hours ago",
        location: "Auto-detected",
      },
      {
        id: "device-002",
        name: "MetaMask Mobile",
        lastUsed: "1 day ago",
        location: "Auto-detected",
      },
    ],
  },
  privacy: {
    profileVisibility: "connections-only",
    showVaultCount: true,
    showAssetValues: false,
    allowSearch: true,
    dataSharing: false,
  },
  display: {
    theme: "dark",
    language: "en",
    timezone: "UTC-3",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",
  },
  web3: {
    defaultNetwork: 11142220, // Celo Sepolia Testnet
    gasPrice: "standard",
    autoApproveTransactions: false,
    showTransactionDetails: true,
    slippageTolerance: 0.5,
    transactionDeadline: 20,
  },
}

