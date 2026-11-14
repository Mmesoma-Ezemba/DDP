"use client"

import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { MobileHeader } from "@/components/dashboard/mobile-header"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import Widget from "@/components/dashboard/widget"
import Notifications from "@/components/dashboard/notifications"
import { MobileChat } from "@/components/chat/mobile-chat"
import Chat from "@/components/chat"
import type { MockData } from "@/types/dashboard"
import { usePathname } from "next/navigation"

interface ClientLayoutProps {
  children: React.ReactNode
  mockData: MockData
}

/**
 * Client-side layout component that wraps the dashboard UI
 * This prevents SSR issues with Web3 hooks in the sidebar
 */
export function ClientLayout({ children, mockData }: ClientLayoutProps) {
  const pathname = usePathname()
  const isAuthRoute = pathname === "/login" || pathname === "/signup"

  if (isAuthRoute) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      {/* Mobile Header - only visible on mobile */}
      <MobileHeader mockData={mockData} />

      {/* Desktop Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-gap lg:px-sides">
        <div className="hidden lg:block col-span-2 top-0 relative">
          <DashboardSidebar />
        </div>
        <div className="col-span-1 lg:col-span-7 min-w-0 overflow-x-hidden">
          {children}
        </div>
        <div className="col-span-3 hidden lg:block">
          <div className="space-y-gap py-sides min-h-screen max-h-screen sticky top-0 overflow-clip">
            <Widget widgetData={mockData.widgetData} />
            <Notifications />
            <Chat />
          </div>
        </div>
      </div>

      {/* Mobile Chat - floating CTA with drawer */}
      <MobileChat />
    </SidebarProvider>
  )
}
