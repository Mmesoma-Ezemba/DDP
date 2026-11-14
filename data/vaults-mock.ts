import type { Vault } from "@/types/vault"

export const mockVaults: Vault[] = [
  {
    id: "0x8b4e2f9a1c3d5e7f",
    name: "Primary Legacy Vault",
    status: "active",
    createdAt: "2024-07-10T10:30:00Z",
    lastActivity: "2 hours ago",
    inactivityThreshold: 90,
    daysUntilTrigger: 88,
    encryptionStatus: "enabled",
    contractAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8",
    messagePreview:
      "To my family: This vault contains my most important digital assets and personal messages...",
    beneficiaries: [
      {
        id: "1",
        name: "Alice Harper",
        walletAddress: "0x8b...4e2f",
        relationship: "Spouse",
        avatar: "/avatars/user_mati.png",
        isPrimary: true,
      },
      {
        id: "2",
        name: "Bob Harper",
        walletAddress: "0x9c...5f3g",
        relationship: "Child",
        avatar: "/avatars/user_pek.png",
      },
    ],
    assets: [
      {
        id: "1",
        type: "eth",
        name: "2.4 ETH",
        value: "2.4",
        amount: 2.4,
      },
      {
        id: "2",
        type: "nft",
        name: "CryptoPunk #1234",
        contractAddress: "0x...",
      },
      {
        id: "3",
        type: "erc20",
        name: "1000 USDC",
        value: "1000",
        amount: 1000,
      },
      {
        id: "4",
        type: "message",
        name: "Farewell Letter",
      },
    ],
  },
  {
    id: "0x9c5f3g2b4d6e8f0a",
    name: "Business Assets Vault",
    status: "active",
    createdAt: "2024-06-15T14:20:00Z",
    lastActivity: "1 day ago",
    inactivityThreshold: 60,
    daysUntilTrigger: 59,
    encryptionStatus: "enabled",
    contractAddress: "0x853f4b93Cc7654D1433a3c844Bc9e7595f0bEa7",
    messagePreview: "Important business credentials and access keys for the company...",
    beneficiaries: [
      {
        id: "3",
        name: "Carol Martinez",
        walletAddress: "0x7a...3d1e",
        relationship: "Business Partner",
        isPrimary: true,
      },
    ],
    assets: [
      {
        id: "5",
        type: "eth",
        name: "5.2 ETH",
        value: "5.2",
        amount: 5.2,
      },
      {
        id: "6",
        type: "file",
        name: "Private Keys & Credentials",
      },
      {
        id: "7",
        type: "erc20",
        name: "5000 DAI",
        value: "5000",
        amount: 5000,
      },
    ],
  },
  {
    id: "0x1a2b3c4d5e6f7g8h",
    name: "Emergency Backup Vault",
    status: "pending",
    createdAt: "2024-11-01T09:15:00Z",
    lastActivity: "5 min ago",
    inactivityThreshold: 180,
    daysUntilTrigger: 179,
    encryptionStatus: "pending",
    messagePreview: "Emergency access vault - contains backup keys and recovery information...",
    beneficiaries: [
      {
        id: "4",
        name: "David Chen",
        walletAddress: "0x6b...2c0d",
        relationship: "Trusted Friend",
        isPrimary: true,
      },
    ],
    assets: [
      {
        id: "8",
        type: "message",
        name: "Recovery Instructions",
      },
      {
        id: "9",
        type: "file",
        name: "Backup Seeds",
      },
    ],
  },
  {
    id: "0x2b3c4d5e6f7g8h9i",
    name: "NFT Collection Vault",
    status: "active",
    createdAt: "2024-05-20T16:45:00Z",
    lastActivity: "3 days ago",
    inactivityThreshold: 90,
    daysUntilTrigger: 87,
    encryptionStatus: "enabled",
    contractAddress: "0x964g5c04Dd8765E2544b4d955Cd0f8696g1cFb9",
    beneficiaries: [
      {
        id: "5",
        name: "Eva Rodriguez",
        walletAddress: "0x5a...1b9c",
        relationship: "Sibling",
      },
    ],
    assets: [
      {
        id: "10",
        type: "nft",
        name: "Bored Ape #5678",
      },
      {
        id: "11",
        type: "nft",
        name: "Azuki #2345",
      },
      {
        id: "12",
        type: "nft",
        name: "Doodles #9876",
      },
      {
        id: "13",
        type: "nft",
        name: "CloneX #4567",
      },
    ],
  },
  {
    id: "0x3c4d5e6f7g8h9i0j",
    name: "Personal Memories Vault",
    status: "draft",
    createdAt: "2024-11-05T11:00:00Z",
    lastActivity: "1 hour ago",
    inactivityThreshold: 90,
    daysUntilTrigger: 90,
    encryptionStatus: "disabled",
    beneficiaries: [],
    assets: [
      {
        id: "14",
        type: "file",
        name: "Family Photos Archive",
      },
      {
        id: "15",
        type: "message",
        name: "Life Story Document",
      },
    ],
  },
]

