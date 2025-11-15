"use client"

import { useEffect, useState } from "react"
import PageLayout from "@/components/page-layout"
import { Star, Loader2 } from "lucide-react"
import { smmApi, type Service } from "@/lib/api"
import { useRouter } from "next/navigation"
import { calculateCoinPrice, formatCoins } from "@/lib/coins"

interface ServiceWithPrice extends Service {
  coinPrice?: number
  priceLoading?: boolean
}

export default function ServiceListPage() {
  const [services, setServices] = useState<ServiceWithPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true)
        const data = await smmApi.getServices()
        const servicesWithPrices: ServiceWithPrice[] = data.map(s => ({
          ...s,
          priceLoading: true
        }))
        setServices(servicesWithPrices)
        setError(null)

        // Calculate prices for all services
        const servicesWithCalculatedPrices = await Promise.all(
          servicesWithPrices.map(async (service) => {
            try {
              const coinPrice = await calculateCoinPrice(Number(service.rate), service.service)
              return { ...service, coinPrice, priceLoading: false }
            } catch (err) {
              console.error(`Error calculating price for service ${service.service}:`, err)
              return { ...service, priceLoading: false }
            }
          })
        )
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

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = []
    }
    acc[service.category].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  return (
    <PageLayout title="Service List">
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
                      <span className="font-semibold text-slate-900">{service.min}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Max:</span>
                      <span className="font-semibold text-slate-900">{service.max}</span>
                    </div>
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
    </PageLayout>
  )
}
