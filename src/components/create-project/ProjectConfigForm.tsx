'use client'

import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePresetConfig } from '@/hooks/usePresetConfig'
import { useCreateProject } from '@/hooks/useCreateProject'
import { toast } from 'sonner'
import { LoaderCircle } from 'lucide-react'
import { formatUnits } from 'viem'
import { WEUSD_DECIMALS } from '@/lib/constants'

export interface ProjectConfig {
  // tokens config
  tokens: {
    rwaName: string // RWA token name
    rwaSymbol: string // RWA token symbol
    devAmount: number // platform RWA token amount
    initialAmount: number // RWA token initial supply
    receiver: string // RWA token initial supply receiver
    dayNum: number // days number per period
    periodNum: number // lock periods
    prRwaName: string // prRwa token name
    prRwaSymbol: string // prRwa token symbol
    stableRwaName: string // STABLE_RWA token name
    stableRwaSymbol: string // STABLE_RWA token symbol
  }

  // market price config
  marketPrice: {
    k: number // Price function slope reciprocal × 1e18, 1e15-1e21, recommended 2e18
    target: number // Target funding ratio (based on 10000) 1000-8000, recommended 5000
    targetAdjusted: number // Adjusted target funding ratio (based on 10000) target-10000, recommended 6000
    minTarget: number // Minimum target funding ratio (based on 10000) 500-target, recommended 3000
    maxTargetAdjusted: number // Maximum adjusted target funding ratio (based on 10000) targetAdjusted-10000, recommended 7000
    raiseStep: number // Step size for each increase (based on 10000) 100-2000, recommended 500
    lowerStep: number // Step size for each decrease (based on 10000) 50-1000, recommended 100
    lowerInterval: number // Decrease time interval (seconds) 1 hours-30 days, recommended 7 days
  }

  // market fee config
  marketFee: {
    dev: string // Developer address, receives trading fees
    buyFee: number // RWA purchase fee (based on 10000) 0-2000, recommended 200
    sellFee: number // RWA sale fee (based on 10000) 0-2000, recommended 300
  }

  // gla config
  gla: {
    beforeWhitelistInterval: number // Pre-whitelist wait time (seconds) recommended 7 days
    whitelistInterval: number // Whitelist stage time (seconds) recommended 3 days
    publicOfferingInterval: number // Public offering stage time (seconds) recommended 7 days
    initInterval: number // Initialization stage time (seconds) recommended 1 day
    whitelistPrice: number // Whitelist price (1e6 precision) recommended 500000
    publicOfferingPrice: number // Public offering price (1e6 precision) recommended 1000000
    softCap: number // Soft cap (WEUSD) recommended 50000e6
    hardCap: number // Hard cap (WEUSD) recommended 200000e6
    whitelistMaxCapPerUser: number // Maximum purchase amount per whitelist user recommended 1000e6
    WEUSDToken: string // WEUSD token address
  }
}

const defaultConfigValues: ProjectConfig = {
  tokens: {
    rwaName: '',
    rwaSymbol: '',
    devAmount: 0,
    initialAmount: 0,
    receiver: '',
    dayNum: 0,
    periodNum: 0,
    prRwaName: '',
    prRwaSymbol: '',
    stableRwaName: '',
    stableRwaSymbol: '',
  },
  marketPrice: {
    k: 0,
    target: 0,
    targetAdjusted: 0,
    minTarget: 0,
    maxTargetAdjusted: 0,
    raiseStep: 0,
    lowerStep: 0,
    lowerInterval: 0, // 7 days in seconds
  },
  marketFee: {
    dev: '',
    buyFee: 0,
    sellFee: 0,
  },
  gla: {
    beforeWhitelistInterval: 0, // 7 days
    whitelistInterval: 0, // 3 days
    publicOfferingInterval: 0, // 7 days
    initInterval: 0, // 1 day
    whitelistPrice: 0, // 0.5 WEUSD
    publicOfferingPrice: 0, // 1 WEUSD
    softCap: 0, // 50000e6
    hardCap: 0, // 200000e6
    whitelistMaxCapPerUser: 0, // 1000e6
    WEUSDToken: '',
  },
}

export interface ProjectFormValues extends ProjectConfig {
  projectName: string
}

export const ProjectConfigForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentConfigType, setCurrentConfigType] = useState<'balanced' | null>(null)
  const [loadingStates, setLoadingStates] = useState<{
    balanced: boolean
  }>({
    balanced: false,
  })
  // use useState function form to ensure getting the latest value, avoid closure trap
  const [formValues, setFormValues] = useState<ProjectFormValues>({ projectName: '', ...defaultConfigValues })

  const { getBalancedConfig } = usePresetConfig()

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
    async (configType: 'balanced') => {
      try {
        // Set loading state for the corresponding config
        setLoadingStates((prev) => ({ ...prev, [configType]: true }))

        let configData: ProjectConfig

        // Call the corresponding function based on config type
        switch (configType) {
          case 'balanced':
            configData = (await getBalancedConfig()) as ProjectConfig
            break
          default:
            throw new Error(`Unknown config type: ${configType}`)
        }

        if (configData) {
          // Format config data
          const formattedConfig = formatGlaConfig(configData)
          const newFormValues = { projectName: formValues.projectName, ...formattedConfig }

          setFormValues(newFormValues)
          form.reset(newFormValues)
          setCurrentConfigType(configType)

          toast.success(`Successfully applied ${configType} config`)
        } else {
          toast.error(`Failed to get ${configType} config: no data`)
        }
      } catch (error) {
        console.error(`Failed to get ${configType} config:`, error)
        toast.error(`Failed to get ${configType} config: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setLoadingStates((prev) => ({ ...prev, [configType]: false }))
      }
    },
    [formValues.projectName, form, formatGlaConfig, getBalancedConfig],
  )

  return (
    <>
      <div className="flex space-x-4 mb-4">
        <Button
          onClick={() => handleGetConfig('balanced')}
          variant={currentConfigType === 'balanced' ? 'default' : 'outline'}
          className={currentConfigType === 'balanced' ? 'bg-blue-600 text-white' : ''}
          disabled={loadingStates.balanced}
        >
          {loadingStates.balanced && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
          {loadingStates.balanced ? 'Loading Balanced Config...' : 'Apply Balanced Config'}
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
                  name="tokens.devAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>devAmount</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000000" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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
                <FormField
                  control={form.control}
                  name="tokens.initialAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>initialAmount</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10000000" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tokens.receiver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>receiver</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tokens.dayNum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>dayNum</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tokens.periodNum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>periodNum</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="12" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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
                  name="marketPrice.k"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>k (slope reciprocal)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2000000000000000000" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marketPrice.target"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>target (funding ratio)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5000" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marketPrice.targetAdjusted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>targetAdjusted</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="6000" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marketPrice.minTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>minTarget</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="3000" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marketPrice.maxTargetAdjusted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>maxTargetAdjusted</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="7000" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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
                        <Input type="number" placeholder="100" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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
                      <FormLabel>lowerInterval (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="604800" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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
                      <FormLabel>whitelistPrice(based on 1e6)</FormLabel>
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
                      <FormLabel>publicOfferingPrice(based on 1e6)</FormLabel>
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
                      <FormLabel>softCap(based on 1e6)</FormLabel>
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
                      <FormLabel>hardCap(based on 1e6)</FormLabel>
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
                      <FormLabel>whitelistMaxCapPerUser(based on 1e6)</FormLabel>
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
