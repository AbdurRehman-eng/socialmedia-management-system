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
    console.log('[API /api/orders POST] Request body:', JSON.stringify(body, null, 2))
    
    const { orderId, serviceId, serviceName, link, quantity, costCoins } = body

    // Detailed field validation with logging
    const missingFields: string[] = []
    if (!orderId && orderId !== 0) {
      missingFields.push('orderId')
      console.log('[API /api/orders POST] Missing: orderId')
    }
    if (serviceId === undefined || serviceId === null) {
      missingFields.push('serviceId')
      console.log('[API /api/orders POST] Missing: serviceId')
    }
    if (!link) {
      missingFields.push('link')
      console.log('[API /api/orders POST] Missing: link')
    }
    if (!quantity && quantity !== 0) {
      missingFields.push('quantity')
      console.log('[API /api/orders POST] Missing: quantity')
    }
    if (costCoins === undefined || costCoins === null) {
      missingFields.push('costCoins')
      console.log('[API /api/orders POST] Missing: costCoins')
    }

    if (missingFields.length > 0) {
      console.log('[API /api/orders POST] Validation failed. Missing fields:', missingFields)
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missingFields: missingFields,
          receivedData: {
            orderId,
            serviceId,
            serviceName,
            link,
            quantity,
            costCoins
          }
        },
        { status: 400 }
      )
    }

    console.log('[API /api/orders POST] All fields validated. Creating order...')

    const order = await db.createOrder({
      orderId,
      serviceId,
      serviceName,
      link,
      quantity,
      costCoins,
      userId
    })
    
    console.log('[API /api/orders POST] Order created successfully:', order.id, 'for user:', userId)

    return NextResponse.json({ order })
  } catch (error) {
    console.error('[API /api/orders POST] Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

