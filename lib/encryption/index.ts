/**
 * Vault Encryption Module
 * 
 * Provides AES-256-GCM encryption for vault payloads
 * 
 * @module lib/encryption
 */

// Main vault encryption API (recommended)
export {
  createEncryptedVault,
  encryptVaultContent,
  decryptVaultContent,
  getVaultContent,
  updateVaultContent,
  generatePayloadHash,
  verifyPayloadHash,
  isEncryptionAvailable,
  getEncryptionKeyFromEnv,
  generateEncryptionKey,
} from './vault-encryption'

// Low-level AES-256 utilities (advanced usage)
export {
  encryptVaultPayload,
  decryptVaultPayload,
  isValidEncryptionKey,
  type EncryptedData,
  type VaultPayload,
} from './aes-256'

// Types
export type {
  VaultPayloadContent,
  EncryptedVaultPayload,
} from '@/types/vault'
