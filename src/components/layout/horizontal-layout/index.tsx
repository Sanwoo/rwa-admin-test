import type { ReactNode } from 'react'

import { Sidebar } from '../Sidebar'
import { HorizontalLayoutHeader } from './HorizontalLayoutHeader'

export function HorizontalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="w-full">
        <HorizontalLayoutHeader />
        <main className="min-h-[calc(100svh-9.85rem)] bg-muted/40">{children}</main>
      </div>
    </>
  )
}
