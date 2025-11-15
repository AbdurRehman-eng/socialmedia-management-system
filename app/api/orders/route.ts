import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserIdFromCookies } from '@/lib/db'
import * as db from '@/lib/db'

// Get user's orders
export async function GET() {
  try {
    const userId = await getCurrentUserIdFromCookies()
    console.log('[API /api/orders GET] Fetching orders for user:', userId)
    const orders = await db.getOrders(userId)
    console.log('[API /api/orders GET] Found orders:', orders.length)
    
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// Create a new order
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserIdFromCookies()
    console.log('[API /api/orders POST] Creating order for user:', userId)
    const body = await request.json()
    const { orderId, serviceId, serviceName, link, quantity, costCoins } = body

    if (!orderId || !serviceId === undefined || !link || !quantity || !costCoins === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const order = await db.createOrder({
      orderId,
      serviceId,
      serviceName,
      link,
      quantity,
      costCoins,
      userId
    })
    
    console.log('[API /api/orders POST] Order created:', order.id, 'for user:', userId)

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

