import { config } from '@/wagmi'
import { useCallback } from 'react'
import type { Abi } from 'viem'
import { simulateContract, waitForTransactionReceipt } from '@wagmi/core'
import { useWriteContract } from 'wagmi'
import { useAccount } from 'wagmi'
import type { supportedChainIds } from '@/wagmi'
import marketAbi from '@/lib/abi/market.json'
import { getWEUSDAddress } from '@/lib/utils'

export const useBuy = () => {
  const { writeContractAsync } = useWriteContract()
  const { chainId } = useAccount()
  const currentChainId = chainId as (typeof supportedChainIds)[number]

  const WEUSD_ADDRESS = getWEUSDAddress()

  const buy = useCallback(
    async (marketContractAddress: `0x${string}`, amount: bigint) => {
      const simulateData = await simulateContract(config, {
        address: marketContractAddress,
        abi: marketAbi as Abi,
        functionName: 'buy',
        args: [WEUSD_ADDRESS, amount, 0],
      })

      if (!simulateData) {
        throw new Error('Failed to simulate buy')
      }

      const tx = await writeContractAsync(simulateData.request)

      const receipt = await waitForTransactionReceipt(config, {
        hash: tx,
        chainId: currentChainId,
      })

      return { simulateData, receipt, tx }
    },
    [writeContractAsync, currentChainId, WEUSD_ADDRESS],
  )

  return { buy }
}
