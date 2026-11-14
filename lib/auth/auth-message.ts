/**
 * Generate authentication message for wallet signing
 * This is a shared utility function used on both client and server
 * 
 * IMPORTANT: Message must be IDENTICAL between signing and verification.
 * Do not include dynamic values like timestamps that change between calls.
 * The nonce already provides uniqueness and prevents replay attacks.
 */
export function generateAuthMessage(walletAddress: string, nonce: string): string {
  return `Sign this message to authenticate with DDP (Decentralized Death Protocol).

Wallet: ${walletAddress}
Nonce: ${nonce}

This signature proves you own this wallet and will be used to authenticate your account.`
}

