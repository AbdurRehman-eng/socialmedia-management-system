import { NextResponse } from "next/server"

const PROVIDER_URL = "https://viieagency.com/api/v2"
const API_KEY = "610aa8dc01d8e335e4651157209de139"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const params = await request.json() as Record<string, string | number>
    console.log('[API /api/smm] Request params:', params)
    console.log('[API /api/smm] Params types:', Object.entries(params).map(([k, v]) => `${k}: ${typeof v}`).join(', '))

    const formData = new URLSearchParams()
    formData.append("key", API_KEY)
    for (const [k, v] of Object.entries(params)) {
      // Ensure numeric values are properly formatted
      if (k === 'quantity' || k === 'service' || k === 'runs' || k === 'interval') {
        formData.append(k, String(Math.floor(Number(v))))
      } else {
        formData.append(k, String(v))
      }
    }

    console.log('[API /api/smm] Sending to provider:', PROVIDER_URL)
    console.log('[API /api/smm] FormData being sent:', formData.toString())
    console.log('[API /api/smm] FormData entries:', Array.from(formData.entries()))
    const res = await fetch(PROVIDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
      body: formData.toString(),
      cache: "no-store",
    })

    console.log('[API /api/smm] Provider response status:', res.status)
    const text = await res.text()
    console.log('[API /api/smm] Provider response text:', text)
    
    let data: any
    try {
      data = JSON.parse(text)
      console.log('[API /api/smm] Parsed provider data:', data)
    } catch {
      // Provider sometimes responds with non-JSON; wrap as error
      console.error('[API /api/smm] Failed to parse JSON from provider:', text)
      return NextResponse.json({ error: "Invalid JSON from provider", raw: text }, { status: 502 })
    }

    // Log if provider returned an error
    if (data && data.error) {
      console.error('[API /api/smm] ❌ PROVIDER RETURNED ERROR ❌')
      console.error('[API /api/smm] Error message:', data.error)
      
      // Enhanced debugging for quantity errors
      if (data.error.toLowerCase().includes('quantity') || data.error.toLowerCase().includes('minimal')) {
        console.error('[API /api/smm] 🔍 QUANTITY ERROR FROM PROVIDER:')
        console.error('  Request params:', params)
        console.error('  FormData sent:', Array.from(formData.entries()))
        console.error('  Provider error:', data.error)
        console.error('  Provider full response:', data)
        
        // Check what was actually sent for quantity
        if (params.quantity !== undefined) {
          console.error('  Quantity Analysis:')
          console.error('    - Original params.quantity:', params.quantity, `(type: ${typeof params.quantity})`)
          console.error('    - FormData quantity:', formData.get('quantity'))
          console.error('    - Service ID:', params.service)
        }
      }
    }

    return NextResponse.json(data, { status: res.ok ? 200 : res.status })
  } catch (error: any) {
    console.error('[API /api/smm] Exception:', error)
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 })
  }
}


