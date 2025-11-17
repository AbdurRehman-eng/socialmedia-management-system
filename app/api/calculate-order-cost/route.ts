import { NextRequest, NextResponse } from 'next/server'
import { calculateOrderCost } from '@/lib/coins'

/**
 * Calculate the total cost for an order
 * POST /api/calculate-order-cost
 * 
 * Body: {
 *   providerRateInUsdPerUnit: number,
 *   quantity: number,
 *   serviceId: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { providerRateInUsdPerUnit, quantity, serviceId } = body

    if (
      providerRateInUsdPerUnit === undefined ||
      quantity === undefined ||
      serviceId === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing required fields: providerRateInUsdPerUnit, quantity, serviceId' },
        { status: 400 }
      )
    }

    const cost = await calculateOrderCost(
      Number(providerRateInUsdPerUnit),
      Number(quantity),
      Number(serviceId)
    )

    return NextResponse.json({ cost })
  } catch (error) {
    console.error('Error calculating order cost:', error)
    return NextResponse.json(
      { error: 'Failed to calculate order cost', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

