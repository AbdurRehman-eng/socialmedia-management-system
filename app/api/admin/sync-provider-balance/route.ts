import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import * as db from '@/lib/db'

const PROVIDER_URL = "https://viieagency.com/api/v2"
const API_KEY = "610aa8dc01d8e335e4651157209de139"

/**
 * Sync admin balance from provider API
 * GET /api/admin/sync-provider-balance
 * 
 * This endpoint:
 * 1. Fetches the real balance from the SMM provider
 * 2. Converts USD to PHP (coins)
 * 3. Updates the admin's coin balance in the database
 */
export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // Fetch balance from provider
    const formData = new URLSearchParams()
    formData.append("key", API_KEY)
    formData.append("action", "balance")

    const response = await fetch(PROVIDER_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json" 
      },
      body: formData.toString(),
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch provider balance' },
        { status: 502 }
      )
    }

    const data = await response.json()
    const providerBalanceUSD = parseFloat(data.balance)
    const currency = data.currency

    if (isNaN(providerBalanceUSD)) {
      return NextResponse.json(
        { error: 'Invalid balance from provider' },
        { status: 502 }
      )
    }

    // Get conversion rate (default: 1 USD = 50 PHP, configurable)
    const usdToPhpRate = await db.getSetting('usd_to_php_rate', '50')
    const phpRate = parseFloat(usdToPhpRate)

    // Convert USD to PHP (coins)
    // Example: $100.84 USD × 50 = ₱5,042 coins
    const coinsInPhp = providerBalanceUSD * phpRate

    // Update admin's balance
    await db.setCoinBalance(coinsInPhp, session.id)

    return NextResponse.json({
      success: true,
      providerBalance: {
        amount: providerBalanceUSD,
        currency: currency,
      },
      conversionRate: phpRate,
      adminCoins: coinsInPhp,
      message: `Synced: $${providerBalanceUSD.toFixed(2)} ${currency} → ₱${coinsInPhp.toFixed(2)} coins (rate: 1 USD = ${phpRate} PHP)`
    })
  } catch (error) {
    console.error('Sync provider balance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

