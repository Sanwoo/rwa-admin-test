import { bsc, bscTestnet } from 'wagmi/chains'

export const WEUSD_DECIMALS = 6

export const MAX_BIGINT = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

export const COOKIE_EXPIRES_IN = 12 // 12 hours

export const RPC_URLS = {
  [bsc.id]: 'https://bsc-mainnet.core.chainstack.com/360680e73ebf81e94dbd4293045331c0',
  [bscTestnet.id]: 'https://bsc-testnet.core.chainstack.com/46f8aa12a60acee5e193623eb7b55de6',
}

export const CHAINS = {
  [bsc.id]: bsc,
  [bscTestnet.id]: bscTestnet,
}

export type Phase = 'Before Whitelist Phase' | 'Whitelist Phase' | 'Public Offering Phase' | 'Initialzing Phase' | 'Initialized Phase' | 'Unlock Phase'

export const PHASES = new Map<number, Phase>([
  [0, 'Before Whitelist Phase'],
  [1, 'Whitelist Phase'],
  [2, 'Public Offering Phase'],
  [3, 'Initialzing Phase'],
  [4, 'Initialized Phase'],
  [5, 'Unlock Phase'],
])
