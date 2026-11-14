/**
 * Vault Encryption Service
 * 
 * High-level service for encrypting and decrypting vault payloads
 * Integrates with vault types and provides easy-to-use API
 */

import {
  encryptVaultPayload as encryptPayload,
  decryptVaultPayload as decryptPayload,
  generateEncryptionKey,
  getEncryptionKeyFromEnv,
  isEncryptionAvailable,
  type VaultPayload,
  type EncryptedData,
} from './aes-256'
import type { Vault, VaultPayloadContent, EncryptedVaultPayload } from '@/types/vault'

/**
 * Encrypt vault payload content and return formatted structure
 * 
 * @param payloadContent - Vault payload to encrypt
 * @param encryptionKey - Optional encryption key (uses env if not provided)
 * @returns Encrypted vault payload ready to store in vault
 * @throws Error if encryption key not available or encryption fails
 */
export async function encryptVaultContent(
  payloadContent: VaultPayloadContent,
  encryptionKey?: string
): Promise<EncryptedVaultPayload> {
  const key = encryptionKey || getEncryptionKeyFromEnv()
  
  if (!key) {
    throw new Error('Encryption key not available. Please configure NEXT_PUBLIC_ENCRYPTION_KEY.')
  }

  // Convert to internal format
  const vaultPayload: VaultPayload = {
    messages: payloadContent.messages,
    files: payloadContent.files,
    notes: payloadContent.notes,
    metadata: payloadContent.metadata,
  }

  // Encrypt
  const encrypted = await encryptPayload(vaultPayload, key)

  // Return formatted structure matching Vault type
  return {
    ciphertext: encrypted.ciphertext,
    iv: encrypted.iv,
    authTag: encrypted.authTag,
    algorithm: encrypted.algorithm,
    version: encrypted.version,
    encryptedAt: new Date().toISOString(),
  }
}

/**
 * Decrypt vault payload
 * 
 * @param encryptedPayload - Encrypted payload from vault
 * @param encryptionKey - Optional encryption key (uses env if not provided)
 * @returns Decrypted vault payload content
 * @throws Error if encryption key not available or decryption fails
 */
export async function decryptVaultContent(
  encryptedPayload: EncryptedVaultPayload,
  encryptionKey?: string
): Promise<VaultPayloadContent> {
  const key = encryptionKey || getEncryptionKeyFromEnv()
  
  if (!key) {
    throw new Error('Encryption key not available. Please configure NEXT_PUBLIC_ENCRYPTION_KEY.')
  }

  // Convert to internal format
  const encryptedData: EncryptedData = {
    ciphertext: encryptedPayload.ciphertext,
    iv: encryptedPayload.iv,
    authTag: encryptedPayload.authTag,
    algorithm: encryptedPayload.algorithm,
    version: encryptedPayload.version,
  }

  // Decrypt
  const decrypted = await decryptPayload(encryptedData, key)

  // Return as VaultPayloadContent
  return {
    messages: decrypted.messages,
    files: decrypted.files,
    notes: decrypted.notes,
    metadata: decrypted.metadata,
  }
}

/**
 * Generate payload hash for integrity verification
 * Uses SHA-256 to create a hash of the encrypted payload
 * 
 * @param encryptedPayload - Encrypted payload to hash
 * @returns Base64-encoded SHA-256 hash
 */
export async function generatePayloadHash(
  encryptedPayload: EncryptedVaultPayload
): Promise<string> {
  const data = JSON.stringify({
    ciphertext: encryptedPayload.ciphertext,
    iv: encryptedPayload.iv,
    authTag: encryptedPayload.authTag,
  })

  if (typeof window !== 'undefined') {
    // Browser environment
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    return Buffer.from(hashBuffer).toString('base64')
  } else {
    // Node.js environment
    const crypto = require('crypto')
    const hash = crypto.createHash('sha256')
    hash.update(data)
    return hash.digest('base64')
  }
}

/**
 * Verify payload hash integrity
 * 
 * @param encryptedPayload - Encrypted payload
 * @param expectedHash - Expected hash value
 * @returns true if hash matches, false otherwise
 */
export async function verifyPayloadHash(
  encryptedPayload: EncryptedVaultPayload,
  expectedHash: string
): Promise<boolean> {
  const actualHash = await generatePayloadHash(encryptedPayload)
  return actualHash === expectedHash
}

/**
 * Create an encrypted vault with payload
 * Helper function that encrypts payload and updates vault object
 * 
 * @param vault - Vault object (without encrypted payload)
 * @param payloadContent - Content to encrypt
 * @param encryptionKey - Optional encryption key
 * @returns Updated vault with encrypted payload
 */
export async function createEncryptedVault(
  vault: Omit<Vault, 'encryptedPayload' | 'payloadHash'>,
  payloadContent: VaultPayloadContent,
  encryptionKey?: string
): Promise<Vault> {
  // Encrypt payload
  const encryptedPayload = await encryptVaultContent(payloadContent, encryptionKey)
  
  // Generate hash
  const payloadHash = await generatePayloadHash(encryptedPayload)

  // Return updated vault
  return {
    ...vault,
    encryptionStatus: 'enabled',
    encryptedPayload,
    payloadHash,
  }
}

/**
 * Get decrypted vault payload safely
 * Returns null if decryption fails or payload doesn't exist
 * 
 * @param vault - Vault with encrypted payload
 * @param encryptionKey - Optional encryption key
 * @returns Decrypted content or null
 */
export async function getVaultContent(
  vault: Vault,
  encryptionKey?: string
): Promise<VaultPayloadContent | null> {
  if (!vault.encryptedPayload) {
    return null
  }

  try {
    // Verify hash if available
    if (vault.payloadHash) {
      const isValid = await verifyPayloadHash(vault.encryptedPayload, vault.payloadHash)
      if (!isValid) {
        console.error('Payload hash verification failed for vault:', vault.id)
        throw new Error('Payload integrity verification failed')
      }
    }

    return await decryptVaultContent(vault.encryptedPayload, encryptionKey)
  } catch (error) {
    console.error('Failed to decrypt vault content:', error)
    return null
  }
}

/**
 * Update vault with new encrypted content
 * 
 * @param vault - Existing vault
 * @param payloadContent - New content to encrypt
 * @param encryptionKey - Optional encryption key
 * @returns Updated vault with new encrypted payload
 */
export async function updateVaultContent(
  vault: Vault,
  payloadContent: VaultPayloadContent,
  encryptionKey?: string
): Promise<Vault> {
  // Encrypt new payload
  const encryptedPayload = await encryptVaultContent(payloadContent, encryptionKey)
  
  // Generate new hash
  const payloadHash = await generatePayloadHash(encryptedPayload)

  return {
    ...vault,
    encryptionStatus: 'enabled',
    encryptedPayload,
    payloadHash,
    lastActivity: 'Just now',
  }
}

// Re-export utilities
export {
  generateEncryptionKey,
  isEncryptionAvailable,
  getEncryptionKeyFromEnv,
}
