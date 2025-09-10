import { config } from '@/wagmi'
import { readContract } from '@wagmi/core'
import { useCallback } from 'react'
import type { Abi } from 'viem'
import glaAbi from '@/lib/abi/gla.json'
import { PHASES } from '@/lib/constants'
import type { Phase } from '@/lib/constants'

export const useGetPhase = () => {
  const getPhase = useCallback(async (glaContractAddress: `0x${string}`): Promise<Phase> => {
    const phase = await readContract(config, {
      address: glaContractAddress as `0x${string}`,
      abi: glaAbi as Abi,
      functionName: 'getPhase',
    })

    const phaseValue = PHASES.get(phase as number)
    if (!phaseValue) {
      throw new Error('Invalid phase number')
    }
    return phaseValue
  }, [])

  return { getPhase }
}
