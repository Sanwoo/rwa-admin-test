import { useCallback } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { simulateContract, waitForTransactionReceipt } from '@wagmi/core'
import { getFactoryAddress } from '@/lib/utils'
import type { Abi } from 'viem'
import factoryAbi from '@/lib/abi/factory.json'
import type { supportedChainIds } from '@/wagmi'
import { config } from '@/wagmi'
import type { ProjectFormValues } from '@/components/create-project/ProjectConfigForm'
import { parseUnits } from 'viem'
import { WEUSD_DECIMALS } from '@/lib/constants'

export const useCreateProject = () => {
  const { chainId } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const factoryAddress = getFactoryAddress()
  const currentChainId = chainId as (typeof supportedChainIds)[number]

  const createProject = useCallback(
    async (projectValues: ProjectFormValues) => {
      const { projectName, ...projectConfig } = projectValues

      const realConfig = {
        ...projectConfig,
        gla: {
          ...projectConfig.gla,
          whitelistPrice: parseUnits(projectConfig.gla.whitelistPrice.toString(), WEUSD_DECIMALS),
          publicOfferingPrice: parseUnits(projectConfig.gla.publicOfferingPrice.toString(), WEUSD_DECIMALS),
          softCap: parseUnits(projectConfig.gla.softCap.toString(), WEUSD_DECIMALS),
          hardCap: parseUnits(projectConfig.gla.hardCap.toString(), WEUSD_DECIMALS),
          whitelistMaxCapPerUser: parseUnits(projectConfig.gla.whitelistMaxCapPerUser.toString(), WEUSD_DECIMALS),
        },
      }

      const simulateData = await simulateContract(config, {
        address: factoryAddress as `0x${string}`,
        abi: factoryAbi as Abi,
        functionName: 'createProject',
        args: [projectName, realConfig],
      })

      if (!simulateData) {
        throw new Error('Failed to simulate createProject')
      }

      const tx = await writeContractAsync(simulateData.request)

      const receipt = await waitForTransactionReceipt(config, {
        hash: tx,
        chainId: currentChainId,
      })

      return { simulateData, receipt, tx }
    },
    [currentChainId, factoryAddress, writeContractAsync],
  )

  return {
    createProject,
  }
}
