# Vault Encryption Setup Guide

## Overview

The Decentralized Death Protocol (DDP) uses **AES-256-GCM encryption** to secure vault payloads containing sensitive messages, files, and personal data. This guide explains how to configure and use the encryption system.

## Features

- **AES-256-GCM**: Industry-standard authenticated encryption
- **Base64 Key Format**: Easy to store and manage in environment variables
- **Authenticated Encryption**: Built-in integrity verification with auth tags
- **Hash Verification**: SHA-256 payload hashing for additional integrity checks
- **Cross-Platform**: Works in both browser (Web Crypto API) and Node.js environments
- **Key Rotation Support**: Version field enables future key rotation strategies

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vault Creation                           │
├─────────────────────────────────────────────────────────────────┤
│  1. User creates vault with messages, files, notes              │
│  2. System encrypts payload with AES-256-GCM                    │
│  3. Generate SHA-256 hash of encrypted data                     │
│  4. Store encrypted payload + hash in vault                     │
│  5. Original plaintext never stored                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         Vault Access                             │
├─────────────────────────────────────────────────────────────────┤
│  1. Retrieve encrypted payload from vault                       │
│  2. Verify payload hash for integrity                           │
│  3. Decrypt using AES-256-GCM with auth tag verification        │
│  4. Return decrypted content to authorized user                 │
└─────────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Generate an Encryption Key

Generate a secure 32-byte (256-bit) key and encode it as Base64:

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Using OpenSSL:**
```bash
openssl rand -base64 32
```

**Using the built-in utility:**
```typescript
import { generateEncryptionKey } from '@/lib/encryption/aes-256'
const key = generateEncryptionKey()
console.log(key)
```

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6==
```

### 2. Configure Environment Variables

Add the encryption key to your environment:

**Local Development (`.env.local`):**
```bash
# Required: Encryption key for vault payloads
NEXT_PUBLIC_ENCRYPTION_KEY=your-base64-key-here

# Optional: Server-side only key (not exposed to browser)
ENCRYPTION_KEY=your-server-side-key-here
```

**Vercel Production:**
```bash
# Add via Vercel dashboard or CLI
vercel env add NEXT_PUBLIC_ENCRYPTION_KEY production
vercel env add ENCRYPTION_KEY production
```

**Important Security Notes:**
- ⚠️ `NEXT_PUBLIC_*` variables are exposed to the browser
- 🔐 For maximum security, use server-side `ENCRYPTION_KEY` for sensitive operations
- 🔄 Store keys in secure secrets management (e.g., Vercel, AWS Secrets Manager)
- 📝 Never commit `.env.local` to version control
- 🔑 Keep backup copies of encryption keys in secure storage

### 3. Verify Configuration

Check if encryption is properly configured:

```typescript
import { isEncryptionAvailable } from '@/lib/encryption/vault-encryption'

if (isEncryptionAvailable()) {
  console.log('✅ Encryption is configured and ready')
} else {
  console.warn('⚠️ Encryption key not found - vaults will not be encrypted')
}
```

## Usage Examples

### Encrypting Vault Content

```typescript
import { createEncryptedVault } from '@/lib/encryption/vault-encryption'
import type { VaultPayloadContent, Vault } from '@/types/vault'

// 1. Prepare vault payload
const payloadContent: VaultPayloadContent = {
  messages: [
    {
      beneficiaryId: 'beneficiary-1',
      content: 'Your personal message here',
      subject: 'Important Message',
      timestamp: new Date().toISOString(),
    }
  ],
  files: [
    {
      id: 'file-1',
      name: 'document.pdf',
      url: 'ipfs://Qm...',
      mimeType: 'application/pdf',
      size: 1024000,
    }
  ],
  notes: 'Private notes visible only after decryption',
  metadata: {
    category: 'personal',
    priority: 'high',
  }
}

// 2. Create base vault
const baseVault: Omit<Vault, 'encryptedPayload' | 'payloadHash'> = {
  id: 'vault-123',
  name: 'My Secure Vault',
  status: 'draft',
  encryptionStatus: 'pending',
  // ... other vault properties
}

// 3. Encrypt and create vault
const encryptedVault = await createEncryptedVault(baseVault, payloadContent)

console.log('✅ Vault encrypted:', {
  id: encryptedVault.id,
  encryptionStatus: encryptedVault.encryptionStatus, // 'enabled'
  hasPayload: !!encryptedVault.encryptedPayload,
  hasHash: !!encryptedVault.payloadHash,
})
```

### Decrypting Vault Content

```typescript
import { getVaultContent } from '@/lib/encryption/vault-encryption'

// Decrypt vault content
const decryptedContent = await getVaultContent(vault)

if (decryptedContent) {
  console.log('Messages:', decryptedContent.messages)
  console.log('Files:', decryptedContent.files)
  console.log('Notes:', decryptedContent.notes)
} else {
  console.error('Failed to decrypt vault content')
}
```

### Updating Vault Content

```typescript
import { updateVaultContent } from '@/lib/encryption/vault-encryption'

// Update with new content
const updatedPayload: VaultPayloadContent = {
  messages: [
    // ... new messages
  ],
  notes: 'Updated notes',
}

const updatedVault = await updateVaultContent(vault, updatedPayload)
```

### Manual Encryption/Decryption

For advanced use cases, use the low-level API:

```typescript
import {
  encryptVaultContent,
  decryptVaultContent,
  generatePayloadHash,
  verifyPayloadHash,
} from '@/lib/encryption/vault-encryption'

// Encrypt
const encrypted = await encryptVaultContent(payloadContent, customKey)

// Generate hash for integrity
const hash = await generatePayloadHash(encrypted)

// Later, verify and decrypt
const isValid = await verifyPayloadHash(encrypted, hash)
if (isValid) {
  const decrypted = await decryptVaultContent(encrypted, customKey)
}
```

## Data Structure

### VaultPayloadContent (Plaintext)

```typescript
interface VaultPayloadContent {
  messages?: Array<{
    beneficiaryId: string
    content: string
    subject?: string
    timestamp?: string
  }>
  files?: Array<{
    id: string
    name: string
    url: string      // IPFS or Supabase Storage URL
    mimeType: string
    size: number
    uploadedAt?: string
  }>
  notes?: string
  metadata?: Record<string, any>
}
```

### EncryptedVaultPayload (Encrypted)

```typescript
interface EncryptedVaultPayload {
  ciphertext: string    // Base64-encoded encrypted data
  iv: string            // Base64-encoded initialization vector (12 bytes)
  authTag: string       // Base64-encoded authentication tag (16 bytes)
  algorithm: 'aes-256-gcm'
  version: number       // For key rotation support
  encryptedAt: string   // ISO 8601 timestamp
}
```

### Vault with Encryption

```typescript
interface Vault {
  // ... standard vault fields
  encryptionStatus: 'enabled' | 'pending' | 'disabled'
  encryptedPayload?: EncryptedVaultPayload
  payloadHash?: string  // SHA-256 hash for integrity
}
```

## Security Considerations

### Key Management

1. **Production Keys**
   - Use strong, randomly generated 32-byte keys
   - Store in secure secrets management systems
   - Rotate keys periodically (implement version support)
   - Never hardcode keys in source code

2. **Access Control**
   - Limit who can access encryption keys
   - Use server-side keys for sensitive operations
   - Implement role-based access control

3. **Backup Strategy**
   - Store key backups in multiple secure locations
   - Use hardware security modules (HSM) for production
   - Document key recovery procedures

### Encryption Best Practices

1. **Algorithm Choice**
   - AES-256-GCM provides authenticated encryption
   - Unique IV (initialization vector) for each encryption
   - Built-in authentication prevents tampering

2. **Data Integrity**
   - SHA-256 hashes verify payload integrity
   - GCM auth tags ensure encryption authenticity
   - Check both before decryption

3. **Error Handling**
   - Never expose decryption errors to users
   - Log security events for monitoring
   - Implement rate limiting on decrypt attempts

### Compliance

- **GDPR**: Encryption provides data protection
- **SOC 2**: Meets encryption at rest requirements
- **HIPAA**: Suitable for healthcare data (if properly implemented)
- **PCI DSS**: Meets encryption standards for sensitive data

## Troubleshooting

### Issue: "Encryption key not available"

**Cause**: Environment variable not set or invalid format.

**Solution:**
```bash
# Check if key is set
echo $NEXT_PUBLIC_ENCRYPTION_KEY

# Generate new key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Add to .env.local
echo "NEXT_PUBLIC_ENCRYPTION_KEY=your-key-here" >> .env.local

# Restart dev server
npm run dev
```

### Issue: "Invalid encryption key: must be Base64-encoded 32 bytes"

**Cause**: Key is wrong length or not Base64 encoded.

**Solution:**
- Ensure key is exactly 32 bytes (44 characters in Base64)
- Verify Base64 encoding (no special characters except +, /, =)
- Generate new key using provided methods

### Issue: Decryption fails with authentication error

**Cause**: Data tampered with or wrong key used.

**Solution:**
- Verify you're using the same key that encrypted the data
- Check payload hash for integrity
- Ensure data wasn't corrupted in storage/transmission

### Issue: Browser crypto not available

**Cause**: Running in non-secure context (HTTP instead of HTTPS).

**Solution:**
- Use HTTPS in production (required for Web Crypto API)
- For local dev, use localhost (treated as secure)
- Fallback to Node.js crypto in server components

## Testing

### Generate Sample Encrypted Data

```bash
# Run sample data generator
npx ts-node lib/encryption/generate-sample-data.ts
```

This generates:
- Sample encrypted payloads
- Corresponding payload hashes
- Test encryption key
- Usage examples

### Unit Tests

```typescript
import { describe, it, expect } from '@jest/globals'
import { encryptVaultContent, decryptVaultContent } from '@/lib/encryption/vault-encryption'

describe('Vault Encryption', () => {
  it('should encrypt and decrypt successfully', async () => {
    const payload = {
      messages: [{ beneficiaryId: '1', content: 'Test message' }],
      notes: 'Test notes',
    }
    
    const encrypted = await encryptVaultContent(payload, testKey)
    const decrypted = await decryptVaultContent(encrypted, testKey)
    
    expect(decrypted).toEqual(payload)
  })
  
  it('should fail with wrong key', async () => {
    const encrypted = await encryptVaultContent(payload, key1)
    
    await expect(
      decryptVaultContent(encrypted, key2)
    ).rejects.toThrow()
  })
})
```

## Migration Guide

### Adding Encryption to Existing Vaults

```typescript
import { updateVaultContent } from '@/lib/encryption/vault-encryption'

// For each existing vault
for (const vault of existingVaults) {
  if (vault.encryptionStatus !== 'enabled') {
    // Extract plaintext data
    const payload: VaultPayloadContent = {
      messages: extractMessages(vault),
      files: extractFiles(vault),
      notes: vault.notes,
    }
    
    // Encrypt and update
    const encryptedVault = await updateVaultContent(vault, payload)
    
    // Save to database
    await saveVault(encryptedVault)
  }
}
```

## API Reference

See inline documentation in:
- `/lib/encryption/aes-256.ts` - Core encryption functions
- `/lib/encryption/vault-encryption.ts` - Vault-specific utilities
- `/lib/encryption/generate-sample-data.ts` - Sample data generator

## Support

For issues or questions:
1. Check this documentation
2. Review inline code documentation
3. See sample implementations in `/lib/encryption/`
4. Consult security team for production deployments

## Future Enhancements

- [ ] Multi-key encryption for different beneficiaries
- [ ] Key rotation with automatic re-encryption
- [ ] Hardware security module (HSM) integration
- [ ] Threshold encryption (Shamir's Secret Sharing)
- [ ] Time-locked encryption keys
- [ ] Quantum-resistant encryption algorithms
