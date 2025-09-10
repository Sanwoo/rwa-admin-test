'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card'
import { Button } from '../ui/button'
import { RefreshCw, Search, Copy, Check, LoaderCircle } from 'lucide-react'
import { Input } from '../ui/input'
import type { ProjectInfo } from '@/hooks/useGetProjects'
import { useGetProjects } from '@/hooks/useGetProjects'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'
import { Badge } from '../ui/badge'
import { formatDecimalInput, createRequiredDecimalValidator, createAddressValidator, formatAddressInput } from '@/lib/validation'
import { useWhitelistBuy } from '@/hooks/useWhitelistBuy'
import { useAddWhitelist } from '@/hooks/useAddWhitelist'
import { isAddress, parseUnits } from 'viem'
import { z } from 'zod'
import { ProjectListSkeleton } from './ProjectListSkeleton'
import type { Phase } from '@/lib/constants'
import { WEUSD_DECIMALS } from '@/lib/constants'
import { useGetPhase } from '@/hooks/useGetPhase'
import { useWEUSDApprove } from '@/hooks/useWEUSDApprove'
import { usePublicOfferingBuy } from '@/hooks/usePublicOfferingBuy'
import { useWithdraw } from '@/hooks/useWithdraw'
import { useClaim } from '@/hooks/useClaim'
import { useBuy } from '@/hooks/useBuy'
import { useSell } from '@/hooks/useSell'
import { useInitialize } from '@/hooks/useInitialize'

interface ProjectInfoDetail extends ProjectInfo {
  phase: Phase
}

const ProjectList = () => {
  const { isConnected } = useAccount()
  const { whitelistBuy } = useWhitelistBuy()
  const { addWhitelist } = useAddWhitelist()
  const { getProjects } = useGetProjects()
  const { getPhase } = useGetPhase()
  const { approveWEUSD } = useWEUSDApprove()
  const { publicOfferingBuy } = usePublicOfferingBuy()
  const { withdraw } = useWithdraw()
  const { claim } = useClaim()
  const { buy } = useBuy()
  const { sell } = useSell()
  const { initialize } = useInitialize()

  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [projects, setProjects] = useState<ProjectInfoDetail[]>([])
  const [copiedIds, setCopiedIds] = useState<{ [key: string]: boolean }>({})
  const [projectWhitelistAmounts, setProjectWhitelistAmounts] = useState<{ [key: string]: string }>({})
  const [projectPublicOfferingAmounts, setProjectPublicOfferingAmounts] = useState<{ [key: string]: string }>({})

  const [projectBuyAmounts, setProjectBuyAmounts] = useState<{ [key: string]: string }>({})
  const [projectSellAmounts, setProjectSellAmounts] = useState<{ [key: string]: string }>({})

  const [whitelistAddresses, setWhitelistAddresses] = useState<{ [key: string]: string }>({})
  const [isAddWhitelistLoading, setIsAddWhitelistLoading] = useState<{ [key: string]: boolean }>({})
  const [isWhitelistBuyLoading, setIsWhitelistBuyLoading] = useState<{ [key: string]: boolean }>({})
  const [isPublicOfferingBuyLoading, setIsPublicOfferingBuyLoading] = useState<{ [key: string]: boolean }>({})
  const [isWithdrawLoading, setIsWithdrawLoading] = useState<{ [key: string]: boolean }>({})
  const [isClaimLoading, setIsClaimLoading] = useState<{ [key: string]: boolean }>({})
  const [isBuyLoading, setIsBuyLoading] = useState<{ [key: string]: boolean }>({})
  const [isSellLoading, setIsSellLoading] = useState<{ [key: string]: boolean }>({})
  const [isInitializeLoading, setIsInitializeLoading] = useState<{ [key: string]: boolean }>({})

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    if (!isConnected) {
      toast.error('Wallet not connected, please connect wallet')
      return
    }
    setIsLoading(true)
    try {
      const firstPage = await getProjects(BigInt(0), BigInt(10))
      const firstPageWithPhase: ProjectInfoDetail[] = await Promise.all(
        firstPage.list.map(async (project) => ({
          ...project,
          phase: await getPhase(project.glaContract as `0x${string}`),
        })),
      )
      const allProjects: ProjectInfoDetail[] = [...firstPageWithPhase]

      if (firstPage.totalCount > BigInt(10)) {
        const lastPage = await getProjects(firstPage.totalCount - BigInt(10), firstPage.totalCount)
        const lastPageWithPhase: ProjectInfoDetail[] = await Promise.all(
          lastPage.list.map(async (project) => ({
            ...project,
            phase: await getPhase(project.glaContract as `0x${string}`),
          })),
        )
        const existingIds = new Set(allProjects.map((p) => p.id))
        lastPageWithPhase.forEach((project) => {
          if (!existingIds.has(project.id)) {
            allProjects.push(project)
          }
        })
      }

      setProjects(allProjects)
      toast.success('Projects fetched successfully')
    } catch (error) {
      toast.error(`Failed to fetch projects: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }, [getProjects, isConnected, getPhase])

  const handleRefresh = useCallback(async () => {
    await fetchProjects()
  }, [fetchProjects])

  const validateAddress = useCallback((address: string) => {
    try {
      const schema = createAddressValidator()
      schema.parse(address)
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((err: z.ZodIssue) => {
          toast.error(`Address validation failed: ${err.message}`)
        })
      }
      return false
    }
  }, [])

  const handleAddWhitelist = useCallback(
    async (projectId: string, glaContractAddress: `0x${string}`) => {
      try {
        setIsAddWhitelistLoading((prev) => ({ ...prev, [projectId]: true }))
        if (!validateAddress(whitelistAddresses[projectId])) {
          return
        }
        const res = await addWhitelist([whitelistAddresses[projectId] as `0x${string}`], glaContractAddress)
        if (res.receipt.status === 'success') {
          toast.success('Whitelist added successfully')
        }
      } catch (error) {
        toast.error(`Failed to add whitelist: ${error}`)
      } finally {
        setIsAddWhitelistLoading((prev) => ({ ...prev, [projectId]: false }))
      }
    },
    [addWhitelist, whitelistAddresses, validateAddress],
  )

  const handleWhitelistBuy = useCallback(
    async (projectId: string, glaContractAddress: `0x${string}`) => {
      try {
        setIsWhitelistBuyLoading((prev) => ({ ...prev, [projectId]: true }))
        const approveRes = await approveWEUSD(glaContractAddress, parseUnits(projectWhitelistAmounts[projectId], WEUSD_DECIMALS))
        if (!approveRes.approved) {
          throw new Error('WEUSD approval failed')
        }
        const res = await whitelistBuy(parseUnits(projectWhitelistAmounts[projectId], WEUSD_DECIMALS), glaContractAddress)
        if (res.receipt.status === 'success') {
          toast.success('Whitelist bought successfully')
        }
      } catch (error) {
        toast.error(`Failed to whitelist buy: ${error}`)
      } finally {
        setIsWhitelistBuyLoading((prev) => ({ ...prev, [projectId]: false }))
      }
    },
    [whitelistBuy, projectWhitelistAmounts, approveWEUSD],
  )

  const handlePublicOfferingBuy = useCallback(
    async (projectId: string, glaContractAddress: `0x${string}`) => {
      try {
        setIsPublicOfferingBuyLoading((prev) => ({ ...prev, [projectId]: true }))
        const approveRes = await approveWEUSD(glaContractAddress, parseUnits(projectPublicOfferingAmounts[projectId], WEUSD_DECIMALS))
        if (!approveRes.approved) {
          throw new Error('WEUSD approval failed')
        }
        const res = await publicOfferingBuy(parseUnits(projectPublicOfferingAmounts[projectId], WEUSD_DECIMALS), glaContractAddress)
        if (res.receipt.status === 'success') {
          toast.success('Public offering bought successfully')
        }
      } catch (error) {
        toast.error(`Failed to public offering buy: ${error}`)
      } finally {
        setIsPublicOfferingBuyLoading((prev) => ({ ...prev, [projectId]: false }))
      }
    },
    [publicOfferingBuy, projectPublicOfferingAmounts, setIsPublicOfferingBuyLoading, approveWEUSD],
  )

  const handleWithdraw = useCallback(
    async (projectId: string, glaContractAddress: `0x${string}`) => {
      try {
        setIsWithdrawLoading((prev) => ({ ...prev, [projectId]: true }))
        const res = await withdraw(glaContractAddress)
        if (res.receipt.status === 'success') {
          toast.success('Withdrawn successfully')
        }
      } catch (error) {
        toast.error(`Failed to withdraw: ${error}`)
      } finally {
        setIsWithdrawLoading((prev) => ({ ...prev, [projectId]: false }))
      }
    },
    [withdraw, setIsWithdrawLoading],
  )

  const handleClaim = useCallback(
    async (projectId: string, glaContractAddress: `0x${string}`) => {
      try {
        setIsClaimLoading((prev) => ({ ...prev, [projectId]: true }))
        const res = await claim(glaContractAddress)
        if (res.receipt.status === 'success') {
          toast.success('Claimed successfully')
        }
      } catch (error) {
        toast.error(`Failed to claim: ${error}`)
      } finally {
        setIsClaimLoading((prev) => ({ ...prev, [projectId]: false }))
      }
    },
    [claim, setIsClaimLoading],
  )

  const handleBuy = useCallback(
    async (projectId: string, marketContractAddress: `0x${string}`) => {
      try {
        setIsBuyLoading((prev) => ({ ...prev, [projectId]: true }))
        const approveRes = await approveWEUSD(marketContractAddress, parseUnits(projectBuyAmounts[projectId], WEUSD_DECIMALS))
        if (!approveRes.approved) {
          throw new Error('WEUSD approval failed')
        }
        const res = await buy(marketContractAddress, parseUnits(projectBuyAmounts[projectId], WEUSD_DECIMALS))
        if (res.receipt.status === 'success') {
          toast.success('Bought successfully')
        }
      } catch (error) {
        toast.error(`Failed to buy: ${error}`)
      } finally {
        setIsBuyLoading((prev) => ({ ...prev, [projectId]: false }))
      }
    },
    [buy, projectBuyAmounts, setIsBuyLoading],
  )

  const handleSell = useCallback(
    async (projectId: string, marketContractAddress: `0x${string}`, rwTokenAddress: `0x${string}`) => {
      try {
        setIsSellLoading((prev) => ({ ...prev, [projectId]: true }))
        const res = await sell(marketContractAddress, parseUnits(projectSellAmounts[projectId], WEUSD_DECIMALS), rwTokenAddress)
        if (res.receipt.status === 'success') {
          toast.success('Sold successfully')
        }
      } catch (error) {
        toast.error(`Failed to sell: ${error}`)
      } finally {
        setIsSellLoading((prev) => ({ ...prev, [projectId]: false }))
      }
    },
    [sell, projectSellAmounts, setIsSellLoading],
  )

  const handleInitialize = useCallback(
    async (projectId: string, glaContractAddress: `0x${string}`) => {
      try {
        setIsInitializeLoading((prev) => ({ ...prev, [projectId]: true }))
        const res = await initialize(glaContractAddress)
        if (res.receipt.status === 'success') {
          toast.success('Initialized successfully')
        }
      } catch (error) {
        toast.error(`Failed to initialize: ${error}`)
      } finally {
        setIsInitializeLoading((prev) => ({ ...prev, [projectId]: false }))
      }
    },
    [initialize, setIsInitializeLoading],
  )

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects, isConnected])

  return (
    <>
      <Card asChild className="p-4 flex-shrink-0">
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search by project name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || Object.values(isAddWhitelistLoading).some((value) => value) || Object.values(isWhitelistBuyLoading).some((value) => value)}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col mt-4 gap-4">
        {isLoading ? (
          <ProjectListSkeleton />
        ) : (
          projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span>{project.name}</span>
                    <Badge variant="outline">ID: {project.id.toString()}</Badge>
                    <Badge variant="outline">{project.phase}</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const projectData = JSON.stringify(
                        project,
                        (key, value) => {
                          return typeof value === 'bigint' ? value.toString() : value
                        },
                        2,
                      )
                      navigator.clipboard.writeText(projectData)
                      toast.success('Project info copied')

                      setCopiedIds((prev) => ({ ...prev, [project.id.toString()]: true }))

                      setTimeout(() => {
                        setCopiedIds((prev) => ({ ...prev, [project.id.toString()]: false }))
                      }, 3000)
                    }}
                  >
                    {copiedIds[project.id.toString()] ? <Check size={14} /> : <Copy size={14} />}
                  </Button>
                </CardTitle>
                <CardDescription className="mt-2">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium">owner:</span>
                    <span className="truncate">{project.owner}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => {
                        navigator.clipboard.writeText(project.owner)
                        toast.success('Address copied')
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(project).map(([key, value]) => {
                    if (key === 'id' || key === 'owner' || key === 'name' || key === 'phase') {
                      return null
                    }
                    return (
                      <div key={key} className="space-y-1">
                        <p className="text-sm font-medium">{key}:</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{value}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col py-3 gap-2">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      className="w-full"
                      placeholder="Enter address"
                      value={whitelistAddresses[project.id.toString()] || ''}
                      onChange={(e) => {
                        const formattedValue = formatAddressInput(e.target.value)
                        setWhitelistAddresses((prev) => ({
                          ...prev,
                          [project.id.toString()]: formattedValue,
                        }))
                      }}
                    />
                    <Button
                      disabled={
                        isLoading ||
                        !whitelistAddresses[project.id.toString()] ||
                        !isAddress(whitelistAddresses[project.id.toString()]) ||
                        project.phase !== 'Before Whitelist Phase' ||
                        isAddWhitelistLoading[project.id.toString()]
                      }
                      onClick={() => {
                        handleAddWhitelist(project.id.toString(), project.glaContract as `0x${string}`)
                      }}
                    >
                      {isAddWhitelistLoading[project.id.toString()] ? <LoaderCircle className="w-4 h-4 mr-2 animate-spin" /> : null}
                      {isAddWhitelistLoading[project.id.toString()] ? 'Adding...' : 'Add Whitelist'}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      className="w-full"
                      placeholder="Enter amount(WEUSD)"
                      value={projectWhitelistAmounts[project.id.toString()] || ''}
                      onChange={(e) => {
                        const formattedValue = formatDecimalInput(e.target.value)
                        setProjectWhitelistAmounts((prev) => ({
                          ...prev,
                          [project.id.toString()]: formattedValue,
                        }))
                      }}
                    />
                    <Button
                      disabled={
                        isLoading ||
                        !projectWhitelistAmounts[project.id.toString()] ||
                        !createRequiredDecimalValidator('Whitelist buy amount').safeParse(projectWhitelistAmounts[project.id.toString()]).success ||
                        project.phase !== 'Whitelist Phase' ||
                        isWhitelistBuyLoading[project.id.toString()]
                      }
                      onClick={() => {
                        handleWhitelistBuy(project.id.toString(), project.glaContract as `0x${string}`)
                      }}
                    >
                      {isWhitelistBuyLoading[project.id.toString()] ? <LoaderCircle className="w-4 h-4 mr-2 animate-spin" /> : null}
                      {isWhitelistBuyLoading[project.id.toString()] ? 'Buying...' : 'Whitelist Buy'}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      className="w-full"
                      placeholder="Enter amount(WEUSD)"
                      value={projectPublicOfferingAmounts[project.id.toString()] || ''}
                      onChange={(e) => {
                        const formattedValue = formatDecimalInput(e.target.value)
                        setProjectPublicOfferingAmounts((prev) => ({
                          ...prev,
                          [project.id.toString()]: formattedValue,
                        }))
                      }}
                    />
                    <Button
                      disabled={
                        isLoading ||
                        !projectPublicOfferingAmounts[project.id.toString()] ||
                        !createRequiredDecimalValidator('Whitelist buy amount').safeParse(projectPublicOfferingAmounts[project.id.toString()]).success ||
                        project.phase !== 'Public Offering Phase' ||
                        isPublicOfferingBuyLoading[project.id.toString()]
                      }
                      onClick={() => {
                        handlePublicOfferingBuy(project.id.toString(), project.glaContract as `0x${string}`)
                      }}
                    >
                      {isPublicOfferingBuyLoading[project.id.toString()] ? <LoaderCircle className="w-4 h-4 mr-2 animate-spin" /> : null}
                      {isPublicOfferingBuyLoading[project.id.toString()] ? 'Buying...' : 'Public Offering Buy'}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 w-full">
                  <Button
                    disabled={isLoading || project.phase !== 'Initialzing Phase' || isInitializeLoading[project.id.toString()]}
                    onClick={() => {
                      handleInitialize(project.id.toString(), project.glaContract as `0x${string}`)
                    }}
                  >
                    {isInitializeLoading[project.id.toString()] ? <LoaderCircle className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {isInitializeLoading[project.id.toString()] ? 'Initializing...' : 'Initialize'}
                  </Button>
                  <Button
                    disabled={isLoading || project.phase !== 'Unlock Phase' || isWithdrawLoading[project.id.toString()]}
                    onClick={() => {
                      handleWithdraw(project.id.toString(), project.glaContract as `0x${string}`)
                    }}
                  >
                    {isWithdrawLoading[project.id.toString()] ? <LoaderCircle className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {isWithdrawLoading[project.id.toString()] ? 'Withdrawing...' : 'Withdraw'}
                  </Button>
                  <Button
                    disabled={isLoading || project.phase !== 'Initialized Phase' || isClaimLoading[project.id.toString()]}
                    onClick={() => {
                      handleClaim(project.id.toString(), project.glaContract as `0x${string}`)
                    }}
                  >
                    {isClaimLoading[project.id.toString()] ? <LoaderCircle className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {isClaimLoading[project.id.toString()] ? 'Claiming...' : 'Claim'}
                  </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="flex items-center justify-end gap-2 w-full">
                    <Input
                      className="w-full"
                      placeholder="Enter amount(WEUSD)"
                      value={projectBuyAmounts[project.id.toString()] || ''}
                      onChange={(e) => {
                        const formattedValue = formatDecimalInput(e.target.value)
                        setProjectBuyAmounts((prev) => ({
                          ...prev,
                          [project.id.toString()]: formattedValue,
                        }))
                      }}
                    />
                    <Button
                      disabled={
                        isLoading ||
                        !projectBuyAmounts[project.id.toString()] ||
                        !createRequiredDecimalValidator('Whitelist buy amount').safeParse(projectBuyAmounts[project.id.toString()]).success ||
                        project.phase !== 'Initialized Phase' ||
                        isBuyLoading[project.id.toString()]
                      }
                      onClick={() => {
                        handleBuy(project.id.toString(), project.marketContract as `0x${string}`)
                      }}
                    >
                      {isBuyLoading[project.id.toString()] ? <LoaderCircle className="w-4 h-4 mr-2 animate-spin" /> : null}
                      {isBuyLoading[project.id.toString()] ? 'Buying...' : 'Buy'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-end gap-2 w-full">
                    <Input
                      className="w-full"
                      placeholder="Enter amount(WEUSD)"
                      value={projectSellAmounts[project.id.toString()] || ''}
                      onChange={(e) => {
                        const formattedValue = formatDecimalInput(e.target.value)
                        setProjectSellAmounts((prev) => ({
                          ...prev,
                          [project.id.toString()]: formattedValue,
                        }))
                      }}
                    />
                    <Button
                      disabled={
                        isLoading ||
                        !projectSellAmounts[project.id.toString()] ||
                        !createRequiredDecimalValidator('Whitelist buy amount').safeParse(projectSellAmounts[project.id.toString()]).success ||
                        project.phase !== 'Initialized Phase' ||
                        isSellLoading[project.id.toString()]
                      }
                      onClick={() => {
                        handleSell(project.id.toString(), project.marketContract as `0x${string}`, project.rwaToken as `0x${string}`)
                      }}
                    >
                      {isSellLoading[project.id.toString()] ? <LoaderCircle className="w-4 h-4 mr-2 animate-spin" /> : null}
                      {isSellLoading[project.id.toString()] ? 'Selling...' : 'Sell'}
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </>
  )
}

export default ProjectList
