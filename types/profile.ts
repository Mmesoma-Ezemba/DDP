export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  walletAddress: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  joinedDate: string;
  lastActive: string;
  stats: ProfileStats;
  achievements: Achievement[];
}

export interface ProfileStats {
  vaultsCreated: number;
  beneficiariesAdded: number;
  totalAssetsSecured: string;
  daysSinceJoined: number;
  heartbeatsThisMonth: number;
  activitiesLogged: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface UserSettings {
  notifications: NotificationSettings;
  security: SecuritySettings;
  privacy: PrivacySettings;
  display: DisplaySettings;
  web3: Web3Settings;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  walletNotifications: boolean;
  heartbeatReminders: boolean;
  vaultTriggerAlerts: boolean;
  beneficiaryUpdates: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  multiSigEnabled: boolean;
  sessionTimeout: number; // in minutes
  requirePasswordForActions: boolean;
  trustedDevices: TrustedDevice[];
}

export interface TrustedDevice {
  id: string;
  name: string;
  lastUsed: string;
  location?: string;
}

export interface PrivacySettings {
  profileVisibility: "public" | "private" | "connections-only";
  showVaultCount: boolean;
  showAssetValues: boolean;
  allowSearch: boolean;
  dataSharing: boolean;
}

export interface DisplaySettings {
  theme: "dark" | "light" | "system";
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
}

export interface Web3Settings {
  defaultNetwork: number;
  gasPrice: "slow" | "standard" | "fast";
  autoApproveTransactions: boolean;
  showTransactionDetails: boolean;
  slippageTolerance: number; // percentage
  transactionDeadline: number; // minutes
}

