import type { LocaleType } from '@/types'
import type { ReactNode } from 'react'

import { SettingsProvider } from '@/contexts/SettingsContext'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ModeProvider } from './ModeProvider'
import { ThemeProvider } from './ThemeProvider'
import { Web3Provider } from './Web3Provider'

export function Providers({
  locale,
  children,
}: Readonly<{
  locale: LocaleType
  children: ReactNode
}>) {
  return (
    <SettingsProvider locale={locale}>
      <ModeProvider>
        <ThemeProvider>
          <Web3Provider>
            <SidebarProvider>{children}</SidebarProvider>
          </Web3Provider>
        </ThemeProvider>
      </ModeProvider>
    </SettingsProvider>
  )
}
