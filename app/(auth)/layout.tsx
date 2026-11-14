import type React from "react"
import { Roboto_Mono } from "next/font/google"
import "../globals.css"
import type { Metadata } from "next"
import { V0Provider } from "@/lib/v0-context"
import { ThirdwebWeb3Provider } from "@/lib/thirdweb-provider"
import localFont from "next/font/local"
import { Toaster } from "sonner"

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
})

const rebelGrotesk = localFont({
  src: "../../public/fonts/Rebels-Fett.woff2",
  variable: "--font-rebels",
  display: "swap",
})

const isV0 = process.env["VERCEL_URL"]?.includes("vusercontent.net") ?? false

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
  ),
  title: {
    template: "%s – DDP",
    default: "DDP - Authentication",
  },
  description: "Decentralized Death Protocol - Secure digital legacy management.",
}

/**
 * Auth Layout - Standalone layout for authentication pages
 * No dashboard sidebar, widgets, or chat
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <V0Provider isV0={isV0}>
      <ThirdwebWeb3Provider>
        {/* Auth pages render full-screen without dashboard layout */}
        {children}
      </ThirdwebWeb3Provider>
    </V0Provider>
  )
}

