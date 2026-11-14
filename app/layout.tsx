import type React from "react"
import { Roboto_Mono } from "next/font/google"
import "./globals.css"
import "../styles/globals.css"
import type { Metadata } from "next"
import { V0Provider } from "@/lib/v0-context"
import { ThirdwebWeb3Provider } from "@/lib/thirdweb-provider"
import { PollarProviderWrapper } from "@/lib/pollar-provider"
import localFont from "next/font/local"
import { ClientLayout } from "@/components/dashboard/client-layout"
import mockDataJson from "@/mock.json"
import type { MockData } from "@/types/dashboard"
import { Toaster } from "sonner"

const mockData = mockDataJson as MockData

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
})

const rebelGrotesk = localFont({
  src: "../public/fonts/Rebels-Fett.woff2",
  variable: "--font-rebels",
  display: "swap",
})

const isV0 = process.env["VERCEL_URL"]?.includes("vusercontent.net") ?? false

// Force dynamic rendering for all routes to prevent SSR issues with Web3 hooks
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
  ),
  title: {
    template: "%s – DDP",
    default: "DDP",
  },
  description: "Decentralized Death Protocol - Secure digital legacy management.",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${rebelGrotesk.variable} ${robotoMono.variable} antialiased`} suppressHydrationWarning>
        <V0Provider isV0={isV0}>
          <ThirdwebWeb3Provider>
            <PollarProviderWrapper>
              <ClientLayout mockData={mockData}>
                {children}
              </ClientLayout>
            </PollarProviderWrapper>
          </ThirdwebWeb3Provider>
        </V0Provider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
