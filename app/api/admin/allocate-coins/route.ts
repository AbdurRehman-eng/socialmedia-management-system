import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import * as db from '@/lib/db'

/**
 * Allocate coins from admin to a user
 * POST /api/admin/allocate-coins
 * Body: { userId: string, amount: number }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, amount } = body

    if (!userId || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'User ID and amount are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Get admin's current balance
    const adminBalance = await db.getCoinBalance(session.id)

    if (adminBalance < amount) {
      return NextResponse.json(
        { 
          error: `Insufficient balance. You have ₱${adminBalance.toFixed(2)} but tried to allocate ₱${amount.toFixed(2)}`,
          adminBalance 
        },
        { status: 400 }
      )
    }

    // Transfer coins: deduct from admin, add to user
    const success = await db.transferCoins(session.id, userId, amount)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to transfer coins' },
        { status: 500 }
      )
    }

    const newAdminBalance = await db.getCoinBalance(session.id)
    const newUserBalance = await db.getCoinBalance(userId)

    return NextResponse.json({
      success: true,
      adminBalance: newAdminBalance,
      userBalance: newUserBalance,
      amountTransferred: amount,
    })
  } catch (error) {
    console.error('Allocate coins error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

