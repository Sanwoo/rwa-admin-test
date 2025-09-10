"use client"

import { Separator } from "@/components/ui/separator"
import { BottomBarHeader } from "./BottomBarHeader"
import { TopBarHeader } from "./TopBarHeader"

export function HorizontalLayoutHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-sidebar-border">
      <TopBarHeader />
      <Separator className="hidden bg-sidebar-border h-[0.5px] md:block" />
      <BottomBarHeader />
    </header>
  )
}
