import { z } from 'zod'
import { getAddress, isAddress, parseUnits } from 'viem'
import { WEUSD_DECIMALS, MAX_BIGINT } from '@/lib/constants'
import { Decimal } from 'decimal.js'

/**
 * Verify whether the string can be safely converted to Decimal without losing accuracy
 * Allow positive decimals, up to WEUSD_DECIMALS decimal places, with a total length not exceeding the Decimal maximum value
 */
export const isValidDecimalString = (value: string, decimalPlaces: number = WEUSD_DECIMALS): boolean => {
  if (!value || value.trim() === '') return false

  let trimmed = value.trim()

  // Check the decimal format: allow numbers and decimal points, but not starting or ending with a decimal point
  const decimalRegex = /^\d+\.?\d*$|^\d*\.\d+$/
  if (!decimalRegex.test(trimmed)) return false

  // Check if it is a positive number
  const num = parseFloat(trimmed)
  if (isNaN(num) || num <= 0) return false

  // Separate the integer and decimal parts
  const parts = trimmed.split('.')
  const decimalPart = parts[1] || ''

  // Check if the number of decimal places does not exceed WEUSD_DECIMALS
  if (decimalPart.length > decimalPlaces) return false

  // Check if it exceeds the maximum value
  const bigintValue = parseUnits(trimmed, decimalPlaces)
  if (bigintValue > MAX_BIGINT) {
    trimmed = trimmed.substring(0, trimmed.length - 1)
  }

  try {
    // Try to create a Decimal to verify it's valid
    new Decimal(trimmed)
    return true
  } catch {
    return false
  }
}

/**
 * Format the input value, allowing numbers and decimal points
 */
export const formatDecimalInput = (value: string, decimalPlaces: number = WEUSD_DECIMALS): string => {
  // Allow empty input
  if (value === '') {
    return ''
  }

  // Only keep numbers and decimal points
  let formatted = value.replace(/[^0-9.]/g, '')

  // Ensure there is only one decimal point
  const parts = formatted.split('.')
  if (parts.length > 2) {
    formatted = parts[0] + '.' + parts.slice(1).join('')
  }

  // Limit the number of decimal places to WEUSD_DECIMALS
  if (parts.length === 2 && parts[1].length > decimalPlaces) {
    formatted = parts[0] + '.' + parts[1].substring(0, decimalPlaces)
  }

  // Check if it exceeds the maximum value
  const bigintValue = parseUnits(formatted, decimalPlaces)
  if (bigintValue > MAX_BIGINT) {
    formatted = formatted.substring(0, formatted.length - 1)
  }

  try {
    // Validate the formatted value by creating a Decimal
    new Decimal(formatted)
    return formatted
  } catch {
    // If invalid, return a safe value
    return parts[0] || '0'
  }
}

/**
 * Create a Zod validator for Decimal fields
 * Allow empty values during input but requires valid value on submit
 */
export const createRequiredDecimalValidator = (fieldName: string, decimalPlaces: number = WEUSD_DECIMALS) => {
  return z
    .string()
    .refine((val) => val === '' || isValidDecimalString(val, decimalPlaces), {
      message: `${fieldName} must be a valid positive number (max ${decimalPlaces} decimal places)`,
    })
    .transform((val) => (val === '' ? '' : val))
}

/**
 * Format the input value, only numbers and uppercase and lowercase letters are allowed
 */
export const formatAddressInput = (value: string) => {
  return value.replace(/[^0-9a-zA-Z]/g, '')
}

/**
 * Create a Zod validator for Address fields
 */
export const createAddressValidator = () =>
  z
    .string()
    .min(1, 'Address can not be empty')
    .refine(
      (address) => {
        try {
          return isAddress(address)
        } catch (error) {
          console.error('Address format validation error:', error)
          return false
        }
      },
      { message: 'Invalid Ethereum address format' },
    )
    .transform((address) => {
      try {
        return getAddress(address) as `0x${string}`
      } catch {
        return address as `0x${string}`
      }
    })
