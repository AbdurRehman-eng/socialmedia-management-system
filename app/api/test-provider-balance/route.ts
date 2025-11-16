import { NextResponse } from 'next/server'

const PROVIDER_URL = "https://viieagency.com/api/v2"
const API_KEY = "610aa8dc01d8e335e4651157209de139"

/**
 * Test endpoint to check provider balance
 * GET /api/test-provider-balance
 */
export async function GET() {
  try {
    const formData = new URLSearchParams()
    formData.append("key", API_KEY)
    formData.append("action", "balance")

    console.log('[Test Balance] Sending request to provider...')
    const response = await fetch(PROVIDER_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json" 
      },
      body: formData.toString(),
    })

    console.log(`[Test Balance] Response status: ${response.status}`)

    if (!response.ok) {
      const text = await response.text()
      console.error('[Test Balance] HTTP error:', text)
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${text}`
      }, { status: response.status })
    }

    const text = await response.text()
    console.log('[Test Balance] Raw response:', text)
    
    const data = JSON.parse(text)
    console.log('[Test Balance] Parsed data:', data)

    const balanceAmount = parseFloat(data.balance)
    
    // Example conversions with different USD to PHP rates
    const conversions = [45, 50, 55, 56].map(rate => ({
      rate,
      php: balanceAmount * rate
    }))

    return NextResponse.json({
      success: true,
      provider_response: {
        balance: data.balance,
        currency: data.currency,
        balance_numeric: balanceAmount
      },
      example_conversions: conversions,
      note: "The USD to PHP rate can be configured by admin. Current default is 50."
    })

  } catch (error: any) {
    console.error('[Test Balance] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      stack: error.stack
    }, { status: 500 })
  }
}

