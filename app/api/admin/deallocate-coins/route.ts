import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import * as db from '@/lib/db'

/**
 * Deallocate coins from a user
 * POST /api/admin/deallocate-coins
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

    if (!userId || (typeof userId === 'string' && userId.trim() === '')) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Handle both number and string inputs
    const amountNum = typeof amount === 'number' ? amount : parseFloat(amount)
    
    if (typeof amountNum !== 'number' || isNaN(amountNum) || !isFinite(amountNum)) {
      return NextResponse.json(
        { error: 'Amount must be a valid number' },
        { status: 400 }
      )
    }

    if (amountNum <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Get user's current balance to check if deallocation is possible
    const currentBalance = await db.getCoinBalance(userId)
    
    if (currentBalance < amountNum) {
      return NextResponse.json(
        { 
          error: `Insufficient user balance. User has ₱${currentBalance.toFixed(2)} but you tried to deallocate ₱${amountNum.toFixed(2)}`,
          currentBalance 
        },
        { status: 400 }
      )
    }

    // Admin can deallocate any amount (up to user's current balance)
    // Deallocate coins directly from user (no addition to admin balance)
    const newUserBalance = await db.deallocateCoinsFromUser(userId, amountNum)

    const newAdminBalance = await db.getCoinBalance(session.id)

    return NextResponse.json({
      success: true,
      adminBalance: newAdminBalance,
      userBalance: newUserBalance,
      amountDeallocated: amountNum,
    })
  } catch (error) {
    console.error('Deallocate coins error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

