"use client"

import { useEffect, useState, useMemo } from "react"
import PageLayout from "@/components/page-layout"
import { Star, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { smmApi, type Service } from "@/lib/api"
import { useRouter } from "next/navigation"
import { calculateCoinPrice, formatCoins } from "@/lib/coins"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ServiceWithPrice extends Service {
  coinPrice?: number
  priceLoading?: boolean
}

export default function ServiceListPage() {
  const [services, setServices] = useState<ServiceWithPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const router = useRouter()

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true)
        const data = await smmApi.getServices()
        setError(null)

        // Calculate prices for all services efficiently
        // Use default markup to avoid multiple DB calls
        const defaultMarkup = 1.5 // 50% markup
        
        const servicesWithCalculatedPrices: ServiceWithPrice[] = data.map((service) => {
          const providerRate = Number(service.rate)
          const coinPrice = providerRate * defaultMarkup
          return { 
            ...service, 
            coinPrice, 
            priceLoading: false 
          }
        })
        
        setServices(servicesWithCalculatedPrices)
      } catch (err) {
        console.error("Failed to fetch services:", err)
        setError("Failed to load services. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const handleOrderNow = (service: Service) => {
    router.push(`/new-order?service=${service.service}`)
  }

  if (loading) {
    return (
      <PageLayout title="Service List">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout title="Service List">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </PageLayout>
    )
  }

  if (services.length === 0) {
    return (
      <PageLayout title="Service List">
        <div className="bg-white rounded-2xl p-8 text-center border border-green-100">
          <p className="text-gray-600">No services available at the moment.</p>
        </div>
      </PageLayout>
    )
  }

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return services
    
    const term = searchTerm.toLowerCase()
    return services.filter(service => 
      service.name.toLowerCase().includes(term) ||
      service.category.toLowerCase().includes(term) ||
      service.type.toLowerCase().includes(term) ||
      service.service.toString().includes(term)
    )
  }, [services, searchTerm])

  // Calculate pagination
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedServices = filteredServices.slice(startIndex, endIndex)

  // Group paginated services by category
  const servicesByCategory = paginatedServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = []
    }
    acc[service.category].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <PageLayout title="Service List">
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search by name, category, type, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-sm text-gray-600 whitespace-nowrap">Items per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredServices.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, filteredServices.length)} of {filteredServices.length} services
            </span>
            {searchTerm && (
              <span className="text-green-600 font-medium">
                Search results for "{searchTerm}"
              </span>
            )}
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-green-100">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No services found matching "{searchTerm}"</p>
            <Button
              onClick={() => setSearchTerm("")}
              variant="outline"
              className="mt-4"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                <div key={category}>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryServices.map((service) => (
                <div
                  key={service.service}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-shadow"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900">{service.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{service.type}</p>
                    <p className="text-xs text-gray-500 mt-1">Category: {service.category}</p>
                  </div>

                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Min:</span>
                      <span className="font-semibold text-slate-900">{service.min}+</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Max:</span>
                      <span className="font-semibold text-slate-900">{service.max}</span>
                    </div>
                    <p className="text-xs text-amber-600 mt-2">
                      ⚠️ Minimum may require qty &gt; {service.min}
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      {service.refill && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Refill Available</span>
                      )}
                      {service.cancel && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Cancelable</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 pb-4 border-t border-gray-100">
                    <p className="text-2xl font-bold text-green-600 mt-4">
                      {service.priceLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin inline" />
                      ) : service.coinPrice ? (
                        `${formatCoins(service.coinPrice)} per unit`
                      ) : (
                        "Loading price..."
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Provider: ₱{service.rate}/unit
                    </p>
                  </div>

                  <button
                    onClick={() => handleOrderNow(service)}
                    className="w-full bg-green-500 text-slate-900 font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Order Now
                  </button>
                </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="h-9 px-3"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Previous</span>
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(Number(page))}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className={`h-9 w-9 p-0 ${
                            currentPage === page 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : ''
                          }`}
                        >
                          {page}
                        </Button>
                      )
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="h-9 px-3"
                  >
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-sm text-gray-600">
                  {filteredServices.length} total services
                </div>
              </div>
            </div>
          )}
        </>
        )}
      </div>
    </PageLayout>
  )
}
