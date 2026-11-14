export interface Beneficiary {
  id: string;
  name: string;
  walletAddress: string;
  email?: string;
  relationship: string;
  avatar?: string;
  isPrimary: boolean;
  status: "active" | "pending" | "suspended";
  addedDate: string;
  lastVerified?: string;
  linkedVaults: LinkedVault[];
  accessLevel: "full" | "partial" | "view-only";
  notificationPreference: "email" | "wallet" | "both";
  encryptionKey?: string;
}

export interface LinkedVault {
  vaultId: string;
  vaultName: string;
  assetCount: number;
  estimatedValue?: string;
}

export type BeneficiaryStatus = "active" | "pending" | "suspended";
export type AccessLevel = "full" | "partial" | "view-only";

