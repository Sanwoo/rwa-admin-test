import { useCallback } from 'react'
import { getFactoryAddress } from '@/lib/utils'
import { readContract } from '@wagmi/core'
import factoryAbi from '@/lib/abi/factory.json'
import { config } from '@/wagmi'
import type { Abi } from 'viem'

export const usePresetConfig = () => {
  const factoryAddress = getFactoryAddress()

  const getConservativeConfig = useCallback(async () => {
    if (!factoryAddress) {
      console.error('Factory address is not configured')
      throw new Error('Factory address not configured, please check environment variables')
    }

    console.log('Getting conservative config, Factory address:', factoryAddress)

    const result = await readContract(config, {
      address: factoryAddress as `0x${string}`,
      abi: factoryAbi as Abi,
      functionName: 'getConservativeConfig',
      args: [],
    })

    console.log('Conservative config retrieved successfully')
    return result
  }, [factoryAddress])

  const getAggressiveConfig = useCallback(async () => {
    if (!factoryAddress) {
      console.error('Factory address is not configured')
      throw new Error('Factory address not configured, please check environment variables')
    }

    console.log('Getting aggressive config, Factory address:', factoryAddress)

    const result = await readContract(config, {
      address: factoryAddress as `0x${string}`,
      abi: factoryAbi as Abi,
      functionName: 'getAggressiveConfig',
      args: [],
    })

    console.log('Aggressive config retrieved successfully')
    return result
  }, [factoryAddress])

  const getBalancedConfig = useCallback(async () => {
    if (!factoryAddress) {
      console.error('Factory address is not configured')
      throw new Error('Factory address not configured, please check environment variables')
    }

    console.log('Getting balanced config, Factory address:', factoryAddress)

    const result = await readContract(config, {
      address: factoryAddress as `0x${string}`,
      abi: factoryAbi as Abi,
      functionName: 'getBalancedConfig',
      args: [],
    })

    console.log('Balanced config retrieved successfully')
    return result
  }, [factoryAddress])

  return {
    getConservativeConfig,
    getAggressiveConfig,
    getBalancedConfig,
  }
}
