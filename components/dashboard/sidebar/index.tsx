"use client"

import type * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import AtomIcon from "@/components/icons/atom"
import BracketsIcon from "@/components/icons/brackets"
import ProcessorIcon from "@/components/icons/proccesor"
import CuteRobotIcon from "@/components/icons/cute-robot"
import EmailIcon from "@/components/icons/email"
import GearIcon from "@/components/icons/gear"
import MonkeyIcon from "@/components/icons/monkey"
import DotsVerticalIcon from "@/components/icons/dots-vertical"
import { Bullet } from "@/components/ui/bullet"
import LockIcon from "@/components/icons/lock"
import UserIcon from "@/components/icons/user"
import SettingsIcon from "@/components/icons/settings"
import Image from "next/image"
import { useIsV0 } from "@/lib/v0-context"
import { signOut } from "@/lib/auth/wallet-auth"
import { useWeb3 } from "@/lib/web3-context"
import { toast } from "sonner"
import { useEffect, useState } from "react"

const navMain = [
  {
    title: "Navigation",
    items: [
      {
        title: "Overview",
        url: "/",
        icon: BracketsIcon,
        isActive: true,
      },
      {
        title: "My Vaults",
        url: "/vaults",
        icon: AtomIcon,
        isActive: false,
      },
      {
        title: "Beneficiary",
        url: "/beneficiary",
        icon: ProcessorIcon,
        isActive: false,
      },
      {
        title: "Activity Tracker",
        url: "/activity",
        icon: CuteRobotIcon,
        isActive: false,
      },
      {
        title: "Simulate Demo",
        url: "/demo",
        icon: EmailIcon,
        isActive: false,
      },
      {
        title: "Claim Vault (Pollar)",
        url: "/claim",
        icon: LockIcon,
        isActive: false,
      },
    ],
  },
]

const desktop = {
  title: "Desktop (Online)",
  status: "online",
}

const defaultUser = {
  name: "USER",
  email: "",
  avatar: "/placeholder.svg",
}

export function DashboardSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const isV0 = useIsV0()
  const pathname = usePathname()
  const router = useRouter()
  const { disconnectWallet, wallet } = useWeb3()
  const [user, setUser] = useState(defaultUser)

  // Fetch real user data
  useEffect(() => {
    if (!wallet.address) {
      return
    }

    setUser({
      name: wallet.address.slice(0, 8).toUpperCase(),
      email: "ddp_user@vault.network",
      avatar: "/placeholder-user.jpg",
    })
  }, [wallet.address])

  const handleLogout = async () => {
    try {
      await signOut()
      disconnectWallet()
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  return (
    <Sidebar {...props} className={cn("py-sides", className)}>
      <SidebarHeader className="rounded-t-lg flex gap-3 flex-row rounded-b-none">
        <div className="flex overflow-clip size-12 shrink-0 items-center justify-center rounded bg-sidebar-primary-foreground/10 transition-colors group-hover:bg-sidebar-primary text-sidebar-primary-foreground">
          <MonkeyIcon className="size-10 group-hover:scale-[1.7] origin-top-left transition-transform" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="text-2xl font-display">DDP</span>
          <span className="text-xs uppercase">Decentralized Death Protocol</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navMain.map((group, i) => (
          <SidebarGroup className={cn(i === 0 && "rounded-t-none")} key={group.title}>
            <SidebarGroupLabel>
              <Bullet className="mr-2" />
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <SidebarMenuItem
                      key={item.title}
                      className={cn(item.locked && "opacity-50")}
                      data-disabled={item.locked}
                    >
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        disabled={item.locked}
                        className={cn("cursor-pointer")}
                      >
                        {item.locked ? (
                          <div className="flex items-center gap-3 w-full">
                            <item.icon className="size-5" />
                            <span>{item.title}</span>
                          </div>
                        ) : (
                          <Link href={item.url} className="flex items-center gap-3 w-full">
                            <item.icon className="size-5" />
                            <span>{item.title}</span>
                          </Link>
                        )}
                      </SidebarMenuButton>
                      {item.locked && (
                        <SidebarMenuBadge>
                          <LockIcon className="size-5 block" />
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-0">
        <SidebarGroup>
          <SidebarGroupLabel>
            <Bullet className="mr-2" />
            User
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Popover>
                  <PopoverTrigger className="flex gap-0.5 w-full group cursor-pointer">
                    <div className="shrink-0 flex size-14 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-clip">
                      <Image
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                        width={120}
                        height={120}
                      />
                    </div>
                    <div className="group/item pl-3 pr-1.5 pt-2 pb-1.5 flex-1 flex bg-sidebar-accent hover:bg-sidebar-accent-active/75 items-center rounded group-data-[state=open]:bg-sidebar-accent-active group-data-[state=open]:hover:bg-sidebar-accent-active group-data-[state=open]:text-sidebar-accent-foreground">
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate text-xl font-display">{user.name}</span>
                        <span className="truncate text-xs uppercase opacity-50 group-hover/item:opacity-100">
                          {user.email || wallet.address ? `${wallet.address?.slice(0, 6)}...${wallet.address?.slice(-4)}` : ""}
                        </span>
                      </div>
                      <DotsVerticalIcon className="ml-auto size-4" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" side="bottom" align="end" sideOffset={4}>
                    <div className="flex flex-col">
                      <a href="/profile" className="flex items-center px-4 py-2 text-sm hover:bg-accent">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profile
                      </a>
                      <a href="/settings" className="flex items-center px-4 py-2 text-sm hover:bg-accent">
                        <GearIcon className="mr-2 h-4 w-4" />
                        Settings
                      </a>
                      <div className="border-t border-border my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm hover:bg-destructive/10 text-destructive hover:text-destructive w-full text-left"
                      >
                        <span className="mr-2">🚪</span>
                        Logout
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
