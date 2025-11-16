"use client"

import { useEffect, useState } from "react"
import PageLayout from "@/components/page-layout"
import { Plus, Minus, TrendingUp, Loader2, RefreshCw } from "lucide-react"
import { smmApi } from "@/lib/api"
import { toast } from "sonner"
import { formatCoins, coinsToUsd } from "@/lib/coins"
import { useCoinBalance } from "@/hooks/use-coin-balance"

export default function BalancePage() {
  const [providerBalance, setProviderBalance] = useState<string | null>(null)
  const [providerCurrency, setProviderCurrency] = useState<string>("USD")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { balance: coinBalance, loading: balanceLoading, refresh: refreshCoinBalance } = useCoinBalance()
  const [usdEquivalent, setUsdEquivalent] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)

  const fetchProviderBalance = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      const data = await smmApi.getBalance()
      setProviderBalance(data.balance)
      setProviderCurrency(data.currency)
    } catch (err) {
      console.error("Failed to fetch provider balance:", err)
      toast.error("Failed to load provider balance")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const checkIfAdmin = async () => {
    try {
      const response = await fetch("/api/auth/session")
      const data = await response.json()
      setIsAdmin(data.user?.role === "admin")
    } catch (error) {
      console.error("Error checking admin status:", error)
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    async function calculateUsd() {
      const usd = await coinsToUsd(coinBalance)
      setUsdEquivalent(usd)
    }
    if (coinBalance > 0) {
      calculateUsd()
    }
    checkIfAdmin()
  }, [coinBalance])

  useEffect(() => {
    // Only fetch provider balance if admin
    if (isAdmin) {
      fetchProviderBalance()
    } else {
      setLoading(false)
    }
  }, [isAdmin])

  return (
    <PageLayout title="Account Balance">
      <div className="space-y-6">
        {/* Balance Overview */}
        <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Your Balance</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {balanceLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                  ) : (
                    formatCoins(coinBalance)
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {isAdmin ? "Available to allocate or use" : "Available for orders"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
            <button
              onClick={async () => {
                await refreshCoinBalance()
                if (isAdmin) {
                  await fetchProviderBalance(true)
                }
              }}
              disabled={refreshing || balanceLoading}
              className="mt-4 text-sm text-green-600 hover:text-green-700 flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing || balanceLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Provider Balance - Only visible to Admin */}
          {isAdmin && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Provider Balance</p>
                  {loading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-slate-900 mt-2">
                        {providerBalance !== null ? `${providerCurrency} ${Number(providerBalance).toFixed(2)}` : "N/A"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">SMM provider API balance</p>
                    </>
                  )}
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Available to Spend</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {balanceLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                  ) : (
                    formatCoins(coinBalance)
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {isAdmin ? "For orders & allocations" : "For placing orders"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Plus className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Add Balance / Info Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            {isAdmin ? "Balance Management" : "Add Balance"}
          </h2>
          <div className="space-y-4 max-w-md">
            <div className={`${isAdmin ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
              <p className={`text-sm ${isAdmin ? 'text-green-800' : 'text-blue-800'}`}>
                {isAdmin ? (
                  <>
                    As an admin, you can allocate coins to users from your balance. 
                    Go to <a href="/admin/users" className="font-semibold underline">User Management</a> to allocate coins to users.
                    When you allocate coins, they are deducted from your balance and added to the user's balance.
                  </>
                ) : (
                  "To add balance to your account, please contact your administrator. They can allocate coins to your account."
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Balance</label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                <p className="text-lg font-semibold text-slate-900">
                  {balanceLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                  ) : (
                    formatCoins(coinBalance)
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {isAdmin ? "Available for allocation and orders" : "Available for orders"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
