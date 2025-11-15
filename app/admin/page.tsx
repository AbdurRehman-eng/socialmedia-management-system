"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import PageLayout from "@/components/page-layout"
import { smmApi, type Service } from "@/lib/api"
import {
  getPricingRules,
  setPricingRule,
  deletePricingRule,
  getDefaultMarkup,
  setDefaultMarkup,
  getCoinToUsdRate,
  setCoinToUsdRate,
  type PricingRule,
} from "@/lib/coins"
import { Loader2, Save, Trash2, DollarSign, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function AdminPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [pricingRules, setPricingRules] = useState<Record<number, PricingRule>>({})
  const [defaultMarkup, setDefaultMarkupState] = useState(getDefaultMarkup())
  const [coinToUsdRate, setCoinToUsdRateState] = useState(getCoinToUsdRate())
  const [editingService, setEditingService] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ markup: "", customPrice: "" })

  // Check authentication
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true)
        const data = await smmApi.getServices()
        setServices(data)
        setPricingRules(getPricingRules())
      } catch (err) {
        console.error("Failed to fetch services:", err)
        toast.error("Failed to load services")
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === 'admin') {
      fetchServices()
    }
  }, [user])

  const handleSaveDefaultMarkup = () => {
    const markup = Number(defaultMarkup)
    if (isNaN(markup) || markup <= 0) {
      toast.error("Markup must be a positive number")
      return
    }
    setDefaultMarkup(markup)
    toast.success("Default markup saved!")
  }

  const handleSaveCoinRate = () => {
    const rate = Number(coinToUsdRate)
    if (isNaN(rate) || rate <= 0) {
      toast.error("Rate must be a positive number")
      return
    }
    setCoinToUsdRate(rate)
    toast.success("Coin to PHP rate saved!")
  }

  const handleEditService = (service: Service) => {
    const rule = pricingRules[service.service]
    setEditingService(service.service)
    setEditForm({
      markup: rule?.markup ? String(rule.markup) : "",
      customPrice: rule?.customPrice ? String(rule.customPrice) : "",
    })
  }

  const handleSaveServicePricing = (serviceId: number) => {
    const rule: PricingRule = {
      serviceId,
    }

    if (editForm.customPrice) {
      const customPrice = Number(editForm.customPrice)
      if (isNaN(customPrice) || customPrice < 0) {
        toast.error("Custom price must be a positive number")
        return
      }
      rule.customPrice = customPrice
    } else if (editForm.markup) {
      const markup = Number(editForm.markup)
      if (isNaN(markup) || markup <= 0) {
        toast.error("Markup must be a positive number")
        return
      }
      rule.markup = markup
    } else {
      toast.error("Please enter either markup or custom price")
      return
    }

    setPricingRule(serviceId, rule)
    setPricingRules({ ...getPricingRules() })
    setEditingService(null)
    setEditForm({ markup: "", customPrice: "" })
    toast.success("Pricing rule saved!")
  }

  const handleDeleteServicePricing = (serviceId: number) => {
    deletePricingRule(serviceId)
    setPricingRules({ ...getPricingRules() })
    toast.success("Pricing rule deleted!")
  }

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (authLoading || loading || !user) {
    return (
      <PageLayout title="Admin Panel">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </PageLayout>
    )
  }

  if (user.role !== 'admin') {
    return null // Will be redirected by useEffect
  }

  return (
    <PageLayout title="Pricing Management">
      <div className="space-y-6">
        {/* Global Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-slate-900">Global Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Default Markup (Multiplier)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Applied to services without custom pricing. Example: 1.5 = 50% markup
              </p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={defaultMarkup}
                  onChange={(e) => setDefaultMarkupState(Number(e.target.value))}
                  className="flex-1"
                />
                <Button onClick={handleSaveDefaultMarkup}>
                  <Save size={16} className="mr-2" />
                  Save
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Coin to PHP Rate
              </label>
              <p className="text-xs text-gray-500 mb-2">
                How many coins = 1 PHP. Example: 1 = 1 coin per PHP
              </p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={coinToUsdRate}
                  onChange={(e) => setCoinToUsdRateState(Number(e.target.value))}
                  className="flex-1"
                />
                <Button onClick={handleSaveCoinRate}>
                  <Save size={16} className="mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Service Pricing Management */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <DollarSign className="text-green-600" size={24} />
              <h2 className="text-xl font-bold text-slate-900">Service Pricing</h2>
            </div>
            <Input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredServices.slice(0, 100).map((service) => {
              const rule = pricingRules[service.service]
              const isEditing = editingService === service.service

              return (
                <div
                  key={service.service}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{service.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {service.category} • Provider Price: ₱{service.rate}/unit
                    </p>
                      {rule && (
                        <div className="mt-2 text-sm">
                          {rule.customPrice !== undefined ? (
                            <span className="text-green-600 font-medium">
                              Custom Price: {rule.customPrice} coins
                            </span>
                          ) : (
                            <span className="text-blue-600 font-medium">
                              Markup: {(rule.markup * 100 - 100).toFixed(1)}% (×{rule.markup})
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Markup (e.g., 1.2)"
                              value={editForm.markup}
                              onChange={(e) =>
                                setEditForm({ ...editForm, markup: e.target.value, customPrice: "" })
                              }
                              className="w-32"
                            />
                            <span className="self-center text-gray-500">OR</span>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Custom price (coins)"
                              value={editForm.customPrice}
                              onChange={(e) =>
                                setEditForm({ ...editForm, customPrice: e.target.value, markup: "" })
                              }
                              className="w-32"
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSaveServicePricing(service.service)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingService(null)
                              setEditForm({ markup: "", customPrice: "" })
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEditService(service)}>
                            {rule ? "Edit" : "Set Price"}
                          </Button>
                          {rule && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteServicePricing(service.service)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredServices.length > 100 && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Showing first 100 services. Use search to find specific services.
            </p>
          )}
        </div>
      </div>
    </PageLayout>
  )
}

