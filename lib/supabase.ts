import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

