import { NextRequest, NextResponse } from 'next/server'
import { login, setSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, role } = body

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Username, password, and role are required' },
        { status: 400 }
      )
    }

    if (role !== 'user' && role !== 'admin') {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const user = await login({ username, password }, role)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    await setSessionCookie(user)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

