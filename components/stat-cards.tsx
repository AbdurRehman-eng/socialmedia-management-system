"use client"

import { ShoppingCart, Zap, CheckCircle, Wallet, Loader2 } from "lucide-react"
import { formatCoins } from "@/lib/coins"
import { useCoinBalance } from "@/hooks/use-coin-balance"

interface StatCardsProps {
  orders?: Array<{
    status: string
  }>
}

export default function StatCards({ orders = [] }: StatCardsProps) {
  const { balance: coinBalance, loading: balanceLoading } = useCoinBalance()

  const totalOrders = orders.length
  const activeOrders = orders.filter((o) => 
    o.status && !["Completed", "Cancelled", "Error"].includes(o.status)
  ).length
  const completedOrders = orders.filter((o) => o.status === "Completed").length
  const displayBalance = balanceLoading ? "Loading..." : formatCoins(coinBalance)

  const stats = [
    { label: "Total Orders", value: totalOrders.toString(), icon: ShoppingCart },
    { label: "Active Orders", value: activeOrders.toString(), icon: Zap },
    { label: "Completed", value: completedOrders.toString(), icon: CheckCircle },
    { label: "Coin Balance", value: displayBalance, icon: Wallet },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div
            key={idx}
            className="bg-green-400 rounded-2xl p-4 sm:p-6 shadow-md border-2 border-green-500 flex items-center gap-3 sm:gap-4"
          >
            <div className="bg-slate-900 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Icon size={24} className="text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-slate-900 text-xs sm:text-sm font-medium">{stat.label}</p>
              <p className="text-slate-900 text-lg sm:text-2xl font-bold truncate">
                {stat.value === "Loading..." ? (
                  <Loader2 className="w-5 h-5 animate-spin inline" />
                ) : (
                  stat.value
                )}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
