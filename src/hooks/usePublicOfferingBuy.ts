import { config } from '@/wagmi'
import type { supportedChainIds } from '@/wagmi'
import { useCallback } from 'react'
import type { Abi } from 'viem'
import { simulateContract, waitForTransactionReceipt } from '@wagmi/core'
import glaAbi from '@/lib/abi/gla.json'
import { useAccount, useWriteContract } from 'wagmi'

export const usePublicOfferingBuy = () => {
  const { writeContractAsync } = useWriteContract()
  const { chainId } = useAccount()
  const currentChainId = chainId as (typeof supportedChainIds)[number]

  const publicOfferingBuy = useCallback(
    async (amount: bigint, glaContractAddress: `0x${string}`) => {
      const simulateData = await simulateContract(config, {
        address: glaContractAddress,
        abi: glaAbi as Abi,
        functionName: 'publicOfferingBuy',
        args: [amount],
      })

      if (!simulateData) {
        throw new Error('Failed to simulate publicOfferingBuy')
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

  return { publicOfferingBuy }
}
