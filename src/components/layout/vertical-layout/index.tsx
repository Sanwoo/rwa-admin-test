import type { ReactNode } from 'react'

import { Sidebar } from '../Sidebar'
import { VerticalLayoutHeader } from './VerticalLayoutHeader'

export function VerticalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="w-full">
        <VerticalLayoutHeader />
        <main className="min-h-[calc(100svh-6.82rem)] bg-muted/40">{children}</main>
      </div>
    </>
  )
}
