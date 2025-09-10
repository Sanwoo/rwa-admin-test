import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'viem'
import { bscTestnet, bsc } from 'wagmi/chains'
import { isProductionInVercel } from './lib/utils'
import { RPC_URLS } from './lib/constants'

const walletConnectProjectId = process.env.NEXT_PUBLIC_PROJECT_ID
if (!walletConnectProjectId) {
  throw new Error('Missing NEXT_PUBLIC_PROJECT_ID env')
}

export const config = getDefaultConfig({
  appName: 'InvestAdmin',
  projectId: walletConnectProjectId,
  chains: [bsc, ...(isProductionInVercel() ? [] : [bscTestnet])],
  ssr: true,
  transports: {
    [bsc.id]: http(RPC_URLS[bsc.id]),
    [bscTestnet.id]: http(RPC_URLS[bscTestnet.id]),
  },
})

export const supportedChainIds = isProductionInVercel() ? ([bsc.id] as const) : ([bsc.id, bscTestnet.id] as const)
