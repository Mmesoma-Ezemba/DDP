export interface Vault {
  id: string;
  name: string;
  status: "active" | "pending" | "triggered" | "draft";
  createdAt: string;
  lastActivity: string;
  inactivityThreshold: number; // in days
  daysUntilTrigger: number;
  beneficiaries: Beneficiary[];
  assets: VaultAsset[];
  encryptionStatus: "enabled" | "pending" | "disabled";
  contractAddress?: string;
  messagePreview?: string;
  /** Encrypted vault payload containing messages, files, and private data */
  encryptedPayload?: EncryptedVaultPayload;
  /** Hash of the encrypted payload for integrity verification */
  payloadHash?: string;
}

/**
 * Encrypted vault payload structure
 * Contains the encrypted data and metadata for decryption
 */
export interface EncryptedVaultPayload {
  /** Base64-encoded encrypted data */
  ciphertext: string;
  /** Base64-encoded initialization vector */
  iv: string;
  /** Base64-encoded authentication tag */
  authTag: string;
  /** Encryption algorithm used */
  algorithm: 'aes-256-gcm';
  /** Version for key rotation support */
  version: number;
  /** Timestamp when encrypted */
  encryptedAt: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  walletAddress: string;
  relationship?: string;
  avatar?: string;
  isPrimary?: boolean;
}

export interface VaultAsset {
  id: string;
  type: "eth" | "nft" | "erc20" | "message" | "file";
  name: string;
  value?: string;
  amount?: number;
  icon?: string;
  contractAddress?: string;
  /** For message/file assets, indicates if content is encrypted */
  isEncrypted?: boolean;
}

/**
 * Decrypted vault payload content
 * This is what gets encrypted and stored in encryptedPayload
 */
export interface VaultPayloadContent {
  /** Personal messages to beneficiaries */
  messages?: Array<{
    beneficiaryId: string;
    content: string;
    subject?: string;
    timestamp?: string;
  }>;
  /** File references (IPFS/Supabase Storage) */
  files?: Array<{
    id: string;
    name: string;
    url: string;
    mimeType: string;
    size: number;
    uploadedAt?: string;
  }>;
  /** Private notes or instructions */
  notes?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export type VaultStatus = "active" | "pending" | "triggered" | "draft";

