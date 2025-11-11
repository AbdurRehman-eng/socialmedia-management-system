import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a dummy client for build time if env vars are missing
// This prevents build errors, but actual operations will fail at runtime if vars are missing
let supabaseInstance: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      // Create a dummy client for build time
      // This will fail at runtime, but allows the build to complete
      supabaseInstance = createClient('https://placeholder.supabase.co', 'placeholder-key')
    } else {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
    }
  }
  return supabaseInstance
}

export const supabase = getSupabaseClient()

// Database types
export interface User {
  id: string
  email?: string
  created_at: string
  updated_at: string
}

export interface CoinBalance {
  id: string
  user_id: string
  coins: number
  created_at: string
  updated_at: string
}

export interface PricingRule {
  id: string
  service_id: number
  markup?: number
  custom_price?: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  order_id: number
  service_id: number
  service_name?: string
  link: string
  quantity: number
  cost_coins: number
  status?: string
  charge?: string
  start_count?: string
  remains?: string
  currency?: string
  created_at: string
  updated_at: string
}

export interface Setting {
  id: string
  key: string
  value: string
  created_at: string
  updated_at: string
}

