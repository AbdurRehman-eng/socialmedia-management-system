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
import { Loader2, Save, Trash2, DollarSign, Settings, RefreshCw, Wallet, TrendingUp } from "lucide-react"
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
  const [defaultMarkup, setDefaultMarkupState] = useState<number>(1.5)
  const [coinToUsdRate, setCoinToUsdRateState] = useState<number>(1)
  const [editingService, setEditingService] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ markup: "", customPrice: "" })
  const [providerBalance, setProviderBalance] = useState<{ amount: number; currency: string } | null>(null)
  const [adminCoins, setAdminCoins] = useState<number>(0)
  const [syncing, setSyncing] = useState(false)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [usdToPhpRate, setUsdToPhpRate] = useState<number>(50)

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
        const rules = await getPricingRules()
        setPricingRules(rules)
      } catch (err) {
        console.error("Failed to fetch services:", err)
        toast.error("Failed to load services")
      } finally {
        setLoading(false)
      }
    }

    async function loadAdminBalance() {
      try {
        setBalanceLoading(true)
        const response = await fetch("/api/balance")
        if (response.ok) {
          const data = await response.json()
          setAdminCoins(data.balance || 0)
        }
      } catch (error) {
        console.error("Failed to load admin balance:", error)
      } finally {
        setBalanceLoading(false)
      }
    }

    async function loadUsdToPhpRate() {
      try {
        const response = await fetch("/api/admin/settings/usd-to-php-rate")
        if (response.ok) {
          const data = await response.json()
          setUsdToPhpRate(data.rate || 50)
        }
      } catch (error) {
        console.error("Failed to load USD to PHP rate:", error)
      }
    }

    async function loadGlobalSettings() {
      try {
        const markup = await getDefaultMarkup()
        setDefaultMarkupState(markup)
        
        const rate = await getCoinToUsdRate()
        setCoinToUsdRateState(rate)
      } catch (error) {
        console.error("Failed to load global settings:", error)
      }
    }

    if (user && user.role === 'admin') {
      fetchServices()
      loadAdminBalance()
      loadUsdToPhpRate()
      loadGlobalSettings()
    }
  }, [user])

  const handleSyncProviderBalance = async () => {
    try {
      setSyncing(true)
      const response = await fetch("/api/admin/sync-provider-balance")
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to sync provider balance")
        return
      }

      setProviderBalance(data.providerBalance)
      setAdminCoins(data.adminCoins)
      setUsdToPhpRate(data.conversionRate) // Update the displayed rate
      toast.success(data.message || "Balance synced successfully!")
    } catch (error) {
      console.error("Sync error:", error)
      toast.error("Failed to sync provider balance")
    } finally {
      setSyncing(false)
    }
  }

  const handleSaveDefaultMarkup = async () => {
    const markup = Number(defaultMarkup)
    if (isNaN(markup) || markup <= 0) {
      toast.error("Markup must be a positive number")
      return
    }
    try {
      await setDefaultMarkup(markup)
      toast.success("Default markup saved!")
    } catch (error) {
      console.error("Error saving markup:", error)
      toast.error("Failed to save default markup")
    }
  }

  const handleSaveCoinRate = async () => {
    const rate = Number(coinToUsdRate)
    if (isNaN(rate) || rate <= 0) {
      toast.error("Rate must be a positive number")
      return
    }
    try {
      await setCoinToUsdRate(rate)
      toast.success("Coin to PHP rate saved!")
    } catch (error) {
      console.error("Error saving coin rate:", error)
      toast.error("Failed to save coin to PHP rate")
    }
  }

  const handleSaveUsdToPhpRate = async () => {
    const rate = Number(usdToPhpRate)
    if (isNaN(rate) || rate <= 0) {
      toast.error("Rate must be a positive number")
      return
    }

    try {
      const response = await fetch("/api/admin/settings/usd-to-php-rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rate }),
      })

      if (!response.ok) {
        toast.error("Failed to save USD to PHP rate")
        return
      }

      toast.success("USD to PHP rate saved!")
    } catch (error) {
      console.error("Error saving USD to PHP rate:", error)
      toast.error("Failed to save USD to PHP rate")
    }
  }

  const handleEditService = (service: Service) => {
    const rule = pricingRules[service.service]
    setEditingService(service.service)
    setEditForm({
      markup: rule?.markup ? String(rule.markup) : "",
      customPrice: rule?.customPrice ? String(rule.customPrice) : "",
    })
  }

  const handleSaveServicePricing = async (serviceId: number) => {
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

    try {
      await setPricingRule(serviceId, rule)
      const updatedRules = await getPricingRules()
      setPricingRules(updatedRules)
      setEditingService(null)
      setEditForm({ markup: "", customPrice: "" })
      toast.success("Pricing rule saved!")
    } catch (error) {
      console.error("Error saving pricing rule:", error)
      toast.error("Failed to save pricing rule")
    }
  }

  const handleDeleteServicePricing = async (serviceId: number) => {
    try {
      await deletePricingRule(serviceId)
      const updatedRules = await getPricingRules()
      setPricingRules(updatedRules)
      toast.success("Pricing rule deleted!")
    } catch (error) {
      console.error("Error deleting pricing rule:", error)
      toast.error("Failed to delete pricing rule")
    }
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
        {/* Provider Balance & Admin Coins */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Provider Balance */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet size={24} />
                <h3 className="font-semibold">Provider Balance</h3>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSyncProviderBalance}
                disabled={syncing}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                {syncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
            {providerBalance ? (
              <>
                <p className="text-3xl font-bold">
                  {providerBalance.currency} ${providerBalance.amount.toFixed(2)}
                </p>
                <p className="text-sm text-blue-100 mt-1">Real balance from SMM provider</p>
              </>
            ) : (
              <p className="text-sm text-blue-100">Click sync to load</p>
            )}
          </div>

          {/* Admin Allocatable Coins */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={24} />
              <h3 className="font-semibold">Your Allocatable Coins</h3>
            </div>
            {balanceLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <p className="text-3xl font-bold">₱{adminCoins.toFixed(2)}</p>
                <p className="text-sm text-green-100 mt-1">Available to allocate to users</p>
              </>
            )}
          </div>

          {/* Conversion Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={24} className="text-gray-600" />
              <h3 className="font-semibold text-slate-900">Conversion Rate</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">
              1 USD = {usdToPhpRate} PHP
            </p>
            {providerBalance && (
              <p className="text-xs text-gray-500">
                ${providerBalance.amount.toFixed(2)} × {usdToPhpRate} = ₱{adminCoins.toFixed(2)} coins
              </p>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleSyncProviderBalance}
              disabled={syncing}
              className="mt-3 w-full"
            >
              {syncing ? "Syncing..." : "Sync from Provider"}
            </Button>
          </div>
        </div>

        {/* Global Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-slate-900">Global Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                USD to PHP Rate
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Provider balance conversion. Example: 50 = $1 USD = ₱50
              </p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={usdToPhpRate}
                  onChange={(e) => setUsdToPhpRate(Number(e.target.value))}
                  className="flex-1"
                />
                <Button onClick={handleSaveUsdToPhpRate}>
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

