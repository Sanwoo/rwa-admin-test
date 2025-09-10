import { useCallback } from 'react'
import type { Abi } from 'viem'
import { simulateContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useWriteContract } from 'wagmi'
import type { supportedChainIds } from '@/wagmi'
import { config } from '@/wagmi'
import glaAbi from '@/lib/abi/gla.json'
import { isAddress } from 'viem'

export const useWhitelistBuy = () => {
  const { writeContractAsync } = useWriteContract()
  const { chainId } = useAccount()
  const currentChainId = chainId as (typeof supportedChainIds)[number]

  const whitelistBuy = useCallback(
    async (amount: bigint, glaContractAddress: `0x${string}`) => {
      if (!glaContractAddress || !isAddress(glaContractAddress)) {
        throw new Error('Invalid GLA contract address')
      }

      // validate amount format and size
      if (amount <= BigInt(0)) {
        throw new Error('Amount must be greater than 0')
      }

      // simulate contract call
      const simulateData = await simulateContract(config, {
        address: glaContractAddress,
        abi: glaAbi as Abi,
        functionName: 'whitelistBuy',
        args: [amount],
      })

      if (!simulateData) {
        throw new Error('Failed to simulate whitelistBuy')
      }

      // execute contract write
      const tx = await writeContractAsync(simulateData.request)

      // wait for transaction confirmation
      const receipt = await waitForTransactionReceipt(config, {
        hash: tx,
        chainId: currentChainId,
      })

      return { simulateData, receipt, tx }
    },
    [writeContractAsync, currentChainId],
  )

  return { whitelistBuy }
}
