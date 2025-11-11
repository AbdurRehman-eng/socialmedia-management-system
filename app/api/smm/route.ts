import { NextResponse } from "next/server"

const PROVIDER_URL = "https://viieagency.com/api/v2"
const API_KEY = "610aa8dc01d8e335e4651157209de139"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const params = await request.json() as Record<string, string | number>

    const formData = new URLSearchParams()
    formData.append("key", API_KEY)
    for (const [k, v] of Object.entries(params)) {
      formData.append(k, String(v))
    }

    const res = await fetch(PROVIDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
      body: formData.toString(),
      cache: "no-store",
    })

    const text = await res.text()
    let data: any
    try {
      data = JSON.parse(text)
    } catch {
      // Provider sometimes responds with non-JSON; wrap as error
      return NextResponse.json({ error: "Invalid JSON from provider", raw: text }, { status: 502 })
    }

    return NextResponse.json(data, { status: res.ok ? 200 : res.status })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 })
  }
}


