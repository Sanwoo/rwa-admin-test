'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePresetConfig } from '@/hooks/usePresetConfig'
import { useCreateProject } from '@/hooks/useCreateProject'
import { toast } from 'sonner'
import { LoaderCircle } from 'lucide-react'
import { ProjectConfigFormSkeleton } from './ProjectConfigFormSkeleton'
import { formatUnits } from 'viem'
import { WEUSD_DECIMALS } from '@/lib/constants'

export interface ProjectConfig {
  // tokens config
  tokens: {
    rwaName: string
    rwaSymbol: string
    prRwaName: string
    prRwaSymbol: string
    stableRwaName: string
    stableRwaSymbol: string
  }

  // bank config
  bank: {
    dev: string
    borrowFee: number
  }

  // market price config
  marketPrice: {
    target: number
    targetAdjusted: number
    minTarget: number
    maxTargetAdjusted: number
    raiseStep: number
    lowerStep: number
    lowerInterval: number
  }

  // market fee config
  marketFee: {
    dev: string
    buyFee: number
    sellFee: number
  }

  // price formula config
  priceFormula: {
    k: string
    initialPrice: string
    floorPrice: string
    floorSupply: string
    initialWorth: string
  }

  // stake reward config
  stakeReward: {
    mintPercentPerDay: number
    blocksPerDay: number
    totalAllocPoint: number
    rwaPoolAlloc: number
  }

  // stake fee config
  stakeFee: {
    dev: string
    withdrawFee: number
    mintFee: number
  }

  // gla config
  gla: {
    beforeWhitelistInterval: number
    whitelistInterval: number
    publicOfferingInterval: number
    initInterval: number
    whitelistPrice: number
    publicOfferingPrice: number
    softCap: number
    hardCap: number
    whitelistMaxCapPerUser: number
    WEUSDToken: string
  }
}

const defaultConfigValues: ProjectConfig = {
  tokens: {
    rwaName: '',
    rwaSymbol: '',
    prRwaName: '',
    prRwaSymbol: '',
    stableRwaName: '',
    stableRwaSymbol: '',
  },
  bank: {
    dev: '',
    borrowFee: 0,
  },
  marketPrice: {
    target: 0,
    targetAdjusted: 0,
    minTarget: 0,
    maxTargetAdjusted: 0,
    raiseStep: 0,
    lowerStep: 0,
    lowerInterval: 0,
  },
  marketFee: {
    dev: '',
    buyFee: 0,
    sellFee: 0,
  },
  priceFormula: {
    k: '',
    initialPrice: '',
    floorPrice: '',
    floorSupply: '',
    initialWorth: '',
  },
  stakeReward: {
    mintPercentPerDay: 0,
    blocksPerDay: 0,
    totalAllocPoint: 0,
    rwaPoolAlloc: 0,
  },
  stakeFee: {
    dev: '',
    withdrawFee: 0,
    mintFee: 0,
  },
  gla: {
    beforeWhitelistInterval: 0,
    whitelistInterval: 0,
    publicOfferingInterval: 0,
    initInterval: 0,
    whitelistPrice: 0,
    publicOfferingPrice: 0,
    softCap: 0,
    hardCap: 0,
    whitelistMaxCapPerUser: 0,
    WEUSDToken: '',
  },
}

export interface ProjectFormValues extends ProjectConfig {
  projectName: string
}

export const ProjectConfigForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentConfigType, setCurrentConfigType] = useState<'conservative' | 'aggressive' | 'balanced' | null>(null)
  const [configs, setConfigs] = useState<{
    conservative: ProjectConfig | null
    aggressive: ProjectConfig | null
    balanced: ProjectConfig | null
  } | null>(null)
  // use useState function form to ensure getting the latest value, avoid closure trap
  const [formValues, setFormValues] = useState<ProjectFormValues>({ projectName: '', ...defaultConfigValues })

  const { getAllConfigs } = usePresetConfig()

  const formatGlaConfig = useCallback((config: ProjectConfig): ProjectConfig => {
    return {
      ...config,
      gla: {
        ...config.gla,
        whitelistPrice: parseFloat(formatUnits(BigInt(config.gla.whitelistPrice), WEUSD_DECIMALS)),
        publicOfferingPrice: parseFloat(formatUnits(BigInt(config.gla.publicOfferingPrice), WEUSD_DECIMALS)),
        softCap: parseFloat(formatUnits(BigInt(config.gla.softCap), WEUSD_DECIMALS)),
        hardCap: parseFloat(formatUnits(BigInt(config.gla.hardCap), WEUSD_DECIMALS)),
        whitelistMaxCapPerUser: parseFloat(formatUnits(BigInt(config.gla.whitelistMaxCapPerUser), WEUSD_DECIMALS)),
      },
    }
  }, [])

  // get configs from contract
  useEffect(() => {
    const initializeConfigs = async () => {
      try {
        setIsLoading(true)
        const allConfigs = await getAllConfigs()

        if (allConfigs) {
          // process the result from contract
          const processedConfigs = {
            conservative:
              allConfigs.conservative && 'result' in allConfigs.conservative && allConfigs.conservative.status === 'success' ? formatGlaConfig(allConfigs.conservative.result as ProjectConfig) : null,
            aggressive:
              allConfigs.aggressive && 'result' in allConfigs.aggressive && allConfigs.aggressive.status === 'success' ? formatGlaConfig(allConfigs.aggressive.result as ProjectConfig) : null,
            balanced: allConfigs.balanced && 'result' in allConfigs.balanced && allConfigs.balanced.status === 'success' ? formatGlaConfig(allConfigs.balanced.result as ProjectConfig) : null,
          }

          setConfigs(processedConfigs)

          // set the current config type to conservative
          if (processedConfigs.conservative) {
            setCurrentConfigType('conservative')
          }
        }
      } catch (error) {
        toast.error(`Failed to initialize configs: ${error}`)
      } finally {
        setIsLoading(false)
      }
    }

    initializeConfigs()
  }, [getAllConfigs, formatGlaConfig])

  // when the configs are loaded, set the form values
  useEffect(() => {
    if (!isLoading && configs?.conservative) {
      setFormValues({ projectName: '', ...configs.conservative })
      setCurrentConfigType('conservative')
    }
  }, [isLoading, configs])

  const form = useForm<ProjectFormValues>({
    values: {
      ...formValues,
    },
    defaultValues: {
      projectName: formValues.projectName,
      ...defaultConfigValues,
    },
  })

  const { createProject } = useCreateProject()

  const onSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await createProject(data)
      if (result.receipt.status === 'success') {
        toast.success(`Project created successfully`)
      }
    } catch (error) {
      toast.error(`Failed to create project: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGetConfig = useCallback(
    async (configType: 'conservative' | 'aggressive' | 'balanced') => {
      try {
        if (configs?.[configType]) {
          setFormValues({ projectName: formValues.projectName, ...configs[configType] })
          setCurrentConfigType(configType)
          toast.success(`Applied ${configType} config from cache`)
        }
      } catch (error) {
        toast.error(`Failed to apply ${configType} config: ${error}`)
      }
    },
    [configs, formValues.projectName],
  )

  if (isLoading) {
    return <ProjectConfigFormSkeleton />
  }

  return (
    <>
      <div className="flex space-x-4 mb-4">
        <Button
          onClick={() => handleGetConfig('conservative')}
          variant={currentConfigType === 'conservative' ? 'default' : 'outline'}
          className={currentConfigType === 'conservative' ? 'bg-blue-600 text-white' : ''}
        >
          Apply Conservative Config
        </Button>
        <Button
          onClick={() => handleGetConfig('aggressive')}
          variant={currentConfigType === 'aggressive' ? 'default' : 'outline'}
          className={currentConfigType === 'aggressive' ? 'bg-blue-600 text-white' : ''}
        >
          Apply Aggressive Config
        </Button>
        <Button
          onClick={() => handleGetConfig('balanced')}
          variant={currentConfigType === 'balanced' ? 'default' : 'outline'}
          className={currentConfigType === 'balanced' ? 'bg-blue-600 text-white' : ''}
        >
          Apply Balanced Config
        </Button>
      </div>

      {/* Use the key attribute to forcibly recreate the form component, and use the configuration type as the key to ensure that the form is re rendered when switching configurations
       */}
      <Form key={currentConfigType || 'default'} {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Project Name */}
          <Card>
            <CardHeader>
              <CardTitle>project info</CardTitle>
              <CardDescription>configure the project name</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>projectName</FormLabel>
                      <Input placeholder="enter project name" {...field} autoComplete="off" />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* tokens config */}
          <Card>
            <CardHeader>
              <CardTitle>tokens config</CardTitle>
              <CardDescription>configure the basic information of RWA tokens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tokens.rwaName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>rwaName</FormLabel>
                      <FormControl>
                        <Input placeholder="Real World Asset" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tokens.rwaSymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>rwaSymbol</FormLabel>
                      <FormControl>
                        <Input placeholder="RWA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tokens.prRwaName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>prRwaName</FormLabel>
                      <FormControl>
                        <Input placeholder="Premium RWA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tokens.prRwaSymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>prRwaSymbol</FormLabel>
                      <FormControl>
                        <Input placeholder="prRWA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tokens.stableRwaName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>stableRwaName</FormLabel>
                      <FormControl>
                        <Input placeholder="Stable RWA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tokens.stableRwaSymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>stableRwaSymbol</FormLabel>
                      <FormControl>
                        <Input placeholder="sRWA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* bank config */}
          <Card>
            <CardHeader>
              <CardTitle>bank config</CardTitle>
              <CardDescription>configure the bank related parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bank.dev"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>dev</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bank.borrowFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>borrowFee</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="500" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* market price config */}
          <Card>
            <CardHeader>
              <CardTitle>market price config</CardTitle>
              <CardDescription>configure the market price related parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="marketPrice.target"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>target</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5000" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marketPrice.raiseStep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>raiseStep</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="500" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marketPrice.lowerStep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>lowerStep</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="250" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marketPrice.lowerInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>lowerInterval</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="3600" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* market fee config */}
          <Card>
            <CardHeader>
              <CardTitle>market fee config</CardTitle>
              <CardDescription>configure the market transaction fee</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="marketFee.dev"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>dev</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marketFee.buyFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>buyFee</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marketFee.sellFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>sellFee</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* price formula config */}
          <Card>
            <CardHeader>
              <CardTitle>price formula config</CardTitle>
              <CardDescription>configure the price calculation related parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priceFormula.k"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>k</FormLabel>
                      <FormControl>
                        <Input placeholder="1000000000000000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priceFormula.initialPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>initialPrice</FormLabel>
                      <FormControl>
                        <Input placeholder="1000000000000000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priceFormula.floorPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>floorPrice</FormLabel>
                      <FormControl>
                        <Input placeholder="500000000000000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priceFormula.floorSupply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>floorSupply</FormLabel>
                      <FormControl>
                        <Input placeholder="1000000000000000000000000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priceFormula.initialWorth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>initialWorth</FormLabel>
                      <FormControl>
                        <Input placeholder="1000000000000000000000000000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* stake reward config */}
          <Card>
            <CardHeader>
              <CardTitle>stake reward config</CardTitle>
              <CardDescription>configure the stake reward related parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stakeReward.mintPercentPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>mintPercentPerDay</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stakeReward.blocksPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>blocksPerDay</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="28800" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stakeReward.totalAllocPoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>totalAllocPoint</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stakeReward.rwaPoolAlloc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>rwaPoolAlloc</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="500" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* stake fee config */}
          <Card>
            <CardHeader>
              <CardTitle>stake fee config</CardTitle>
              <CardDescription>configure the stake related fee</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stakeFee.dev"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>dev</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stakeFee.withdrawFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>withdrawFee</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stakeFee.mintFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>mintFee</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* gla config */}
          <Card>
            <CardHeader>
              <CardTitle>gla config</CardTitle>
              <CardDescription>configure the gla related parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gla.beforeWhitelistInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>beforeWhitelistInterval</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="86400" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gla.whitelistInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>whitelistInterval</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="86400" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gla.publicOfferingInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>publicOfferingInterval</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="86400" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gla.initInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>initInterval</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="86400" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gla.whitelistPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>whitelistPrice</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000000" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gla.publicOfferingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>publicOfferingPrice</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1200000" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gla.softCap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>softCap</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000000" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gla.hardCap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>hardCap</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5000000" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gla.whitelistMaxCapPerUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>whitelistMaxCapPerUser</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10000" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gla.WEUSDToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WEUSDToken</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormValues({ projectName: '', ...defaultConfigValues })
                setCurrentConfigType(null)
              }}
            >
              Reset Config
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}
