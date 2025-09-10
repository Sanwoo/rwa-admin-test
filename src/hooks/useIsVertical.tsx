'use client'

import { useSettings } from '@/hooks/useSettings'

export function useIsVertical() {
  const { settings } = useSettings()

  const isVertical = settings.layout === 'vertical'
  return isVertical
}
