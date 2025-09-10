import { erc20Abi, isAddress } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'
import { waitForTransactionReceipt, simulateContract, readContract } from '@wagmi/core'
import { config } from '@/wagmi'
import { getWEUSDAddress } from '@/lib/utils'
import type { supportedChainIds } from '@/wagmi'
import { MAX_BIGINT } from '@/lib/constants'
import { useCallback } from 'react'

export const useWEUSDApprove = () => {
  const { chainId, address } = useAccount()
  const { writeContractAsync } = useWriteContract({ config })
  const WEUSDAddress = getWEUSDAddress()

  const approveWEUSD = useCallback(
    async (spenderAddress: `0x${string}`, amount: bigint) => {
      try {
        if (!address) {
          throw new Error('Wallet not connected')
        }

        if (!isAddress(WEUSDAddress as `0x${string}`)) {
          throw new Error('WEUSD address is invalid')
        }

        const currentChainId = chainId as (typeof supportedChainIds)[number]

        const currentAllowance = (await readContract(config, {
          address: WEUSDAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [address!, spenderAddress], // owner, spender
          chainId: currentChainId,
        })) as bigint

        if (currentAllowance >= amount) {
          return {
            receipt: null,
            simulateData: null,
            approved: true,
            message: 'Sufficient allowance already exists',
          }
        }

        const simulateData = await simulateContract(config, {
          address: WEUSDAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'approve',
          args: [spenderAddress, MAX_BIGINT],
          chainId: currentChainId,
        })

        if (!simulateData) {
          throw new Error('WEUSD approval simulation call failed')
        }

        // use the simulated data to write into the real contract
        const tx = await writeContractAsync({
          address: WEUSDAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'approve',
          args: [spenderAddress, MAX_BIGINT],
          chainId: currentChainId,
        })

        // wait for the transaction to be confirmed
        const receipt = await waitForTransactionReceipt(config, {
          hash: tx,
          chainId: currentChainId,
        })

        return {
          receipt,
          simulateData,
          approved: simulateData.result,
          message: 'Approval transaction completed',
        }
      } catch (error) {
        throw new Error(`WEUSD approval failed: ${error}`)
      }
    },
    [writeContractAsync, chainId, WEUSDAddress, address],
  )

  return { approveWEUSD }
}
