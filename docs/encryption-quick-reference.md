# Vault Encryption - Quick Reference

## 🚀 Quick Start

### 1. Setup (One-time)

```bash
# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Add to .env.local
NEXT_PUBLIC_ENCRYPTION_KEY=your-generated-key-here
```

### 2. Import

```typescript
import { createEncryptedVault, getVaultContent } from '@/lib/encryption'
```

### 3. Encrypt Vault

```typescript
const encryptedVault = await createEncryptedVault(
  baseVault,
  {
    messages: [{ beneficiaryId: '1', content: 'Your message' }],
    notes: 'Private notes',
  }
)
```

### 4. Decrypt Vault

```typescript
const content = await getVaultContent(vault)
console.log(content.messages)
```

## 📦 Available Functions

### High-Level API (Recommended)

| Function | Purpose | Returns |
|----------|---------|---------|
| `createEncryptedVault()` | Create new vault with encrypted payload | `Promise<Vault>` |
| `getVaultContent()` | Safely decrypt vault content | `Promise<VaultPayloadContent \| null>` |
| `updateVaultContent()` | Update vault with new encrypted content | `Promise<Vault>` |
| `encryptVaultContent()` | Encrypt payload content | `Promise<EncryptedVaultPayload>` |
| `decryptVaultContent()` | Decrypt payload | `Promise<VaultPayloadContent>` |
| `isEncryptionAvailable()` | Check if encryption is configured | `boolean` |
| `generateEncryptionKey()` | Generate new 32-byte key | `string` |

### Low-Level API (Advanced)

| Function | Purpose |
|----------|---------|
| `generatePayloadHash()` | Create SHA-256 hash of encrypted payload |
| `verifyPayloadHash()` | Verify payload integrity |
| `encryptVaultPayload()` | Direct AES-256 encryption |
| `decryptVaultPayload()` | Direct AES-256 decryption |
| `isValidEncryptionKey()` | Validate key format |

## 🔐 Security Checklist

- [ ] Generated strong 32-byte key
- [ ] Added `NEXT_PUBLIC_ENCRYPTION_KEY` to `.env.local`
- [ ] Added encryption key to production environment (Vercel/AWS)
- [ ] `.env.local` is in `.gitignore`
- [ ] Backed up encryption keys securely
- [ ] Tested encryption/decryption flow
- [ ] Verified hash integrity checks
- [ ] Reviewed security best practices in main docs

## 🎯 Common Patterns

### Pattern 1: Create Vault with Message

```typescript
const vault = await createEncryptedVault(baseVault, {
  messages: [{
    beneficiaryId: beneficiary.id,
    content: userMessage,
    subject: 'Important Message',
    timestamp: new Date().toISOString(),
  }]
})
```

### Pattern 2: Add File Reference

```typescript
const vault = await createEncryptedVault(baseVault, {
  files: [{
    id: 'file-1',
    name: 'document.pdf',
    url: 'ipfs://Qm...',
    mimeType: 'application/pdf',
    size: 1024000,
    uploadedAt: new Date().toISOString(),
  }]
})
```

### Pattern 3: Update Existing Vault

```typescript
const updatedVault = await updateVaultContent(existingVault, {
  messages: [...existingMessages, newMessage],
  notes: 'Updated notes',
})
```

### Pattern 4: Check Encryption Status

```typescript
if (isEncryptionAvailable()) {
  // Encryption is configured
  const encrypted = await createEncryptedVault(...)
} else {
  // Handle missing encryption key
  console.warn('Encryption not available')
}
```

### Pattern 5: Safe Decryption

```typescript
const content = await getVaultContent(vault)
if (content) {
  // Successfully decrypted
  displayMessages(content.messages)
} else {
  // Decryption failed
  showError('Unable to decrypt vault')
}
```

## 🐛 Common Issues

### "Encryption key not available"
- Check `.env.local` has `NEXT_PUBLIC_ENCRYPTION_KEY`
- Restart dev server after adding env variable
- Verify key is valid Base64

### "Invalid encryption key format"
- Key must be exactly 32 bytes (44 Base64 characters)
- Generate new key with provided command
- Check for extra spaces or line breaks

### Decryption fails
- Ensure same key used for encryption/decryption
- Verify payload wasn't modified
- Check payload hash integrity

### Browser crypto not available
- Use HTTPS in production (required)
- localhost is OK for development
- Check browser compatibility

## 📚 Type Definitions

### VaultPayloadContent

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
    url: string
    mimeType: string
    size: number
    uploadedAt?: string
  }>
  notes?: string
  metadata?: Record<string, any>
}
```

### EncryptedVaultPayload

```typescript
interface EncryptedVaultPayload {
  ciphertext: string
  iv: string
  authTag: string
  algorithm: 'aes-256-gcm'
  version: number
  encryptedAt: string
}
```

## 🔗 Resources

- **Full Documentation**: `/docs/vault-encryption-setup.md`
- **Implementation**: `/lib/encryption/`
- **Types**: `/types/vault.ts`
- **Example Usage**: `/lib/encryption/generate-sample-data.ts`

## 💡 Pro Tips

1. **Always check encryption availability** before creating vaults
2. **Verify payload hash** before decrypting for security
3. **Use high-level API** unless you need fine-grained control
4. **Store keys securely** in production secrets managers
5. **Test encryption flow** in development before deploying
6. **Plan for key rotation** using version field
7. **Never log decrypted content** in production
8. **Implement proper error handling** for decrypt failures

## 🎓 Examples in Codebase

See these files for working examples:
- `/app/vaults/page.tsx` - Vault creation with encryption
- `/lib/encryption/generate-sample-data.ts` - Sample data generation
- `/lib/encryption/vault-encryption.ts` - API implementation
