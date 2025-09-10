import { useCallback } from 'react'
import { simulateContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useWriteContract } from 'wagmi'
import { config } from '@/wagmi'
import glaAbi from '@/lib/abi/gla.json'
import type { supportedChainIds } from '@/wagmi'
import type { Abi } from 'viem'

export const useInitialize = () => {
  const { writeContractAsync } = useWriteContract()
  const { chainId } = useAccount()
  const currentChainId = chainId as (typeof supportedChainIds)[number]

  const initialize = useCallback(
    async (glaContractAddress: `0x${string}`) => {
      const simulateData = await simulateContract(config, {
        address: glaContractAddress,
        abi: glaAbi as Abi,
        functionName: 'initialize',
      })

      if (!simulateData) {
        throw new Error('Failed to simulate initialize')
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

  return { initialize }
}
