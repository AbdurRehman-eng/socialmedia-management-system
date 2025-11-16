import { NextRequest, NextResponse } from 'next/server'

const PROVIDER_URL = "https://viieagency.com/api/v2"
const API_KEY = "610aa8dc01d8e335e4651157209de139"

// Debug endpoint to fetch a specific service details
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const serviceId = searchParams.get('id')

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 })
    }

    // Fetch all services from provider
    const formData = new URLSearchParams()
    formData.append("key", API_KEY)
    formData.append("action", "services")

    const res = await fetch(PROVIDER_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json" 
      },
      body: formData.toString(),
      cache: "no-store",
    })

    const services = await res.json()
    
    if (!Array.isArray(services)) {
      return NextResponse.json({ error: 'Invalid response from provider' }, { status: 500 })
    }

    // Find the specific service
    const service = services.find((s: any) => String(s.service) === String(serviceId))

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      service: service,
      debugInfo: {
        serviceId: service.service,
        name: service.name,
        min: service.min,
        max: service.max,
        minType: typeof service.min,
        maxType: typeof service.max,
        rate: service.rate,
        type: service.type
      }
    })

  } catch (error: any) {
    console.error('[API /api/debug/service] Error:', error)
    return NextResponse.json(
      { error: error?.message || "Internal error" },
      { status: 500 }
    )
  }
}

