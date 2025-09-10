import { useCallback } from 'react'
import type { Abi } from 'viem'
import { simulateContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useWriteContract } from 'wagmi'
import type { supportedChainIds } from '@/wagmi'
import { config } from '@/wagmi'
import glaAbi from '@/lib/abi/gla.json'
import { isAddress } from 'viem'

export const useAddWhitelist = () => {
  const { writeContractAsync } = useWriteContract()
  const { chainId } = useAccount()
  const currentChainId = chainId as (typeof supportedChainIds)[number]

  const addWhitelist = useCallback(
    async (users: `0x${string}`[], glaContractAddress: `0x${string}`) => {
      // Validate input parameters
      if (!users || users.length === 0) {
        throw new Error('Users array cannot be empty')
      }

      if (!glaContractAddress || !isAddress(glaContractAddress)) {
        throw new Error('GLA contract address is required')
      }

      // Validate address format
      users.forEach((user, index) => {
        if (!user || !isAddress(user)) {
          throw new Error(`Invalid address at index ${index}: ${user}`)
        }
      })

      // Simulate contract call
      const simulateData = await simulateContract(config, {
        address: glaContractAddress,
        abi: glaAbi as Abi,
        functionName: 'addWhitelist',
        args: [users],
      })

      if (!simulateData) {
        throw new Error('Failed to simulate addWhitelist')
      }

      // Execute contract write
      const tx = await writeContractAsync(simulateData.request)

      // Wait for transaction confirmation
      const receipt = await waitForTransactionReceipt(config, {
        hash: tx,
        chainId: currentChainId,
      })

      return { simulateData, receipt, tx }
    },
    [writeContractAsync, currentChainId],
  )

  return { addWhitelist }
}
