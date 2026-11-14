export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  status: ActivityStatus;
  vaultId?: string;
  beneficiaryId?: string;
  metadata?: ActivityMetadata;
}

export type ActivityType =
  | "heartbeat"
  | "vault_created"
  | "vault_updated"
  | "beneficiary_added"
  | "beneficiary_updated"
  | "asset_added"
  | "encryption_verified"
  | "contract_deployed"
  | "notification_sent"
  | "login"
  | "warning"

export type ActivityStatus = "success" | "warning" | "error" | "info"

export interface ActivityMetadata {
  walletAddress?: string;
  transactionHash?: string;
  gasUsed?: string;
  value?: string;
  [key: string]: string | undefined;
}

export interface HeartbeatData {
  timestamp: string;
  value: number;
  status: "active" | "warning" | "critical";
}

export interface InactivityPeriod {
  startDate: string;
  endDate?: string;
  durationDays: number;
  status: "ongoing" | "resolved";
  vaultsAffected: string[];
}

export interface ActivityStats {
  totalActivities: number;
  lastHeartbeat: string;
  daysSinceActive: number;
  heartbeatsThisWeek: number;
  inactivityWarnings: number;
  nextTrigger?: {
    vaultId: string;
    vaultName: string;
    daysRemaining: number;
  };
}

