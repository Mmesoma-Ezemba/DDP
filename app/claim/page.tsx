"use client"

import { useState } from "react"
import { usePollarAuth } from "@/lib/pollar-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bullet } from "@/components/ui/bullet"
import { toast } from "sonner"

export default function ClaimPage() {
  const { isAuthenticated, user, login, logout, isLoading } = usePollarAuth()
  const [isClaimed, setIsClaimed] = useState(false)
  const [decryptedMessage, setDecryptedMessage] = useState<string | null>(null)

  const handleClaim = () => {
    setIsClaimed(true)
    setDecryptedMessage(
      "\"My dearest family, if you are reading this, know that I loved you endlessly. I prepared this vault so you are taken care of. The digital assets (2.5 CELO, 500 USDC) have been automatically routed to your Pollar abstraction wallet. Stay strong together.\""
    )
    toast.success("Assets and secret legacy message decrypted and claimed!")
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl min-h-[85vh] flex flex-col justify-center">
      <div className="text-center mb-8">
        <Badge variant="outline" className="mb-3 border-primary/50 text-primary uppercase font-mono">
          Pollar Protocol Powered Beneficiary Portal
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-display uppercase tracking-wider text-foreground">
          Inheritance Claim Center
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
          No seed phrases. No gas fees. Zero blockchain knowledge required. Sign in with Google to receive your digital legacy.
        </p>
      </div>

      {!isAuthenticated ? (
        <Card className="p-8 max-w-md mx-auto text-center border-2 border-primary/20 bg-background/90 backdrop-blur">
          <div className="size-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 text-2xl">
            🎁
          </div>
          <h2 className="text-xl font-display uppercase mb-2">Claim Your Bequest</h2>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            A secure digital vault has reached its inactivity unlock trigger. Sign in with your registered Google account to open your vault.
          </p>

          <Button
            type="button"
            className="w-full py-6 flex items-center justify-center gap-3 font-semibold uppercase text-xs tracking-wider"
            disabled={isLoading}
            onClick={() => login({ provider: "google" })}
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoading ? "Generating Pollar Wallet..." : "Log In with Google"}</span>
          </Button>

          <p className="text-[10px] text-muted-foreground/80 mt-4">
            Secured by Pollar Non-Custodial Account Abstraction.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-6 border-2 border-primary/30 bg-primary/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Bullet />
                  <span className="font-mono text-xs uppercase text-primary">Authenticated via Pollar Protocol</span>
                </div>
                <h3 className="text-lg font-bold mt-1 text-foreground">{user?.email}</h3>
                <p className="font-mono text-xs text-muted-foreground">Smart Wallet: {user?.address}</p>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="text-xs uppercase font-mono">
                Disconnect
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-2 border-chart-1/40 bg-card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Badge className="bg-success/20 text-success border-success/40 mb-2">TRIGGER EXECUTED</Badge>
                <h2 className="text-2xl font-display uppercase text-foreground">Family Legacy & Trust Vault</h2>
                <p className="text-xs text-muted-foreground">Original Owner: 0x71C...b942 (Inactivity period verified &gt; 90 days)</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-mono font-bold text-primary">$3,250.00</span>
                <p className="text-[10px] text-muted-foreground uppercase font-mono">Total Allotted Value</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <span className="text-xs text-muted-foreground uppercase font-mono">Enclosed Assets</span>
                <ul className="text-sm mt-2 space-y-1 font-mono">
                  <li>• 2.50 CELO ($1.85)</li>
                  <li>• 500.00 USDC</li>
                  <li>• 1x Family Memories Memorial NFT</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <span className="text-xs text-muted-foreground uppercase font-mono">Encrypted Data</span>
                <p className="text-xs mt-2 text-muted-foreground">
                  Contains 1 private final message and 2 estate document attachments secured by AES-256-GCM.
                </p>
              </div>
            </div>

            {!isClaimed ? (
              <Button
                onClick={handleClaim}
                className="w-full py-6 text-sm uppercase tracking-wider font-semibold bg-gradient-to-r from-primary to-chart-1 hover:opacity-90"
              >
                🔓 Decrypt & Claim Assets to Pollar Wallet
              </Button>
            ) : (
              <div className="p-5 rounded-lg border-2 border-success/40 bg-success/10 space-y-3">
                <div className="flex items-center gap-2 text-success font-semibold text-sm">
                  <span>✓</span>
                  <span>Assets Transferred & Key Unlocked</span>
                </div>
                <div className="p-4 bg-background/80 rounded border border-border text-sm italic text-foreground leading-relaxed">
                  {decryptedMessage}
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Tx Hash: 0x9b3a...14f2 (Celo Testnet via Pollar Sponsored Gas)
                </p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

