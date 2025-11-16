import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import * as db from '@/lib/db'

/**
 * Get USD to PHP conversion rate
 * GET /api/admin/settings/usd-to-php-rate
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

    // Get current rate from database (default: 50)
    const rateString = await db.getSetting('usd_to_php_rate', '50')
    const rate = parseFloat(rateString)

    return NextResponse.json({
      success: true,
      rate: rate,
    })
  } catch (error) {
    console.error('Get USD to PHP rate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Set USD to PHP conversion rate
 * POST /api/admin/settings/usd-to-php-rate
 * Body: { rate: number }
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
    const { rate } = body

    if (typeof rate !== 'number' || rate <= 0) {
      return NextResponse.json(
        { error: 'Rate must be a positive number' },
        { status: 400 }
      )
    }

    // Save rate to database
    await db.setSetting('usd_to_php_rate', String(rate))

    return NextResponse.json({
      success: true,
      rate: rate,
      message: `USD to PHP rate updated to ${rate}`,
    })
  } catch (error) {
    console.error('Set USD to PHP rate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

