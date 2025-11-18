// Client-side API client calls our Next.js server route to avoid exposing the provider API key
const API_URL = "/api/smm"

export interface Service {
  service: number
  name: string
  type: string
  category: string
  rate: string
  min: string
  max: string
  refill: boolean
  cancel: boolean
}

export interface OrderResponse {
  order: number
}

export interface OrderStatus {
  charge?: string
  start_count?: string
  status?: string
  remains?: string
  currency?: string
  error?: string
}

export interface MultipleOrderStatus {
  [orderId: string]: OrderStatus
}

export interface RefillResponse {
  refill?: number | { error: string }
  order?: number
}

export interface RefillStatus {
  status?: string | { error: string }
  refill?: number
}

export interface BalanceResponse {
  balance: string
  currency: string
}

export interface CancelResponse {
  order: number
  cancel: number | { error: string }
}

class SMMApiClient {
  private async makeRequest(params: Record<string, string | number>): Promise<any> {
    try {
      console.log('[SMMApiClient] Making request with params:', params)
      console.log('[SMMApiClient] Params breakdown:', {
        action: params.action,
        service: params.service,
        link: params.link,
        quantity: params.quantity,
        quantityType: typeof params.quantity,
        quantityValue: params.quantity
      })
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        console.error('[SMMApiClient] HTTP error! status:', response.status)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('[SMMApiClient] Response data:', data)
      
      // Check if provider returned an error
      if (data && data.error) {
        console.error('[SMMApiClient] ❌ PROVIDER ERROR DETECTED ❌')
        console.error('[SMMApiClient] Error message:', data.error)
        console.error('[SMMApiClient] Request that caused error:', {
          action: params.action,
          service: params.service,
          quantity: params.quantity,
          quantityType: typeof params.quantity
        })
        
        // Enhanced debugging for quantity errors
        if (data.error.toLowerCase().includes('quantity') || data.error.toLowerCase().includes('minimal')) {
          console.error('[SMMApiClient] 🔍 QUANTITY ERROR ANALYSIS:')
          console.error('  - Quantity sent:', params.quantity, `(type: ${typeof params.quantity})`)
          console.error('  - Service ID:', params.service)
          console.error('  - Error message:', data.error)
          console.error('  - Full request params:', JSON.stringify(params, null, 2))
          console.error('  - Full response:', JSON.stringify(data, null, 2))
        }
        
        throw new Error(`Provider error: ${data.error}`)
      }
      
      return data
    } catch (error) {
      console.error('[SMMApiClient] API request failed:', error)
      throw error
    }
  }

  async getServices(): Promise<Service[]> {
    const data = await this.makeRequest({ action: "services" })
    return Array.isArray(data) ? data : []
  }

  async addOrder(params: {
    service: number
    link: string
    quantity: number
    runs?: number
    interval?: number
  }): Promise<OrderResponse> {
    const requestParams: Record<string, string | number> = {
      action: "add",
      service: params.service,
      link: params.link,
      quantity: params.quantity,
    }

    if (params.runs) requestParams.runs = params.runs
    if (params.interval) requestParams.interval = params.interval

    return await this.makeRequest(requestParams)
  }

  async addCustomCommentsOrder(params: {
    service: number
    link: string
    comments: string
  }): Promise<OrderResponse> {
    const requestParams: Record<string, string | number> = {
      action: "add",
      service: params.service,
      link: params.link,
      comments: params.comments, // Comments list separated by \r\n or \n
    }

    return await this.makeRequest(requestParams)
  }

  async getOrderStatus(orderId: number): Promise<OrderStatus> {
    return await this.makeRequest({ action: "status", order: orderId })
  }

  async getMultipleOrderStatus(orderIds: number[]): Promise<MultipleOrderStatus> {
    const ordersString = orderIds.join(",")
    return await this.makeRequest({ action: "status", orders: ordersString })
  }

  async createRefill(orderId: number): Promise<RefillResponse> {
    return await this.makeRequest({ action: "refill", order: orderId })
  }

  async createMultipleRefill(orderIds: number[]): Promise<RefillResponse[]> {
    const ordersString = orderIds.join(",")
    return await this.makeRequest({ action: "refill", orders: ordersString })
  }

  async getRefillStatus(refillId: number): Promise<RefillStatus> {
    return await this.makeRequest({ action: "refill_status", refill: refillId })
  }

  async getMultipleRefillStatus(refillIds: number[]): Promise<RefillStatus[]> {
    const refillsString = refillIds.join(",")
    return await this.makeRequest({ action: "refill_status", refills: refillsString })
  }

  async cancelOrders(orderIds: number[]): Promise<CancelResponse[]> {
    const ordersString = orderIds.join(",")
    return await this.makeRequest({ action: "cancel", orders: ordersString })
  }

  async getBalance(): Promise<BalanceResponse> {
    return await this.makeRequest({ action: "balance" })
  }
}

export const smmApi = new SMMApiClient()

