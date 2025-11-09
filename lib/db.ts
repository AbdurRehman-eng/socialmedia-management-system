// Database service layer for Supabase operations
import { supabase, type CoinBalance, type PricingRule, type Order, type Setting } from './supabase'

// Default user ID for single-user mode (before implementing auth)
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'

/**
 * Get or create default user
 */
async function getDefaultUserId(): Promise<string> {
  // For now, return default user ID
  // Later, this can be replaced with actual user authentication
  return DEFAULT_USER_ID
}

// ==================== COIN BALANCE ====================

export async function getCoinBalance(userId?: string): Promise<number> {
  const uid = userId || await getDefaultUserId()
  
  const { data, error } = await supabase
    .from('coin_balances')
    .select('coins')
    .eq('user_id', uid)
    .single()

  if (error) {
    // If no balance exists, create one with default
    if (error.code === 'PGRST116') {
      const { data: newBalance } = await supabase
        .from('coin_balances')
        .insert({ user_id: uid, coins: 1000.00 })
        .select('coins')
        .single()
      return newBalance?.coins || 1000.00
    }
    console.error('Error fetching coin balance:', error)
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
    console.error('Error setting coin balance:', error)
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
    .single()

  if (error || !data) {
    // Create default setting if it doesn't exist
    await supabase.from('settings').insert({ key, value: defaultValue })
    return defaultValue
  }

  return data.value
}

export async function setSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' })

  if (error) {
    console.error('Error setting setting:', error)
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
    console.error('Error fetching pricing rules:', error)
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
    .single()

  if (error || !data) {
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
    console.error('Error setting pricing rule:', error)
    throw error
  }
}

export async function deletePricingRule(serviceId: number): Promise<void> {
  const { error } = await supabase
    .from('pricing_rules')
    .delete()
    .eq('service_id', serviceId)

  if (error) {
    console.error('Error deleting pricing rule:', error)
    throw error
  }
}

// ==================== ORDERS ====================

export async function getOrders(userId?: string): Promise<Order[]> {
  const uid = userId || await getDefaultUserId()
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
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
    console.error('Error creating order:', error)
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
    console.error('Error updating order status:', error)
    throw error
  }
}

