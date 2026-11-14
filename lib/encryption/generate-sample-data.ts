/**
 * Sample Data Generator for Encrypted Vaults
 * 
 * Run this script to generate sample encrypted vault payloads for testing
 * Usage: node -r ts-node/register lib/encryption/generate-sample-data.ts
 */

import { encryptVaultContent, generatePayloadHash } from './vault-encryption'
import { generateEncryptionKey } from './aes-256'
import type { VaultPayloadContent } from '@/types/vault'

/**
 * Sample vault payloads for testing
 */
const samplePayloads: Record<string, VaultPayloadContent> = {
  'primary-legacy': {
    messages: [
      {
        beneficiaryId: '1',
        content: 'Dear Alice, this vault contains my most important digital assets and personal messages. Please ensure that Bob receives his share and that you handle everything according to my wishes. I love you both very much.',
        subject: 'To My Beloved Wife',
        timestamp: new Date('2024-07-10T10:30:00Z').toISOString(),
      },
      {
        beneficiaryId: '2',
        content: 'Bob, always remember to be kind, work hard, and make the most of the opportunities life gives you. These assets are to help you build your future. Love, Dad.',
        subject: 'To My Son',
        timestamp: new Date('2024-07-10T10:35:00Z').toISOString(),
      },
    ],
    notes: 'Primary vault - contains main family assets and personal farewell messages. Review annually and update beneficiary allocations as needed.',
    metadata: {
      totalValue: '7.4 ETH + NFTs + Tokens',
      lastReviewDate: '2024-11-01',
      priority: 'high',
    },
  },
  
  'business-assets': {
    messages: [
      {
        beneficiaryId: '3',
        content: 'Carol, here are all the company credentials and access keys. The business continuity plan is in the attached files. Please work with our lawyer to execute the succession plan.',
        subject: 'Business Transfer Instructions',
        timestamp: new Date('2024-06-15T14:20:00Z').toISOString(),
      },
    ],
    files: [
      {
        id: 'file-1',
        name: 'Business_Continuity_Plan.pdf',
        url: 'ipfs://QmX...abc123',
        mimeType: 'application/pdf',
        size: 2457600,
        uploadedAt: new Date('2024-06-15T14:00:00Z').toISOString(),
      },
      {
        id: 'file-2',
        name: 'Private_Keys_Master.enc',
        url: 'ipfs://QmY...def456',
        mimeType: 'application/octet-stream',
        size: 4096,
        uploadedAt: new Date('2024-06-15T14:05:00Z').toISOString(),
      },
    ],
    notes: 'Business vault - Critical for company operations. Contact Smith & Associates Law Firm (555-0123) for guidance.',
    metadata: {
      businessName: 'TechCorp Industries',
      incorporationState: 'Delaware',
      ein: 'XX-XXXXXXX',
    },
  },
  
  'emergency-backup': {
    messages: [
      {
        beneficiaryId: '4',
        content: 'David, if you are reading this, something has happened. Please use the recovery instructions to access my other vaults. Trust no one else with this information.',
        subject: 'Emergency Access Instructions',
        timestamp: new Date('2024-11-01T09:15:00Z').toISOString(),
      },
    ],
    files: [
      {
        id: 'file-3',
        name: 'Recovery_Seeds_Encrypted.txt',
        url: 'ipfs://QmZ...ghi789',
        mimeType: 'text/plain',
        size: 1024,
        uploadedAt: new Date('2024-11-01T09:00:00Z').toISOString(),
      },
    ],
    notes: 'Emergency recovery vault - Contains master recovery seeds encrypted with additional passphrase. Beneficiary must know the family password.',
    metadata: {
      securityLevel: 'maximum',
      requiresAdditionalAuth: true,
    },
  },
  
  'nft-collection': {
    messages: [
      {
        beneficiaryId: '5',
        content: 'Eva, my NFT collection represents years of careful curation. I hope you enjoy and preserve these digital artworks. Some have significant value, so consult with a crypto art expert before making any decisions.',
        subject: 'My NFT Collection',
        timestamp: new Date('2024-05-20T16:45:00Z').toISOString(),
      },
    ],
    notes: 'NFT vault - Contains curated collection of digital art and collectibles. Estimated value: 15+ ETH. Consider long-term holding.',
    metadata: {
      collectionCount: 4,
      rareItems: ['CryptoPunk #1234', 'Bored Ape #5678'],
      estimatedValue: '15.5 ETH',
    },
  },
}

/**
 * Generate encrypted samples
 */
export async function generateEncryptedSamples(encryptionKey?: string) {
  const key = encryptionKey || generateEncryptionKey()
  
  console.log('🔐 Generating encrypted vault samples...\n')
  console.log('Encryption Key:', key)
  console.log('\n' + '='.repeat(80) + '\n')

  const results: Record<string, any> = {}

  for (const [vaultId, payload] of Object.entries(samplePayloads)) {
    console.log(`\n📦 Vault: ${vaultId}`)
    console.log('-'.repeat(80))
    
    try {
      const encrypted = await encryptVaultContent(payload, key)
      const hash = await generatePayloadHash(encrypted)
      
      results[vaultId] = {
        encryptedPayload: encrypted,
        payloadHash: hash,
      }
      
      console.log('✅ Encrypted successfully')
      console.log(`   Ciphertext length: ${encrypted.ciphertext.length} chars`)
      console.log(`   IV: ${encrypted.iv.substring(0, 20)}...`)
      console.log(`   Auth Tag: ${encrypted.authTag.substring(0, 20)}...`)
      console.log(`   Hash: ${hash.substring(0, 32)}...`)
    } catch (error) {
      console.error(`❌ Failed to encrypt ${vaultId}:`, error)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('\n✨ Sample generation complete!')
  console.log('\n💡 To use these samples:')
  console.log('   1. Set NEXT_PUBLIC_ENCRYPTION_KEY in your .env.local')
  console.log('   2. Use the encrypted payloads in your mock data')
  console.log('   3. Call decryptVaultContent() to retrieve original data')
  
  return { key, results }
}

/**
 * Example: How to use in code
 */
export const usageExample = `
// 1. Encrypt vault content
import { encryptVaultContent } from '@/lib/encryption/vault-encryption'

const payload: VaultPayloadContent = {
  messages: [{
    beneficiaryId: "1",
    content: "Your personal message here",
    subject: "Important Message"
  }],
  notes: "Private notes"
}

const encrypted = await encryptVaultContent(payload)

// 2. Store in vault
const vault: Vault = {
  // ... other vault fields
  encryptedPayload: encrypted,
  payloadHash: await generatePayloadHash(encrypted),
  encryptionStatus: "enabled"
}

// 3. Later, decrypt when needed
import { decryptVaultContent } from '@/lib/encryption/vault-encryption'

const decrypted = await decryptVaultContent(vault.encryptedPayload!)
console.log(decrypted.messages) // Access original messages
`

// Run if executed directly
if (require.main === module) {
  generateEncryptedSamples()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error:', error)
      process.exit(1)
    })
}
