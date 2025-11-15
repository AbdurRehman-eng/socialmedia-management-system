// Database service layer for Supabase operations
import { supabase, type CoinBalance, type PricingRule, type Order, type Setting } from './supabase'

// Default user ID for single-user mode (before implementing auth)
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'

function debugLog(...args: unknown[]) {
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('[DB]', ...args)
  }
}

/**
 * Get current user ID from session (server-side only)
 * This should only be called from API routes or server components
 */
export async function getCurrentUserIdFromCookies(): Promise<string> {
  // This function should only be called server-side
  if (typeof window !== 'undefined') {
    throw new Error('getCurrentUserIdFromCookies can only be called server-side')
  }
  
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('smm_session')
    
    if (sessionCookie && sessionCookie.value) {
      try {
        const user = JSON.parse(sessionCookie.value)
        if (user && user.id) {
          debugLog('User ID from session:', user.id)
          return user.id
        }
      } catch (parseError) {
        debugLog('Error parsing session cookie:', parseError)
      }
    }
  } catch (error) {
    debugLog('Error getting user from session:', error)
  }
  
  // Fallback to default user ID if no session
  debugLog('No valid session found, using DEFAULT_USER_ID')
  return DEFAULT_USER_ID
}

/**
 * Get or create default user (legacy support)
 */
async function getDefaultUserId(): Promise<string> {
  // Return default user ID for now
  // API routes will pass the correct userId from session
  return DEFAULT_USER_ID
}

// ==================== COIN BALANCE ====================

export async function getCoinBalance(userId?: string): Promise<number> {
  const uid = userId || await getDefaultUserId()
  
  const { data, error } = await supabase
    .from('coin_balances')
    .select('coins')
    .eq('user_id', uid)
    .maybeSingle()

  // If no balance exists (null data or PGRST116 error), create one with default
  if (!data || error?.code === 'PGRST116') {
    try {
      const { data: newBalance, error: insertError } = await supabase
        .from('coin_balances')
        .insert({ user_id: uid, coins: 1000.00 })
        .select('coins')
        .single()
      
      if (insertError) {
        // If insert fails (maybe due to constraint), try to fetch again
        const { data: retryData } = await supabase
          .from('coin_balances')
          .select('coins')
          .eq('user_id', uid)
          .maybeSingle()
        return Number(retryData?.coins) || 1000.00
      }
      
      return Number(newBalance?.coins) || 1000.00
    } catch (err) {
      debugLog('Error creating coin balance:', err)
      return 1000.00 // Default fallback
    }
  }

  if (error) {
    debugLog('Error fetching coin balance:', error)
    return 1000.00 // Default fallback
  }

  return Number(data?.coins) || 1000.00
}

export async function setCoinBalance(coins: number, userId?: string): Promise<void> {
  const uid = userId || await getDefaultUserId()
  
  const { error } = await supabase
    .from('coin_balances')
    .upsert({ user_id: uid, coins }, { onConflict: 'user_id' })

  if (error) {
    debugLog('Error setting coin balance:', error)
    throw error
  }
}

export async function addCoins(amount: number, userId?: string): Promise<number> {
  const current = await getCoinBalance(userId)
  const newBalance = current + amount
  await setCoinBalance(newBalance, userId)
  return newBalance
}

export async function deductCoins(amount: number, userId?: string): Promise<boolean> {
  const current = await getCoinBalance(userId)
  if (current < amount) {
    return false
  }
  await setCoinBalance(current - amount, userId)
  return true
}

// ==================== SETTINGS ====================

export async function getSetting(key: string, defaultValue: string): Promise<string> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()

  // If no setting exists, create one with default value
  if (!data || error?.code === 'PGRST116') {
    try {
      const { error: insertError } = await supabase
        .from('settings')
        .insert({ key, value: defaultValue })
      
      if (insertError) {
        // If insert fails (maybe due to race condition), try to fetch again
        const { data: retryData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', key)
          .maybeSingle()
        return retryData?.value || defaultValue
      }
      
      return defaultValue
    } catch (err) {
      debugLog('Error creating setting:', err)
      return defaultValue
    }
  }

  if (error) {
    debugLog('Error fetching setting:', error)
    return defaultValue
  }

  return data.value || defaultValue
}

export async function setSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' })

  if (error) {
    debugLog('Error setting setting:', error)
    throw error
  }
}

export async function getDefaultMarkup(): Promise<number> {
  const value = await getSetting('default_markup', '1.2')
  return Number(value) || 1.2
}

export async function setDefaultMarkup(markup: number): Promise<void> {
  await setSetting('default_markup', String(markup))
}

export async function getCoinToUsdRate(): Promise<number> {
  const value = await getSetting('coin_to_usd_rate', '1')
  return Number(value) || 1
}

export async function setCoinToUsdRate(rate: number): Promise<void> {
  await setSetting('coin_to_usd_rate', String(rate))
}

// ==================== PRICING RULES ====================

export async function getPricingRules(): Promise<Record<number, PricingRule>> {
  const { data, error } = await supabase
    .from('pricing_rules')
    .select('*')

  if (error) {
    debugLog('Error fetching pricing rules:', error)
    return {}
  }

  const rules: Record<number, PricingRule> = {}
  data?.forEach((rule) => {
    rules[rule.service_id] = {
      serviceId: rule.service_id,
      markup: rule.markup ? Number(rule.markup) : undefined,
      customPrice: rule.custom_price ? Number(rule.custom_price) : undefined,
    }
  })

  return rules
}

export async function getPricingRule(serviceId: number): Promise<{ serviceId: number; markup?: number; customPrice?: number } | null> {
  const { data, error } = await supabase
    .from('pricing_rules')
    .select('*')
    .eq('service_id', serviceId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    debugLog('Error fetching pricing rule:', error)
    return null
  }

  if (!data) {
    return null
  }

  return {
    serviceId: data.service_id,
    markup: data.markup ? Number(data.markup) : undefined,
    customPrice: data.custom_price ? Number(data.custom_price) : undefined,
  }
}

export async function setPricingRule(serviceId: number, rule: { markup?: number; customPrice?: number }): Promise<void> {
  const { error } = await supabase
    .from('pricing_rules')
    .upsert({
      service_id: serviceId,
      markup: rule.markup || null,
      custom_price: rule.customPrice || null,
    }, { onConflict: 'service_id' })

  if (error) {
    debugLog('Error setting pricing rule:', error)
    throw error
  }
}

export async function deletePricingRule(serviceId: number): Promise<void> {
  const { error } = await supabase
    .from('pricing_rules')
    .delete()
    .eq('service_id', serviceId)

  if (error) {
    debugLog('Error deleting pricing rule:', error)
    throw error
  }
}

// ==================== ORDERS ====================

export async function getOrders(userId?: string): Promise<Order[]> {
  const uid = userId || await getDefaultUserId()
  
  // First, try to get orders with matching user_id
  let { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })

  // If no orders found or error, also check for orders with NULL user_id (backward compatibility)
  if ((!data || data.length === 0 || error) && !userId) {
    const { data: nullUserData, error: nullUserError } = await supabase
      .from('orders')
      .select('*')
      .is('user_id', null)
      .order('created_at', { ascending: false })
    
    if (nullUserData && nullUserData.length > 0) {
      // Update these orders to have the default user_id
      const orderIds = nullUserData.map(o => o.id)
      await supabase
        .from('orders')
        .update({ user_id: uid })
        .in('id', orderIds)
      
      data = nullUserData
      error = null
    } else if (nullUserError) {
      debugLog('Error fetching orders with null user_id:', nullUserError)
    }
  }

  if (error) {
    debugLog('Error fetching orders:', error)
    return []
  }

  return data || []
}

export async function getOrderIds(userId?: string): Promise<number[]> {
  const orders = await getOrders(userId)
  return orders.map((o) => o.order_id)
}

export async function createOrder(orderData: {
  orderId: number
  serviceId: number
  serviceName?: string
  link: string
  quantity: number
  costCoins: number
  userId?: string
}): Promise<Order> {
  const uid = orderData.userId || await getDefaultUserId()
  
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: uid,
      order_id: orderData.orderId,
      service_id: orderData.serviceId,
      service_name: orderData.serviceName,
      link: orderData.link,
      quantity: orderData.quantity,
      cost_coins: orderData.costCoins,
    })
    .select()
    .single()

  if (error) {
    debugLog('Error creating order:', error)
    throw error
  }

  return data
}

export async function updateOrderStatus(
  orderId: number,
  status: {
    status?: string
    charge?: string
    start_count?: string
    remains?: string
    currency?: string
  },
  userId?: string
): Promise<void> {
  const uid = userId || await getDefaultUserId()
  
  const { error } = await supabase
    .from('orders')
    .update({
      status: status.status,
      charge: status.charge,
      start_count: status.start_count,
      remains: status.remains,
      currency: status.currency,
    })
    .eq('order_id', orderId)
    .eq('user_id', uid)

  if (error) {
    debugLog('Error updating order status:', error)
    throw error
  }
}

