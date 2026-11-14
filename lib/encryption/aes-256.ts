/**
 * AES-256-GCM Encryption Utilities
 * 
 * Provides secure encryption/decryption for vault payloads using:
 * - AES-256-GCM algorithm (Galois/Counter Mode for authenticated encryption)
 * - 32-byte (256-bit) Base64-encoded encryption keys
 * - Random initialization vectors (IV) for each encryption
 * - Authentication tags for data integrity verification
 * 
 * Based on PRD Section 5.2: Encrypted Data Storage
 */

/**
 * Encryption result containing ciphertext, IV, and auth tag
 */
export interface EncryptedData {
  /** Base64-encoded encrypted data */
  ciphertext: string
  /** Base64-encoded initialization vector (12 bytes for GCM) */
  iv: string
  /** Base64-encoded authentication tag (16 bytes) */
  authTag: string
  /** Algorithm used (for future compatibility) */
  algorithm: 'aes-256-gcm'
  /** Version for future key rotation support */
  version: number
}

/**
 * Vault payload that will be encrypted
 */
export interface VaultPayload {
  /** Personal messages to beneficiaries */
  messages?: Array<{
    beneficiaryId: string
    content: string
    subject?: string
  }>
  /** File references (IPFS/Supabase Storage) */
  files?: Array<{
    id: string
    name: string
    url: string
    mimeType: string
    size: number
  }>
  /** Private notes or instructions */
  notes?: string
  /** Additional metadata */
  metadata?: Record<string, any>
}

/**
 * Generate a random 32-byte encryption key and return as Base64
 * This should be stored securely (environment variables, secrets manager)
 * 
 * @returns Base64-encoded 32-byte key
 */
export function generateEncryptionKey(): string {
  if (typeof window !== 'undefined') {
    // Browser environment
    const key = new Uint8Array(32)
    crypto.getRandomValues(key)
    return Buffer.from(key).toString('base64')
  } else {
    // Node.js environment
    const crypto = require('crypto')
    return crypto.randomBytes(32).toString('base64')
  }
}

/**
 * Validate encryption key format and length
 * 
 * @param key - Base64-encoded key string
 * @returns true if valid, false otherwise
 */
export function isValidEncryptionKey(key: string): boolean {
  try {
    const decoded = Buffer.from(key, 'base64')
    return decoded.length === 32
  } catch {
    return false
  }
}

/**
 * Encrypt vault payload using AES-256-GCM
 * 
 * @param payload - Vault payload object to encrypt
 * @param encryptionKey - Base64-encoded 32-byte key
 * @returns Encrypted data with IV and auth tag
 * @throws Error if encryption fails or key is invalid
 */
export async function encryptVaultPayload(
  payload: VaultPayload,
  encryptionKey: string
): Promise<EncryptedData> {
  if (!isValidEncryptionKey(encryptionKey)) {
    throw new Error('Invalid encryption key: must be Base64-encoded 32 bytes')
  }

  // Convert payload to JSON string
  const plaintext = JSON.stringify(payload)
  
  if (typeof window !== 'undefined') {
    // Browser environment using Web Crypto API
    return encryptInBrowser(plaintext, encryptionKey)
  } else {
    // Node.js environment
    return encryptInNode(plaintext, encryptionKey)
  }
}

/**
 * Decrypt vault payload using AES-256-GCM
 * 
 * @param encryptedData - Encrypted data object
 * @param encryptionKey - Base64-encoded 32-byte key
 * @returns Decrypted vault payload
 * @throws Error if decryption fails or authentication fails
 */
export async function decryptVaultPayload(
  encryptedData: EncryptedData,
  encryptionKey: string
): Promise<VaultPayload> {
  if (!isValidEncryptionKey(encryptionKey)) {
    throw new Error('Invalid encryption key: must be Base64-encoded 32 bytes')
  }

  if (encryptedData.algorithm !== 'aes-256-gcm') {
    throw new Error(`Unsupported algorithm: ${encryptedData.algorithm}`)
  }

  let plaintext: string
  
  if (typeof window !== 'undefined') {
    // Browser environment using Web Crypto API
    plaintext = await decryptInBrowser(encryptedData, encryptionKey)
  } else {
    // Node.js environment
    plaintext = decryptInNode(encryptedData, encryptionKey)
  }

  return JSON.parse(plaintext) as VaultPayload
}

/**
 * Encrypt data in browser using Web Crypto API
 */
async function encryptInBrowser(
  plaintext: string,
  encryptionKey: string
): Promise<EncryptedData> {
  // Decode Base64 key
  const keyBytes = Uint8Array.from(Buffer.from(encryptionKey, 'base64'))
  
  // Import key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )
  
  // Generate random IV (12 bytes is optimal for GCM)
  const iv = new Uint8Array(12)
  crypto.getRandomValues(iv)
  
  // Encrypt
  const encoder = new TextEncoder()
  const plaintextBytes = encoder.encode(plaintext)
  
  const ciphertextWithTag = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    cryptoKey,
    plaintextBytes
  )
  
  // Split ciphertext and auth tag (last 16 bytes)
  const ciphertextBytes = new Uint8Array(ciphertextWithTag)
  const authTagStart = ciphertextBytes.length - 16
  const ciphertext = ciphertextBytes.slice(0, authTagStart)
  const authTag = ciphertextBytes.slice(authTagStart)
  
  return {
    ciphertext: Buffer.from(ciphertext).toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
    authTag: Buffer.from(authTag).toString('base64'),
    algorithm: 'aes-256-gcm',
    version: 1,
  }
}

/**
 * Decrypt data in browser using Web Crypto API
 */
async function decryptInBrowser(
  encryptedData: EncryptedData,
  encryptionKey: string
): Promise<string> {
  // Decode Base64 values
  const keyBytes = Uint8Array.from(Buffer.from(encryptionKey, 'base64'))
  const ciphertext = Uint8Array.from(Buffer.from(encryptedData.ciphertext, 'base64'))
  const iv = Uint8Array.from(Buffer.from(encryptedData.iv, 'base64'))
  const authTag = Uint8Array.from(Buffer.from(encryptedData.authTag, 'base64'))
  
  // Combine ciphertext and auth tag for Web Crypto API
  const ciphertextWithTag = new Uint8Array(ciphertext.length + authTag.length)
  ciphertextWithTag.set(ciphertext)
  ciphertextWithTag.set(authTag, ciphertext.length)
  
  // Import key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )
  
  // Decrypt
  const plaintextBytes = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    cryptoKey,
    ciphertextWithTag
  )
  
  const decoder = new TextDecoder()
  return decoder.decode(plaintextBytes)
}

/**
 * Encrypt data in Node.js using crypto module
 */
function encryptInNode(
  plaintext: string,
  encryptionKey: string
): EncryptedData {
  const crypto = require('crypto')
  
  // Decode Base64 key
  const key = Buffer.from(encryptionKey, 'base64')
  
  // Generate random IV (12 bytes for GCM)
  const iv = crypto.randomBytes(12)
  
  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  
  // Encrypt
  let ciphertext = cipher.update(plaintext, 'utf8', 'base64')
  ciphertext += cipher.final('base64')
  
  // Get auth tag
  const authTag = cipher.getAuthTag().toString('base64')
  
  return {
    ciphertext,
    iv: iv.toString('base64'),
    authTag,
    algorithm: 'aes-256-gcm',
    version: 1,
  }
}

/**
 * Decrypt data in Node.js using crypto module
 */
function decryptInNode(
  encryptedData: EncryptedData,
  encryptionKey: string
): string {
  const crypto = require('crypto')
  
  // Decode Base64 values
  const key = Buffer.from(encryptionKey, 'base64')
  const iv = Buffer.from(encryptedData.iv, 'base64')
  const authTag = Buffer.from(encryptedData.authTag, 'base64')
  
  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  
  // Decrypt
  let plaintext = decipher.update(encryptedData.ciphertext, 'base64', 'utf8')
  plaintext += decipher.final('utf8')
  
  return plaintext
}

/**
 * Get encryption key from environment variables
 * 
 * @returns Base64-encoded encryption key or null if not configured
 */
export function getEncryptionKeyFromEnv(): string | null {
  const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY
  
  if (!key) {
    console.warn('Encryption key not found in environment variables')
    return null
  }
  
  if (!isValidEncryptionKey(key)) {
    console.error('Invalid encryption key format in environment variables')
    return null
  }
  
  return key
}

/**
 * Check if encryption is available (key is configured)
 */
export function isEncryptionAvailable(): boolean {
  return getEncryptionKeyFromEnv() !== null
}
