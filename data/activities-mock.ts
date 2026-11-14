import type { Activity, ActivityStats, HeartbeatData, InactivityPeriod } from "@/types/activity"

export const mockActivities: Activity[] = [
  {
    id: "act-001",
    type: "heartbeat",
    title: "Heartbeat Signal Detected",
    description: "Automatic activity ping from wallet interaction",
    timestamp: "2024-11-06T10:30:00Z",
    status: "success",
    metadata: {
      walletAddress: "0x8b4e2f9a1c3d5e7f",
    },
  },
  {
    id: "act-002",
    type: "vault_updated",
    title: "Vault Configuration Updated",
    description: "Modified beneficiary settings for Primary Legacy Vault",
    timestamp: "2024-11-06T09:15:00Z",
    status: "success",
    vaultId: "0x8b4e2f9a1c3d5e7f",
    metadata: {
      transactionHash: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8",
    },
  },
  {
    id: "act-003",
    type: "encryption_verified",
    title: "Encryption Status Verified",
    description: "AES-256 encryption confirmed for all vault data",
    timestamp: "2024-11-06T08:45:00Z",
    status: "success",
  },
  {
    id: "act-004",
    type: "login",
    title: "Wallet Connected",
    description: "Authenticated via MetaMask from new device",
    timestamp: "2024-11-06T08:00:00Z",
    status: "info",
    metadata: {
      walletAddress: "0x8b4e2f9a1c3d5e7f",
    },
  },
  {
    id: "act-005",
    type: "beneficiary_added",
    title: "Beneficiary Added",
    description: "Alice Harper added as primary beneficiary",
    timestamp: "2024-11-05T16:30:00Z",
    status: "success",
    beneficiaryId: "ben-001",
  },
  {
    id: "act-006",
    type: "heartbeat",
    title: "Heartbeat Signal Detected",
    description: "Automatic activity ping from wallet interaction",
    timestamp: "2024-11-05T14:20:00Z",
    status: "success",
  },
  {
    id: "act-007",
    type: "vault_created",
    title: "New Vault Created",
    description: "Primary Legacy Vault initialized with 4 assets",
    timestamp: "2024-11-05T10:00:00Z",
    status: "success",
    vaultId: "0x8b4e2f9a1c3d5e7f",
    metadata: {
      transactionHash: "0x853f4b93Cc7654D1433a3c844Bc9e7595f0bEa7",
      gasUsed: "0.0023 ETH",
    },
  },
  {
    id: "act-008",
    type: "warning",
    title: "Inactivity Warning",
    description: "No activity detected for 5 days - vault trigger in 85 days",
    timestamp: "2024-11-01T12:00:00Z",
    status: "warning",
    vaultId: "0x8b4e2f9a1c3d5e7f",
  },
  {
    id: "act-009",
    type: "contract_deployed",
    title: "Smart Contract Deployed",
    description: "Vault contract deployed on Polygon mainnet",
    timestamp: "2024-10-28T15:45:00Z",
    status: "success",
    metadata: {
      transactionHash: "0x964g5c04Dd8765E2544b4d955Cd0f8696g1cFb9",
      gasUsed: "0.0045 ETH",
    },
  },
  {
    id: "act-010",
    type: "asset_added",
    title: "Assets Added to Vault",
    description: "2.4 ETH and 3 NFTs secured in vault",
    timestamp: "2024-10-28T14:30:00Z",
    status: "success",
    vaultId: "0x8b4e2f9a1c3d5e7f",
  },
]

export const mockHeartbeatData: HeartbeatData[] = [
  { timestamp: "2024-11-06T10:00", value: 95, status: "active" },
  { timestamp: "2024-11-06T09:00", value: 92, status: "active" },
  { timestamp: "2024-11-06T08:00", value: 88, status: "active" },
  { timestamp: "2024-11-05T16:00", value: 85, status: "active" },
  { timestamp: "2024-11-05T14:00", value: 90, status: "active" },
  { timestamp: "2024-11-05T10:00", value: 94, status: "active" },
  { timestamp: "2024-11-04T15:00", value: 78, status: "warning" },
  { timestamp: "2024-11-04T12:00", value: 82, status: "active" },
  { timestamp: "2024-11-03T18:00", value: 88, status: "active" },
  { timestamp: "2024-11-03T14:00", value: 91, status: "active" },
  { timestamp: "2024-11-02T16:00", value: 45, status: "warning" },
  { timestamp: "2024-11-02T10:00", value: 52, status: "warning" },
]

export const mockInactivityPeriods: InactivityPeriod[] = [
  {
    startDate: "2024-10-15T00:00:00Z",
    endDate: "2024-10-20T12:30:00Z",
    durationDays: 5,
    status: "resolved",
    vaultsAffected: ["0x8b4e2f9a1c3d5e7f"],
  },
  {
    startDate: "2024-09-10T00:00:00Z",
    endDate: "2024-09-13T08:15:00Z",
    durationDays: 3,
    status: "resolved",
    vaultsAffected: ["0x8b4e2f9a1c3d5e7f", "0x9c5f3g2b4d6e8f0a"],
  },
]

export const mockActivityStats: ActivityStats = {
  totalActivities: 127,
  lastHeartbeat: "2 hours ago",
  daysSinceActive: 0,
  heartbeatsThisWeek: 12,
  inactivityWarnings: 1,
  nextTrigger: {
    vaultId: "0x8b4e2f9a1c3d5e7f",
    vaultName: "Primary Legacy Vault",
    daysRemaining: 88,
  },
}

