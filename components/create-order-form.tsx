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

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true)
        const data = await smmApi.getServices()
        setServices(data)
        
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
      if (service) {
        setFormData(prev => ({ ...prev, category: service.category }))
      }
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
    if (quantity < Number(selectedService.min) || quantity > Number(selectedService.max)) {
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
        quantity: quantity,
      }

      if (formData.runs) {
        orderParams.runs = Number(formData.runs)
      }
      if (formData.interval) {
        orderParams.interval = Number(formData.interval)
      }

      const response = await smmApi.addOrder(orderParams)
      
      // Save order to Supabase via API
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: response.order,
          serviceId: selectedService.service,
          serviceName: selectedService.name,
          link: formData.link,
          quantity: quantity,
          costCoins: cost,
        })
      })
      
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
      console.error("Failed to create order:", err)
      toast.error(err.message || "Failed to create order. Please try again.")
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
              {filteredServices.map((service) => (
                <option key={service.service} value={service.service}>
                  {service.name} ({service.type}) - ₱{service.rate}/unit
                </option>
              ))}
            </select>
            {selectedService && (
              <p className="text-xs text-gray-500 mt-1">
                Min: {selectedService.min} | Max: {selectedService.max}
              </p>
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
            Quantity * {selectedService && `(Min: ${selectedService.min}, Max: ${selectedService.max})`}
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
