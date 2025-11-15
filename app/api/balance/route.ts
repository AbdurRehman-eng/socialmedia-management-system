import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserIdFromCookies } from '@/lib/db'
import * as db from '@/lib/db'

// Get user's coin balance
export async function GET() {
  try {
    const userId = await getCurrentUserIdFromCookies()
    const balance = await db.getCoinBalance(userId)
    
    return NextResponse.json({ balance })
  } catch (error) {
    console.error('Get balance error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    )
  }
}

// Update user's coin balance
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserIdFromCookies()
    const body = await request.json()
    const { amount } = body

    if (typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Amount must be a number' },
        { status: 400 }
      )
    }

    await db.addCoins(amount, userId)
    const newBalance = await db.getCoinBalance(userId)
    
    return NextResponse.json({ balance: newBalance })
  } catch (error) {
    console.error('Update balance error:', error)
    return NextResponse.json(
      { error: 'Failed to update balance' },
      { status: 500 }
    )
  }
}

