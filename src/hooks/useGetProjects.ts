import factoryAbi from '@/lib/abi/factory.json'
import { getFactoryAddress } from '@/lib/utils'
import { readContract } from '@wagmi/core'
import { config } from '@/wagmi'
import type { Abi } from 'viem'
import { useCallback } from 'react'

export interface ProjectInfo {
  id: bigint
  name: string
  owner: string
  rwaToken: string
  prRwaToken: string
  stableRwaToken: string
  glaContract: string
  bankContract: string
  marketContract: string
  stakePoolContract: string
  helperContract: string
}

export const useGetProjects = () => {
  const factoryAddress = getFactoryAddress()
  const getProjects = useCallback(
    async (offset: bigint, limit: bigint): Promise<{ list: ProjectInfo[]; totalCount: bigint }> => {
      const projects = await readContract(config, {
        address: factoryAddress as `0x${string}`,
        abi: factoryAbi as Abi,
        functionName: 'getProjectsPaginated',
        args: [offset, limit],
      })
      if (!projects) {
        throw new Error('Failed to get projects')
      }

      const [list, totalCount] = projects as [ProjectInfo[], bigint]

      if (!list || !totalCount) {
        throw new Error('Invalid project data structure')
      }

      return {
        list: list.map((project) => ({
          id: project.id,
          name: project.name,
          owner: project.owner,
          rwaToken: project.rwaToken,
          prRwaToken: project.prRwaToken,
          stableRwaToken: project.stableRwaToken,
          glaContract: project.glaContract,
          bankContract: project.bankContract,
          marketContract: project.marketContract,
          stakePoolContract: project.stakePoolContract,
          helperContract: project.helperContract,
        })) as ProjectInfo[],
        totalCount: totalCount,
      }
    },
    [factoryAddress],
  )

  return {
    getProjects,
  }
}
