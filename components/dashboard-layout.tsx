"use client"

import { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/contexts/auth-context"
import Sidebar from "./sidebar"
import TopBar from "./top-bar"
import StatCards from "./stat-cards"
import CreateOrderForm from "./create-order-form"
import OrdersTable from "./orders-table"
import { Loader2 } from "lucide-react"

interface Order {
  id: string
  orderId: number
  service: string
  quantity: number
  status: string
  date: string
  link: string
  charge?: string
  start_count?: string
  remains?: string
  currency?: string
}

function mapDbOrder(order: any): Order {
  const date = order.created_at ? new Date(order.created_at) : null
  const formattedDate = date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}\n${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
    : "N/A"

  return {
    id: `${order.order_id}`,
    orderId: order.order_id,
    service: order.service_name || "Unknown",
    quantity: order.quantity || 0,
    status: order.status || "Pending",
    date: formattedDate,
    link: order.link || "N/A",
    charge: order.charge || order.cost_coins || "0",
    start_count: order.start_count || "0",
    remains: order.remains || "0",
    currency: order.currency || undefined,
  }
}

export default function DashboardLayout() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await response.json()
      const mapped = data.orders.map(mapDbOrder)
      setOrders(mapped)
    } catch (err) {
      console.error("Failed to load orders:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleOrderSubmit = (order: any) => {
    // Refresh orders after new order is created
    loadOrders()
  }

  return (
    <div className="flex h-screen bg-green-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            {/* Stats */}
            <StatCards orders={orders} />

            {/* Create Order and Orders Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Create Order Form */}
              <div className="lg:col-span-2">
                <Suspense fallback={<div className="bg-white rounded-2xl p-4 sm:p-6 border border-green-100">Loading form...</div>}>
                  <CreateOrderForm onOrderSubmit={handleOrderSubmit} />
                </Suspense>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-green-100">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Orders</h2>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="pb-3 border-b border-gray-100 last:border-0">
                        <p className="text-sm font-semibold text-slate-900">{order.id}</p>
                        <p className="text-xs text-gray-600 mt-1 truncate">{order.service}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">Qty: {order.quantity}</span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              order.status === "Completed" 
                                ? "bg-green-200 text-slate-900" 
                                : order.status === "In progress" || order.status === "Partial"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Full Orders Table */}
            {!loading && orders.length > 0 && <OrdersTable orders={orders} />}
          </div>
        </div>
      </div>
    </div>
  )
}
