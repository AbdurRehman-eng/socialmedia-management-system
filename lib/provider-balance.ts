// Provider balance utilities
import { smmApi } from './api'
import * as db from './db'

/**
 * Fetch the provider balance from SMM API
 * Returns balance in USD
 */
export async function getProviderBalance(): Promise<{ balance: number; currency: string }> {
  try {
    const data = await smmApi.getBalance()
    return {
      balance: parseFloat(data.balance),
      currency: data.currency
    }
  } catch (error) {
    console.error('Error fetching provider balance:', error)
    throw new Error('Failed to fetch provider balance')
  }
}

/**
 * Convert USD to PHP coins
 * USD rates typically 1 USD ≈ 55-60 PHP
 * But we use the coin_to_usd_rate setting
 */
export async function usdToCoins(usd: number): Promise<number> {
  const coinToUsdRate = await db.getCoinToUsdRate()
  // If rate is 55, then 1 USD = 55 coins (PHP)
  return usd * coinToUsdRate
}

/**
 * Get total coins allocated to all users (excluding admin)
 */
export async function getTotalAllocatedCoins(): Promise<number> {
  try {
    const users = await db.getAllNonAdminUsers()
    let total = 0
    
    for (const user of users) {
      const balance = await db.getCoinBalance(user.id)
      total += balance
    }
    
    return total
  } catch (error) {
    console.error('Error calculating total allocated coins:', error)
    return 0
  }
}

/**
 * Get admin's available balance for allocation
 * = Provider Balance (in PHP coins) - Total Allocated to Users
 */
export async function getAdminAvailableBalance(): Promise<{
  providerBalance: number
  providerCurrency: string
  providerBalanceInCoins: number
  totalAllocated: number
  availableToAllocate: number
}> {
  const { balance: providerBalanceUsd, currency } = await getProviderBalance()
  const providerBalanceInCoins = await usdToCoins(providerBalanceUsd)
  const totalAllocated = await getTotalAllocatedCoins()
  const availableToAllocate = providerBalanceInCoins - totalAllocated
  
  return {
    providerBalance: providerBalanceUsd,
    providerCurrency: currency,
    providerBalanceInCoins,
    totalAllocated,
    availableToAllocate: Math.max(0, availableToAllocate) // Never negative
  }
}

/**
 * Check if admin can allocate a certain amount
 */
export async function canAdminAllocate(amount: number): Promise<boolean> {
  const { availableToAllocate } = await getAdminAvailableBalance()
  return availableToAllocate >= amount
}

