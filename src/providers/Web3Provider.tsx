'use client'

import type React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { config } from '../wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { useIsDarkMode } from '@/hooks/useMode'
import { isProductionInVercel } from '@/lib/utils'

const queryClient = new QueryClient()

const shadcnDarkTheme = darkTheme({
  accentColor: 'dark:accent',
  accentColorForeground: '#ffffff',
  borderRadius: 'large',
  fontStack: 'rounded',
  overlayBlur: 'none',
})

const shadcnLightTheme = lightTheme({
  accentColor: 'accent',
  accentColorForeground: '#0f172a',
  borderRadius: 'large',
  fontStack: 'rounded',
  overlayBlur: 'none',
})

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const isDarkMode = useIsDarkMode()

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale="en-US" initialChain={isProductionInVercel() ? bsc : bscTestnet} theme={isDarkMode ? shadcnDarkTheme : shadcnLightTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
