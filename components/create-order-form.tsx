"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { smmApi, type Service } from "@/lib/api"
import { useSearchParams } from "next/navigation"
import { Loader2, Search, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import {
  formatCoins,
} from "@/lib/coins"
import { useCoinBalance } from "@/hooks/use-coin-balance"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

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
    comments: "",
  })

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const { balance: coinBalance, refresh: refreshBalance } = useCoinBalance()
  const [cost, setCost] = useState(0)
  const [usdToPhpRate, setUsdToPhpRate] = useState<number>(50) // Default rate
  const [defaultMarkup, setDefaultMarkup] = useState<number>(1.5) // Default markup (50%)
  const [serviceSearchTerm, setServiceSearchTerm] = useState<string>("")
  const serviceTriggerRef = useRef<HTMLButtonElement>(null)
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false)
  const [popoverWidth, setPopoverWidth] = useState<number>(300)
  const [categorySearchTerm, setCategorySearchTerm] = useState<string>("")
  const categoryTriggerRef = useRef<HTMLButtonElement>(null)
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState<boolean>(false)
  const [categoryPopoverWidth, setCategoryPopoverWidth] = useState<number>(300)

  const getCommentLines = (comments: string) =>
    comments
      .split(/\r?\n/)
      .map((comment) => comment.trim())
      .filter((comment) => comment.length > 0)

  const sanitizeComments = (comments: string) => getCommentLines(comments).join("\r\n")

  // Update popover width when it opens
  useEffect(() => {
    if (popoverOpen && serviceTriggerRef.current) {
      setPopoverWidth(serviceTriggerRef.current.offsetWidth)
    }
  }, [popoverOpen])

  // Update category popover width when it opens
  useEffect(() => {
    if (categoryPopoverOpen && categoryTriggerRef.current) {
      setCategoryPopoverWidth(categoryTriggerRef.current.offsetWidth)
    }
  }, [categoryPopoverOpen])

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true)
        
        // Fetch USD to PHP rate from admin settings
        try {
          const usdToPhpResponse = await fetch('/api/admin/settings/usd-to-php-rate')
          if (usdToPhpResponse.ok) {
            const usdToPhpData = await usdToPhpResponse.json()
            setUsdToPhpRate(usdToPhpData.rate || 50)
          }
        } catch (err) {
          console.warn("Failed to fetch USD to PHP rate, using default 50:", err)
        }
        
        // Fetch default markup from admin settings
        try {
          const markupResponse = await fetch('/api/admin/settings/default-markup')
          if (markupResponse.ok) {
            const markupData = await markupResponse.json()
            setDefaultMarkup(markupData.markup || 1.5)
          }
        } catch (err) {
          console.warn("Failed to fetch default markup, using default 1.5:", err)
        }
        
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

  // Helper function to check if a service is a custom comments service
  const checkIsCustomCommentsService = (service: Service | null): boolean => {
    if (!service) return false
    const nameLower = service.name?.toLowerCase() || ""
    const typeLower = service.type?.toLowerCase() || ""
    const categoryLower = service.category?.toLowerCase() || ""
    
    // Check if service name, type, or category contains keywords indicating custom comments
    return (
      nameLower.includes("custom comment") ||
      nameLower.includes("customcomment") ||
      typeLower.includes("custom comment") ||
      typeLower.includes("customcomment") ||
      categoryLower.includes("custom comment") ||
      categoryLower.includes("customcomment") ||
      (nameLower.includes("comment") && (nameLower.includes("custom") || nameLower.includes("personal")))
    )
  }

  // Check if selected service is a custom comments service
  const isCustomCommentsService = useMemo(() => {
    return checkIsCustomCommentsService(selectedService)
  }, [selectedService])

  // Update selected service when service ID changes
  useEffect(() => {
    if (formData.service) {
      const service = services.find(s => s.service === Number(formData.service))
      const prevIsCustomComments = checkIsCustomCommentsService(selectedService)
      setSelectedService(service || null)
      
      // Clear comments if switching from custom comments service to regular service
      // Clear quantity if switching from regular service to custom comments service
      if (service) {
        const newIsCustomComments = checkIsCustomCommentsService(service)
        
        if (prevIsCustomComments && !newIsCustomComments) {
          // Switching from custom comments to regular - clear comments
          setFormData(prev => ({ ...prev, comments: "" }))
        } else if (!prevIsCustomComments && newIsCustomComments) {
          // Switching from regular to custom comments - clear quantity
          setFormData(prev => ({ ...prev, quantity: "" }))
        }
      }
    } else {
      setSelectedService(null)
    }
  }, [formData.service, services, selectedService])

  // Calculate cost when service quantity/comments change
  useEffect(() => {
    function calculateCost() {
      if (!selectedService) {
        setCost(0)
        return
      }

      const ratePer1000 = Number(selectedService.rate) // Provider rate in USD per 1000 (already per 1000)
      const ratePer1000InPhp = ratePer1000 * usdToPhpRate
      const finalRatePer1000InPhp = ratePer1000InPhp * defaultMarkup
      const pricePerUnit = finalRatePer1000InPhp / 1000

      if (isCustomCommentsService) {
        const commentCount = getCommentLines(formData.comments).length
        if (!commentCount) {
          setCost(0)
          return
        }
        setCost(pricePerUnit * commentCount)
        return
      }

      if (!formData.quantity) {
        setCost(0)
        return
      }

      const quantity = Number(formData.quantity)
      if (isNaN(quantity)) {
        setCost(0)
        return
      }

      setCost(pricePerUnit * quantity)
    }
    
    calculateCost()
  }, [selectedService, isCustomCommentsService, formData.quantity, formData.comments, usdToPhpRate, defaultMarkup])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.service || !formData.link) {
      toast.error("Please fill in all required fields")
      return
    }
    
    // For custom comments services, comments are required
    let sanitizedComments = ""
    let customCommentCount = 0
    let regularQuantity = 0
    if (isCustomCommentsService) {
      const commentLines = getCommentLines(formData.comments)
      customCommentCount = commentLines.length

      if (!customCommentCount) {
        toast.error("Please enter comments for custom comments services")
        return
      }

      sanitizedComments = sanitizeComments(formData.comments)
    } else {
      // For regular services, quantity is required
      if (!formData.quantity) {
        toast.error("Please enter quantity")
        return
      }
    }

    if (!selectedService) {
      toast.error("Please select a service")
      return
    }

    // For regular services, validate quantity
    if (!isCustomCommentsService) {
      regularQuantity = Number(formData.quantity)
      console.log('[CreateOrderForm] Quantity parsed:', regularQuantity, 'Type:', typeof regularQuantity)
      console.log('[CreateOrderForm] Service min:', selectedService.min, 'Type:', typeof selectedService.min)
      console.log('[CreateOrderForm] Service max:', selectedService.max, 'Type:', typeof selectedService.max)
      
      if (isNaN(regularQuantity) || regularQuantity < Number(selectedService.min) || regularQuantity > Number(selectedService.max)) {
        toast.error(`Quantity must be between ${selectedService.min} and ${selectedService.max}`)
        return
      }
    }

    if (coinBalance < cost) {
      toast.error(`Insufficient coins. You need ${formatCoins(cost)} but only have ${formatCoins(coinBalance)}`)
      return
    }

    try {
      setSubmitting(true)
      
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
      
      let response
      if (isCustomCommentsService) {
        // Custom comments order
        const orderParams: any = {
          service: Number(formData.service),
          link: formData.link,
          comments: sanitizedComments, // Comments separated by \r\n
        }
        
        console.log('[CreateOrderForm] Submitting custom comments order to provider with params:', orderParams)
        response = await smmApi.addCustomCommentsOrder(orderParams)
      } else {
        // Regular order
        const quantity = regularQuantity
      const orderParams: any = {
        service: Number(formData.service),
        link: formData.link,
          quantity: quantity, // Ensure it's a number
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
        response = await smmApi.addOrder(orderParams)
      }
      console.log('[CreateOrderForm] Provider response:', response)
      
      // Validate provider response
      if (!response || !response.order) {
        console.error('[CreateOrderForm] Provider did not return order ID:', response)
        throw new Error('Provider failed to create order. Response: ' + JSON.stringify(response))
      }
      
      // Save order to Supabase via API
      const quantity = isCustomCommentsService ? customCommentCount : regularQuantity
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
        comments: "",
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

  // Get unique categories (memoized)
  const categories = useMemo(() => {
    return Array.from(new Set(services.map(s => s.category)))
  }, [services])
  
  // Filter categories by search term (memoized)
  const filteredCategories = useMemo(() => {
    if (!categorySearchTerm.trim()) return categories
    const searchLower = categorySearchTerm.toLowerCase()
    return categories.filter((category) => 
      category.toLowerCase().includes(searchLower)
    )
  }, [categories, categorySearchTerm])
  
  // Filter services by selected category and search term (memoized)
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Filter by category if selected
      if (formData.category && service.category !== formData.category) {
        return false
      }
      
      // Filter by search term (search in name, type, category, or service ID)
      if (serviceSearchTerm) {
        const searchLower = serviceSearchTerm.toLowerCase()
        const matchesName = service.name?.toLowerCase().includes(searchLower)
        const matchesType = service.type?.toLowerCase().includes(searchLower)
        const matchesCategory = service.category?.toLowerCase().includes(searchLower)
        const matchesId = String(service.service).includes(searchLower)
        
        if (!matchesName && !matchesType && !matchesCategory && !matchesId) {
          return false
        }
      }
      
      return true
    })
  }, [services, formData.category, serviceSearchTerm])

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
            <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  ref={categoryTriggerRef}
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg text-slate-900 text-sm font-normal hover:bg-gray-100"
                >
                  <span className="truncate">
                    {formData.category || "Choose..."}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="p-0 w-full" 
                align="start" 
                sideOffset={4}
                style={{ width: `${categoryPopoverWidth}px`, padding: 0 }}
              >
                <div className="flex flex-col">
                  {/* Search bar at the top of dropdown */}
                  <div className="relative border-b border-gray-200 p-3 bg-white">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    <Input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      className="pl-9 pr-3 w-full text-sm h-9 border border-gray-200 rounded-md focus-visible:ring-2 focus-visible:ring-green-500"
                      autoFocus
                    />
                  </div>
                  {/* Categories list */}
                  <div className="max-h-[300px] overflow-y-auto">
                    {filteredCategories.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500">
                        No categories found
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, category: "", service: "" })
                            setSelectedService(null)
                            setServiceSearchTerm("")
                            setCategorySearchTerm("")
                            setCategoryPopoverOpen(false)
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                            !formData.category ? "bg-green-50 text-green-700 font-medium" : "text-slate-900"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>Choose...</span>
                            {!formData.category && (
                              <div className="ml-2 text-green-600">✓</div>
                            )}
                          </div>
                        </button>
                        {filteredCategories.map((category) => {
                          const isSelected = formData.category === category
                          return (
                            <button
                              key={category}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, category: category, service: "" })
                setSelectedService(null)
                                setServiceSearchTerm("")
                                setCategorySearchTerm("")
                                setCategoryPopoverOpen(false)
                              }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                isSelected ? "bg-green-50 text-green-700 font-medium" : "text-slate-900"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{category}</span>
                                {isSelected && (
                                  <div className="ml-2 text-green-600">✓</div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-2">Select Service *</label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  ref={serviceTriggerRef}
                  variant="outline"
                  role="combobox"
              disabled={!formData.category}
                  className="w-full justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg text-slate-900 text-sm font-normal disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <span className="truncate">
                    {selectedService 
                      ? `${selectedService.name} (${selectedService.type})`
                      : "Choose a service..."}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="p-0 w-full" 
                align="start" 
                sideOffset={4}
                style={{ width: `${popoverWidth}px`, padding: 0 }}
              >
                <div className="flex flex-col">
                  {/* Search bar at the top of dropdown */}
                  <div className="relative border-b border-gray-200 p-3 bg-white">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    <Input
                      type="text"
                      placeholder="Search services..."
                      value={serviceSearchTerm}
                      onChange={(e) => setServiceSearchTerm(e.target.value)}
                      className="pl-9 pr-3 w-full text-sm h-9 border border-gray-200 rounded-md focus-visible:ring-2 focus-visible:ring-green-500"
                      autoFocus
                    />
                  </div>
                  {/* Services list */}
                  <div className="max-h-[300px] overflow-y-auto">
                    {filteredServices.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500">
                        No services found
                      </div>
                    ) : (
                      filteredServices.map((service) => {
                        // Memoize price calculation
                        const ratePer1000 = Number(service.rate) // Provider rate in USD per 1000 (already per 1000)
                        const ratePer1000InPhp = ratePer1000 * usdToPhpRate // Convert USD to PHP
                        const ratePer1000WithMarkup = ratePer1000InPhp * defaultMarkup // Apply markup
                        const priceDisplay = `₱${ratePer1000WithMarkup.toFixed(2)}/1000`
                        const isSelected = formData.service === String(service.service)
                return (
                          <button
                            key={service.service}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, service: String(service.service) })
                              setServiceSearchTerm("") // Clear search after selection
                              setPopoverOpen(false) // Close popover after selection
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                              isSelected ? "bg-green-50 text-green-700 font-medium" : "text-slate-900"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{service.name}</div>
                                <div className="text-xs text-gray-500 truncate">
                                  {service.type} - {priceDisplay} [Min: {service.min}+]
                                </div>
                              </div>
                              {isSelected && (
                                <div className="ml-2 text-green-600">✓</div>
                              )}
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {selectedService && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Min:</span> {selectedService.min}+ | <span className="font-medium">Max:</span> {selectedService.max}
                  </div>
                    <div className="text-sm font-bold text-green-700">
                    ₱{((Number(selectedService.rate) * usdToPhpRate) * defaultMarkup).toFixed(2)}/1000
                    </div>
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

        {/* Quantity - only show for non-custom-comments services */}
        {!isCustomCommentsService && (
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
        )}

        {/* Custom Comments - only show for custom comments services */}
        {isCustomCommentsService && (
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-2">
              Custom Comments * 
              <span className="text-gray-500 text-xs ml-2">(One comment per line)</span>
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Enter comments, one per line&#10;Example:&#10;Comment 1&#10;Comment 2&#10;Comment 3"
              required
              rows={6}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 placeholder-gray-400 resize-none text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter your custom comments, one per line. Each line will be treated as a separate comment.
            </p>
          </div>
        )}

        {/* Optional: Runs and Interval (only for regular orders) */}
        {!isCustomCommentsService && (
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
        )}

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
                {formatCoins(cost)}
              </span>
              {selectedService && formData.quantity && cost > 0 && (
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
            disabled={submitting || !formData.service || !formData.link || (!isCustomCommentsService && !formData.quantity) || (isCustomCommentsService && !formData.comments.trim())}
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
