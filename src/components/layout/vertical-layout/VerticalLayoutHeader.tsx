'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { FullscreenToggle } from '@/components/layout/FullScreenToggle'
import { ModeDropdown } from '@/components/layout/ModeDropdown'
import { UserDropdown } from '@/components/layout/UserDropdown'
import { ToggleMobileSidebar } from '../ToggleMobileSidebar'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function VerticalLayoutHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-sidebar-border">
      <div className="container flex h-14 justify-between items-center gap-4">
        <ToggleMobileSidebar />
        <div className="grow flex justify-end gap-2">
          <SidebarTrigger className="hidden lg:flex lg:me-auto" />
          <ConnectButton showBalance={false} chainStatus="full" accountStatus="address" />
          <FullscreenToggle />
          <ModeDropdown />
          <UserDropdown />
        </div>
      </div>
    </header>
  )
}
