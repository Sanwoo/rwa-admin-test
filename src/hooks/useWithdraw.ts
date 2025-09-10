import { simulateContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useWriteContract } from 'wagmi'
import type { supportedChainIds } from '@/wagmi'
import { config } from '@/wagmi'
import { useCallback } from 'react'
import type { Abi } from 'viem'
import glaAbi from '@/lib/abi/gla.json'

export const useWithdraw = () => {
  const { writeContractAsync } = useWriteContract()
  const { chainId } = useAccount()
  const currentChainId = chainId as (typeof supportedChainIds)[number]

  const withdraw = useCallback(
    async (glaContractAddress: `0x${string}`) => {
      const simulateData = await simulateContract(config, {
        address: glaContractAddress,
        abi: glaAbi as Abi,
        functionName: 'withdraw',
      })

      if (!simulateData) {
        throw new Error('Failed to simulate withdraw')
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

  return { withdraw }
}
