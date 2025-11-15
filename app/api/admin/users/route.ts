import { NextRequest, NextResponse } from 'next/server'
import { getSession, getAllUsers, createUser } from '@/lib/auth'

// Get all users (admin only)
export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const users = await getAllUsers()
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create a new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email, username, password } = body

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, username, and password are required' },
        { status: 400 }
      )
    }

    const result = await createUser({
      email,
      username,
      password,
      role: 'user',
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create user' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      userId: result.userId,
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

