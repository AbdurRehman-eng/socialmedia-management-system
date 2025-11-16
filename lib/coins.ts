// Coin system utilities for SMM reseller platform (Supabase version)

import * as db from './db'

// Default: 1 coin = 1 PHP (can be changed by admin)
const DEFAULT_COIN_TO_PHP = 1
// Default markup: 50% higher (1.5 = 50% markup)
const DEFAULT_MARKUP = 1.5

export interface PricingRule {
  serviceId: number
  markup?: number // Multiplier (e.g., 1.2 = 20% markup)
  customPrice?: number // Optional fixed price in coins
}

// Cache for settings to avoid too many DB calls
let cachedMarkup: number | null = null
let cachedCoinRate: number | null = null
let cachedBalance: number | null = null

/**
 * Get coin balance from database
 */
export async function getCoinBalance(userId?: string): Promise<number> {
  try {
    const balance = await db.getCoinBalance(userId)
    cachedBalance = balance
    return balance
  } catch (error) {
    console.error("Error reading coin balance:", error)
    return cachedBalance || 1000.00 // Fallback to cached or default
  }
}

/**
 * Set coin balance
 */
export async function setCoinBalance(coins: number, userId?: string): Promise<void> {
  try {
    await db.setCoinBalance(coins, userId)
    cachedBalance = coins
  } catch (error) {
    console.error("Error setting coin balance:", error)
    throw error
  }
}

/**
 * Add coins to balance
 */
export async function addCoins(amount: number, userId?: string): Promise<number> {
  const current = await getCoinBalance(userId)
  const newBalance = current + amount
  await setCoinBalance(newBalance, userId)
  return newBalance
}

/**
 * Deduct coins from balance
 */
export async function deductCoins(amount: number, userId?: string): Promise<boolean> {
  const current = await getCoinBalance(userId)
  if (current < amount) {
    return false
  }
  await setCoinBalance(current - amount, userId)
  return true
}

/**
 * Get coin to PHP conversion rate
 */
export async function getCoinToPhpRate(): Promise<number> {
  try {
    const rate = await db.getCoinToUsdRate()
    cachedCoinRate = rate
    return rate
  } catch (error) {
    console.error("Error reading coin rate:", error)
    return cachedCoinRate || DEFAULT_COIN_TO_PHP
  }
}

/**
 * Set coin to PHP conversion rate
 */
export async function setCoinToPhpRate(rate: number): Promise<void> {
  try {
    await db.setCoinToUsdRate(rate)
    cachedCoinRate = rate
  } catch (error) {
    console.error("Error setting coin rate:", error)
    throw error
  }
}

// Backwards compatibility aliases
export const getCoinToUsdRate = getCoinToPhpRate
export const setCoinToUsdRate = setCoinToPhpRate

/**
 * Convert PHP to Coins
 */
export async function phpToCoins(php: number): Promise<number> {
  const rate = await getCoinToPhpRate()
  return php * rate
}

/**
 * Convert Coins to PHP
 */
export async function coinsToPhp(coins: number): Promise<number> {
  const rate = await getCoinToPhpRate()
  return coins / rate
}

// Backwards compatibility aliases
export const usdToCoins = phpToCoins
export const coinsToUsd = coinsToPhp

/**
 * Get default markup percentage
 */
export async function getDefaultMarkup(): Promise<number> {
  try {
    const markup = await db.getDefaultMarkup()
    cachedMarkup = markup
    return markup
  } catch (error) {
    console.error("Error reading default markup:", error)
    return cachedMarkup || DEFAULT_MARKUP
  }
}

/**
 * Set default markup percentage
 */
export async function setDefaultMarkup(markup: number): Promise<void> {
  try {
    await db.setDefaultMarkup(markup)
    cachedMarkup = markup
  } catch (error) {
    console.error("Error setting default markup:", error)
    throw error
  }
}

/**
 * Get pricing rules for all services
 */
export async function getPricingRules(): Promise<Record<number, PricingRule>> {
  try {
    return await db.getPricingRules()
  } catch (error) {
    console.error("Error reading pricing rules:", error)
    return {}
  }
}

/**
 * Get pricing rule for a specific service
 */
export async function getPricingRule(serviceId: number): Promise<PricingRule | null> {
  try {
    return await db.getPricingRule(serviceId)
  } catch (error) {
    console.error("Error reading pricing rule:", error)
    return null
  }
}

/**
 * Set pricing rule for a service
 */
export async function setPricingRule(serviceId: number, rule: PricingRule): Promise<void> {
  try {
    await db.setPricingRule(serviceId, {
      markup: rule.markup,
      customPrice: rule.customPrice,
    })
  } catch (error) {
    console.error("Error setting pricing rule:", error)
    throw error
  }
}

/**
 * Delete pricing rule for a service
 */
export async function deletePricingRule(serviceId: number): Promise<void> {
  try {
    await db.deletePricingRule(serviceId)
  } catch (error) {
    console.error("Error deleting pricing rule:", error)
    throw error
  }
}

/**
 * Calculate coin price for a service
 * @param providerRateInUsdPer1000 - The price from the provider per 1000 units (in USD)
 * @param serviceId - The service ID
 * @returns The price in coins per 1000 units that the client should pay
 * 
 * PRICING FORMULA:
 * 1. Convert USD to PHP: providerRateInPHP = providerRateInUSD × usdToPhpRate
 * 2. Apply markup: yourPrice = providerRateInPHP × markup (default 1.5 = 50% markup)
 * 3. Convert to coins: finalCoins = yourPrice × coinRate (default 1 coin = 1 PHP)
 * 
 * Example: Provider = $1.00/1000, USD→PHP rate = 50, markup = 1.5
 *   → PHP price = $1.00 × 50 = ₱50
 *   → Your price = ₱50 × 1.5 = ₱75/1000
 */
export async function calculateCoinPrice(providerRateInUsdPer1000: number, serviceId: number): Promise<number> {
  const rule = await getPricingRule(serviceId)
  const defaultMarkup = await getDefaultMarkup()
  const usdToPhpRate = await db.getUsdToPhpRate()
  
  // First convert USD to PHP
  const providerRateInPhp = providerRateInUsdPer1000 * usdToPhpRate
  
  let finalPhpPrice: number
  
  if (rule?.customPrice !== undefined) {
    // Use custom fixed price (already per 1000 in PHP)
    return rule.customPrice
  } else if (rule?.markup) {
    // Use service-specific markup
    finalPhpPrice = providerRateInPhp * rule.markup
  } else {
    // Use default markup (1.5 = 50% markup)
    finalPhpPrice = providerRateInPhp * defaultMarkup
  }
  
  // Convert PHP to coins (1 coin = 1 PHP by default)
  return await phpToCoins(finalPhpPrice)
}

/**
 * Calculate total coin cost for an order
 * @param providerRateInUsdPer1000 - The provider's rate per 1000 units (in USD)
 * @param quantity - The quantity to order
 * @param serviceId - The service ID
 * @returns The total cost in coins for the order
 * 
 * CALCULATION:
 * 1. Convert provider USD rate to PHP and apply markup to get your price per 1000 units
 * 2. Calculate cost: (your_price_per_1000 / 1000) × quantity
 * 3. Or: (your_price_per_1000 × quantity) / 1000
 */
export async function calculateOrderCost(providerRateInUsdPer1000: number, quantity: number, serviceId: number): Promise<number> {
  const yourPricePer1000 = await calculateCoinPrice(providerRateInUsdPer1000, serviceId)
  // Calculate cost: (price per 1000 / 1000) × quantity = price per unit × quantity
  const pricePerUnit = yourPricePer1000 / 1000
  return pricePerUnit * quantity
}

/**
 * Format coins for display
 */
export function formatCoins(coins: number): string {
  return `₱${coins.toFixed(2)}`
}
