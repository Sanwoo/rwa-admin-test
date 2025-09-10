import { useCallback } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { simulateContract, waitForTransactionReceipt } from '@wagmi/core'
import { config } from '@/wagmi'
import type { supportedChainIds } from '@/wagmi'
import type { Abi } from 'viem'
import marketAbi from '@/lib/abi/market.json'

export const useSell = () => {
  const { writeContractAsync } = useWriteContract()
  const { chainId } = useAccount()
  const currentChainId = chainId as (typeof supportedChainIds)[number]

  const sell = useCallback(
    async (marketContractAddress: `0x${string}`, amount: bigint, rwTokenAddress: `0x${string}`) => {
      const simulateData = await simulateContract(config, {
        address: marketContractAddress,
        abi: marketAbi as Abi,
        functionName: 'sell',
        args: [rwTokenAddress, amount, 0],
      })

      if (!simulateData) {
        throw new Error('Failed to simulate sell')
      }

      const tx = await writeContractAsync(simulateData.request)

      const receipt = await waitForTransactionReceipt(config, {
        hash: tx,
        chainId: currentChainId,
      })

      return { simulateData, receipt, tx }
    },
    [writeContractAsync, currentChainId],
  )

  return { sell }
}
