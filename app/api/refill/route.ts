import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserIdFromCookies } from '@/lib/db'
import * as db from '@/lib/db'
import * as coins from '@/lib/coins'

const PROVIDER_API_URL = process.env.SMM_PROVIDER_API_URL
const PROVIDER_API_KEY = process.env.SMM_PROVIDER_API_KEY

if (!PROVIDER_API_URL || !PROVIDER_API_KEY) {
  console.error('Missing required environment variables: SMM_PROVIDER_API_URL or SMM_PROVIDER_API_KEY')
}

// Create a refill for an order
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserIdFromCookies()
    console.log('[API /api/refill POST] Creating refill for user:', userId)
    
    const body = await request.json()
    const { orderId } = body

    if (!orderId || typeof orderId !== 'number') {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      )
    }

    // Get the order from database
    const order = await db.getOrderByOrderId(orderId, userId)
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or does not belong to you' },
        { status: 404 }
      )
    }

    // Check if order is completed (refills only work for completed orders)
    if (order.status?.toLowerCase() !== 'completed') {
      return NextResponse.json(
        { error: 'Only completed orders can be refilled' },
        { status: 400 }
      )
    }

    // Check if user has enough coins (charge same as original order)
    const refillCost = Number(order.cost_coins)
    const userBalance = await coins.getCoinBalance(userId)
    
    if (userBalance < refillCost) {
      return NextResponse.json(
        { error: `Insufficient balance. Refill costs ${refillCost} coins, but you only have ${userBalance} coins` },
        { status: 400 }
      )
    }

    // Call SMM provider API to create refill
    const providerParams = new URLSearchParams({
      key: PROVIDER_API_KEY!,
      action: 'refill',
      order: String(orderId),
    })

    console.log('[API /api/refill] Calling provider API for order:', orderId)
    
    const response = await fetch(`${PROVIDER_API_URL}?${providerParams}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (!response.ok) {
      throw new Error(`Provider API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('[API /api/refill] Provider response:', data)

    // Check if refill was successful
    if (data.refill && typeof data.refill === 'object' && 'error' in data.refill) {
      return NextResponse.json(
        { error: data.refill.error },
        { status: 400 }
      )
    }

    if (!data.refill) {
      return NextResponse.json(
        { error: 'Failed to create refill' },
        { status: 400 }
      )
    }

    // Deduct coins from user balance
    const deductSuccess = await coins.deductCoins(refillCost, userId)
    if (!deductSuccess) {
      console.error('[API /api/refill] Failed to deduct coins (race condition?)')
      return NextResponse.json(
        { error: 'Failed to deduct coins. Please try again.' },
        { status: 500 }
      )
    }

    console.log('[API /api/refill] Refill created successfully:', data.refill, 'Cost:', refillCost)

    return NextResponse.json({
      success: true,
      refill: data.refill,
      cost: refillCost,
      newBalance: userBalance - refillCost
    })

  } catch (error) {
    console.error('[API /api/refill] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create refill' },
      { status: 500 }
    )
  }
}

