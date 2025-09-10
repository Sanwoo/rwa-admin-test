import { useCallback } from 'react'
import { getFactoryAddress } from '@/lib/utils'
import { readContracts } from '@wagmi/core'
import factoryAbi from '@/lib/abi/factory.json'
import { config } from '@/wagmi'
import type { Abi } from 'viem'

export const usePresetConfig = () => {
  const factoryAddress = getFactoryAddress()

  const getAllConfigs = useCallback(async () => {
    try {
      if (!factoryAddress) {
        return null
      }

      const contracts = [
        {
          address: factoryAddress as `0x${string}`,
          abi: factoryAbi as Abi,
          functionName: 'getConservativeConfig',
          args: [],
        },
        {
          address: factoryAddress as `0x${string}`,
          abi: factoryAbi as Abi,
          functionName: 'getAggressiveConfig',
          args: [],
        },
        {
          address: factoryAddress as `0x${string}`,
          abi: factoryAbi as Abi,
          functionName: 'getBalancedConfig',
          args: [],
        },
      ]

      const results = await readContracts(config, { contracts })

      return {
        conservative: results[0],
        aggressive: results[1],
        balanced: results[2],
      }
    } catch (error) {
      throw new Error(`Failed to get all configs: ${error}`)
    }
  }, [factoryAddress])

  return {
    getAllConfigs,
  }
}
