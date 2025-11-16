// Authentication utilities
import { supabase } from './supabase'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export interface AuthUser {
  id: string
  email: string
  username: string
  role: 'user' | 'admin'
  isActive: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

// Simple session storage key
const SESSION_COOKIE_NAME = 'smm_session'

/**
 * Hash a password using a simple method
 * In production, you should use bcrypt or similar
 */
export async function hashPassword(password: string): Promise<string> {
  // For demo purposes, we'll use a simple base64 encoding
  // In production, use bcrypt: npm install bcrypt
  return Buffer.from(password).toString('base64')
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

/**
 * Login user with username and password
 */
export async function login(credentials: LoginCredentials, role: 'user' | 'admin'): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', credentials.username)
    .eq('role', role)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data) {
    console.error('Login error:', error)
    return null
  }

  // Verify password
  const isValid = await verifyPassword(credentials.password, data.password_hash)
  if (!isValid) {
    return null
  }

  const user: AuthUser = {
    id: data.id,
    email: data.email,
    username: data.username,
    role: data.role,
    isActive: data.is_active,
  }

  return user
}

/**
 * Create a new user (admin only)
 */
export async function createUser(userData: {
  email: string
  username: string
  password: string
  role?: 'user' | 'admin'
}): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const passwordHash = await hashPassword(userData.password)

    const { data, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        username: userData.username,
        password_hash: passwordHash,
        role: userData.role || 'user',
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Create default coin balance for the user (starts at 0, admin will allocate)
    await supabase
      .from('coin_balances')
      .insert({
        user_id: data.id,
        coins: 0.00,
      })

    return { success: true, userId: data.id }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  try {
    const passwordHash = await hashPassword(newPassword)

    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', userId)

    return !error
  } catch {
    return false
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<AuthUser[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, username, role, is_active')
    .order('created_at', { ascending: false })

  if (error || !data) {
    return []
  }

  return data.map((user) => ({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    isActive: user.is_active,
  }))
}

/**
 * Get all users with their coin balances (admin only)
 */
export async function getAllUsersWithBalances(): Promise<(AuthUser & { balance: number })[]> {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      username,
      role,
      is_active,
      coin_balances (
        coins
      )
    `)
    .order('created_at', { ascending: false })

  if (error || !data) {
    return []
  }

  return data.map((user: any) => ({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    isActive: user.is_active,
    balance: user.coin_balances?.[0]?.coins || 0,
  }))
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(userId: string, isActive: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', userId)

    return !error
  } catch {
    return false
  }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    return !error
  } catch {
    return false
  }
}

/**
 * Set session cookie (server-side)
 */
export async function setSessionCookie(user: AuthUser): Promise<void> {
  const cookieStore = await cookies()
  const sessionData = JSON.stringify(user)
  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

/**
 * Get session from cookie (server-side)
 */
export async function getSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    
    if (!sessionCookie || !sessionCookie.value) {
      return null
    }

    const user = JSON.parse(sessionCookie.value) as AuthUser
    return user
  } catch {
    return null
  }
}

/**
 * Clear session cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Get session from request (for API routes)
 */
export function getSessionFromRequest(request: NextRequest): AuthUser | null {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)
    
    if (!sessionCookie || !sessionCookie.value) {
      return null
    }

    const user = JSON.parse(sessionCookie.value) as AuthUser
    return user
  } catch {
    return null
  }
}

