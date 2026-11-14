"use server"

import { verifyMessage } from "viem"

/**
 * Verify wallet signature and authenticate user
 * This is called from the API route
 */
export async function verifyWalletSignature(
  walletAddress: string,
  signature: string,
  message: string
): Promise<boolean> {
  try {
    const isValid = await verifyMessage({
      address: walletAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    })

    return isValid
  } catch (error) {
    console.error("Error verifying signature:", error)
    return false
  }
}

