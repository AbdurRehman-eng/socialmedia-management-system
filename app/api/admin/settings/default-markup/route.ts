import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import * as db from '@/lib/db'

/**
 * Get default markup
 * GET /api/admin/settings/default-markup
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

    // Get current markup from database (default: 1.5)
    const markupString = await db.getSetting('default_markup', '1.5')
    const markup = parseFloat(markupString)

    return NextResponse.json({
      success: true,
      markup: markup,
    })
  } catch (error) {
    console.error('Get default markup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Set default markup
 * POST /api/admin/settings/default-markup
 * Body: { markup: number }
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
    const { markup } = body

    if (typeof markup !== 'number' || markup <= 0) {
      return NextResponse.json(
        { error: 'Markup must be a positive number' },
        { status: 400 }
      )
    }

    // Save markup to database
    await db.setSetting('default_markup', String(markup))

    return NextResponse.json({
      success: true,
      markup: markup,
      message: `Default markup updated to ${markup}`,
    })
  } catch (error) {
    console.error('Set default markup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

