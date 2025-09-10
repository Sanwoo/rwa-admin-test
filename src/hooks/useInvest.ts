import { useCallback } from 'react'
import type { Abi } from 'viem'
import { simulateContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useWriteContract } from 'wagmi'
import type { supportedChainIds } from '@/wagmi'
import { config } from '@/wagmi'
import helperAbi from '@/lib/abi/helper.json'

export const useInvest = () => {
  const { writeContractAsync } = useWriteContract()
  const { chainId } = useAccount()
  const currentChainId = chainId as (typeof supportedChainIds)[number]

  const invest = useCallback(
    async (projectId: string, amount: string, factoryAddress: `0x${string}`) => {
      const simulateData = await simulateContract(config, {
        address: factoryAddress as `0x${string}`,
        abi: helperAbi as Abi,
        functionName: 'invest',
        args: [projectId, amount],
      })

      if (!simulateData) {
        throw new Error('Failed to simulate invest')
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

  return { invest }
}
