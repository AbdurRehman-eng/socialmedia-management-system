"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { smmApi, type Service } from "@/lib/api"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  calculateOrderCost,
  calculateCoinPrice,
  formatCoins,
} from "@/lib/coins"
import { useCoinBalance } from "@/hooks/use-coin-balance"

export default function CreateOrderForm({ onOrderSubmit }: { onOrderSubmit?: (order: any) => void }) {
  const searchParams = useSearchParams()
  const preselectedServiceId = searchParams.get("service")

  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    service: preselectedServiceId || "",
    link: "",
    quantity: "",
    keywords: "",
    runs: "",
    interval: "",
  })

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const { balance: coinBalance, refresh: refreshBalance } = useCoinBalance()
  const [cost, setCost] = useState(0)
  const [costLoading, setCostLoading] = useState(false)
  const [servicePrices, setServicePrices] = useState<Record<number, number>>({})

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true)
        const data = await smmApi.getServices()
        setServices(data)
        
        // Calculate prices for all services efficiently
        // Fetch pricing data once instead of for each service
        const prices: Record<number, number> = {}
        
        // Use a simple fallback calculation instead of fetching from DB for each service
        // This will be accurate enough for display purposes
        const defaultMarkup = 1.5 // 50% markup
        
        data.forEach((service) => {
          const providerRate = Number(service.rate)
          // Calculate with default markup (prices will be recalculated accurately on order submit)
          prices[service.service] = providerRate * defaultMarkup
        })
        
        setServicePrices(prices)
        
        // If service ID is preselected, find and set it
        if (preselectedServiceId) {
          const service = data.find(s => s.service === Number(preselectedServiceId))
          if (service) {
            setSelectedService(service)
            setFormData(prev => ({ ...prev, service: preselectedServiceId, category: service.category }))
          }
        }
      } catch (err) {
        console.error("Failed to fetch services:", err)
        toast.error("Failed to load services")
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [preselectedServiceId])

  // Update selected service when service ID changes
  useEffect(() => {
    if (formData.service) {
      const service = services.find(s => s.service === Number(formData.service))
      setSelectedService(service || null)
    } else {
      setSelectedService(null)
    }
  }, [formData.service, services])

  // Calculate cost when service or quantity changes
  useEffect(() => {
    async function calculateCost() {
      if (!selectedService || !formData.quantity) {
        setCost(0)
        return
      }
      setCostLoading(true)
      try {
        const quantity = Number(formData.quantity)
        const providerRate = Number(selectedService.rate)
        const calculatedCost = await calculateOrderCost(providerRate, quantity, selectedService.service)
        setCost(calculatedCost)
      } catch (error) {
        console.error("Error calculating cost:", error)
        setCost(0)
      } finally {
        setCostLoading(false)
      }
    }
    calculateCost()
  }, [selectedService, formData.quantity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.service || !formData.link || !formData.quantity) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!selectedService) {
      toast.error("Please select a service")
      return
    }

    const quantity = Number(formData.quantity)
    console.log('[CreateOrderForm] Quantity parsed:', quantity, 'Type:', typeof quantity)
    console.log('[CreateOrderForm] Service min:', selectedService.min, 'Type:', typeof selectedService.min)
    console.log('[CreateOrderForm] Service max:', selectedService.max, 'Type:', typeof selectedService.max)
    
    if (isNaN(quantity) || quantity < Number(selectedService.min) || quantity > Number(selectedService.max)) {
      toast.error(`Quantity must be between ${selectedService.min} and ${selectedService.max}`)
      return
    }

    // Check coin balance
    if (coinBalance < cost) {
      toast.error(`Insufficient coins. You need ${formatCoins(cost)} but only have ${formatCoins(coinBalance)}`)
      return
    }

    try {
      setSubmitting(true)
      
      // Deduct coins via API
      const deductResponse = await fetch('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deduct', amount: cost })
      })

      if (!deductResponse.ok) {
        toast.error("Failed to deduct coins. Please try again.")
        setSubmitting(false)
        return
      }

      refreshBalance() // Refresh balance display
      
      const orderParams: any = {
        service: Number(formData.service),
        link: formData.link,
        quantity: Number(quantity), // Ensure it's a number
      }
      
      console.log('[CreateOrderForm] Order params quantity:', orderParams.quantity, 'Type:', typeof orderParams.quantity)

      if (formData.runs) {
        orderParams.runs = Number(formData.runs)
      }
      if (formData.interval) {
        orderParams.interval = Number(formData.interval)
      }

      console.log('[CreateOrderForm] Submitting order to provider with params:', orderParams)
      console.log('[CreateOrderForm] Selected service details:', {
        id: selectedService.service,
        name: selectedService.name,
        min: selectedService.min,
        max: selectedService.max,
        minType: typeof selectedService.min,
        maxType: typeof selectedService.max
      })
      const response = await smmApi.addOrder(orderParams)
      console.log('[CreateOrderForm] Provider response:', response)
      
      // Validate provider response
      if (!response || !response.order) {
        console.error('[CreateOrderForm] Provider did not return order ID:', response)
        throw new Error('Provider failed to create order. Response: ' + JSON.stringify(response))
      }
      
      // Save order to Supabase via API
      const orderData = {
        orderId: response.order,
        serviceId: selectedService.service,
        serviceName: selectedService.name,
        link: formData.link,
        quantity: quantity,
        costCoins: cost,
      }
      
      console.log('[CreateOrderForm] Saving order to database:', orderData)
      
      const saveResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      
      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        console.error('[CreateOrderForm] Failed to save order:', errorData)
        throw new Error(errorData.error || 'Failed to save order to database')
      }
      
      console.log('[CreateOrderForm] Order saved successfully')
      
      toast.success(`Order created successfully! Order ID: ${response.order}. ${formatCoins(cost)} deducted.`)
      
      if (onOrderSubmit && selectedService) {
        onOrderSubmit({
          id: `#${response.order}`,
          service: selectedService.name,
          quantity: quantity,
          status: "Pending",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        })
      }

      // Reset form
      setFormData({
        category: "",
        service: "",
        link: "",
        quantity: "",
        keywords: "",
        runs: "",
        interval: "",
      })
      setSelectedService(null)
    } catch (err: any) {
      console.error('[CreateOrderForm] ❌ ORDER CREATION FAILED ❌')
      console.error('[CreateOrderForm] Error:', err)
      console.error('[CreateOrderForm] Error message:', err.message)
      
      // Enhanced debugging for quantity errors
      if (err.message && (err.message.toLowerCase().includes('quantity') || err.message.toLowerCase().includes('minimal'))) {
        console.error('[CreateOrderForm] 🔍 QUANTITY ERROR DEBUG:')
        console.error('  Service Info:')
        console.error('    - Service ID:', selectedService?.service || 'N/A')
        console.error('    - Service Name:', selectedService?.name || 'N/A')
        console.error('    - Min Required:', selectedService?.min || 'N/A', `(type: ${typeof selectedService?.min})`)
        console.error('    - Max Allowed:', selectedService?.max || 'N/A', `(type: ${typeof selectedService?.max})`)
        console.error('  Quantity Info:')
        console.error('    - Quantity Entered:', formData.quantity, `(type: ${typeof formData.quantity})`)
        console.error('    - Quantity Parsed:', quantity, `(type: ${typeof quantity})`)
        console.error('  Comparison:')
        console.error('    - formData.quantity:', formData.quantity)
        console.error('    - Number(formData.quantity):', Number(formData.quantity))
        console.error('    - selectedService.min:', selectedService?.min)
        console.error('    - Number(selectedService.min):', Number(selectedService?.min || 0))
        console.error('    - Is quantity >= min?', Number(formData.quantity) >= Number(selectedService?.min || 0))
        console.error('    - Is quantity > min?', Number(formData.quantity) > Number(selectedService?.min || 0))
        console.error('  🚨 IMPORTANT: Provider may require quantity > min (not >= min)')
        console.error('  Full Error:', err)
      }
      
      // Show detailed error message
      let errorMessage = "Failed to create order. Please try again."
      if (err.message) {
        errorMessage = err.message
      }
      
      // Add helpful hint for quantity errors
      if (err.message && (err.message.toLowerCase().includes('quantity') || err.message.toLowerCase().includes('minimal'))) {
        if (selectedService && Number(formData.quantity) === Number(selectedService.min)) {
          errorMessage = `⚠️ Quantity Error: The provider requires quantity GREATER than ${selectedService.min}, not equal to it.\n\n✅ Solution: Try entering ${Number(selectedService.min) + 1} or higher.`
        } else {
          errorMessage += `\n\nℹ️ Debug Info:\n- Service: ${selectedService?.name || 'Unknown'}\n- Min: ${selectedService?.min || 'Unknown'}\n- Your quantity: ${formData.quantity}\n\nTry entering a higher quantity.`
        }
      }
      
      toast.error(errorMessage)
      
      // Try to add coins back if order failed after deduction
      console.log('[CreateOrderForm] Attempting to refund coins after error...')
      try {
        await fetch('/api/balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add', amount: cost })
        })
        console.log('[CreateOrderForm] Coins refunded successfully')
        toast.info('Coins have been refunded to your account')
        refreshBalance()
      } catch (refundErr) {
        console.error('[CreateOrderForm] Failed to refund coins:', refundErr)
        toast.error('Failed to refund coins. Please contact support.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Get unique categories
  const categories = Array.from(new Set(services.map(s => s.category)))
  
  // Filter services by selected category
  const filteredServices = formData.category
    ? services.filter(s => s.category === formData.category)
    : services

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-green-100">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-green-100">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Create Order</h2>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Category and Service Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-2">Select Category</label>
            <select
              value={formData.category}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value, service: "" })
                setSelectedService(null)
              }}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 text-sm"
            >
              <option value="">Choose...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-2">Select Service *</label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              disabled={!formData.category}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Choose...</option>
              {filteredServices.map((service) => {
                const pricePerThousand = servicePrices[service.service]
                const priceDisplay = pricePerThousand 
                  ? formatCoins(pricePerThousand)
                  : '...'
                return (
                  <option key={service.service} value={service.service}>
                    {service.name} ({service.type}) - {priceDisplay}/1000 [Min: {service.min}+]
                  </option>
                )
              })}
            </select>
            {selectedService && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Min:</span> {selectedService.min}+ | <span className="font-medium">Max:</span> {selectedService.max}
                  </div>
                  {servicePrices[selectedService.service] && (
                    <div className="text-sm font-bold text-green-700">
                      {formatCoins(servicePrices[selectedService.service])}/1000
                    </div>
                  )}
                </div>
                {selectedService.refill && (
                  <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Refill Available
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Link Field */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-2">Link *</label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="https://example.com"
            required
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 placeholder-gray-400 text-sm"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-2">
            Quantity * {selectedService && `(Min: ${selectedService.min}+, Max: ${selectedService.max})`}
          </label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder="Enter quantity"
            required
            min={selectedService?.min || 0}
            max={selectedService?.max || undefined}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 placeholder-gray-400 text-sm"
          />
          {selectedService && (
            <p className="mt-1 text-xs text-amber-600">
              ⚠️ Note: Some services may require quantity to be greater than {selectedService.min}, not equal to it. If you encounter an error, try {Number(selectedService.min) + 1} or higher.
            </p>
          )}
        </div>

        {/* Optional: Runs and Interval */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-2">Runs (Optional)</label>
            <input
              type="number"
              value={formData.runs}
              onChange={(e) => setFormData({ ...formData, runs: e.target.value })}
              placeholder="Number of runs"
              min="1"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 placeholder-gray-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-2">Interval (Optional, minutes)</label>
            <input
              type="number"
              value={formData.interval}
              onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
              placeholder="Interval in minutes"
              min="1"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 placeholder-gray-400 text-sm"
            />
          </div>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-2">Keywords / Comments (Optional)</label>
          <textarea
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            placeholder="Enter keywords or comments..."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 placeholder-gray-400 resize-none text-sm"
            rows={3}
          />
        </div>

        {/* Cost and Submit */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-100 gap-3 sm:gap-4">
          <div>
            <p className="text-slate-900 font-semibold text-sm sm:text-base">
              Cost: <span className="text-green-600 font-bold">
                {costLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                ) : (
                  formatCoins(cost)
                )}
              </span>
              {selectedService && formData.quantity && !costLoading && (
                <span className="text-xs text-gray-500 ml-2">
                  ({formData.quantity} × {formatCoins(cost / Number(formData.quantity))})
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Balance: {formatCoins(coinBalance)}
            </p>
          </div>
          <button
            type="submit"
            disabled={submitting || !formData.service || !formData.link || !formData.quantity}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-all transform hover:scale-105 text-sm sm:text-base flex items-center gap-2 justify-center"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Order"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
