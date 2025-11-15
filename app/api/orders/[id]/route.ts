import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserIdFromCookies } from '@/lib/db'
import * as db from '@/lib/db'

// Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserIdFromCookies()
    const { id } = await params
    const orderId = Number(id)
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      )
    }

    const body = await request.json()

    await db.updateOrderStatus(orderId, body, userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

