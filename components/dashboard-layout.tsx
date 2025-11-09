"use client"

import { useState, useEffect } from "react"
import Sidebar from "./sidebar"
import TopBar from "./top-bar"
import StatCards from "./stat-cards"
import CreateOrderForm from "./create-order-form"
import OrdersTable from "./orders-table"
import { smmApi } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface Order {
  id: string
  orderId: number
  service: string
  quantity: number
  status: string
  date: string
  charge?: string
  start_count?: string
  remains?: string
  currency?: string
}

const STORAGE_KEY = "smm_order_ids"

export default function DashboardLayout() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const getStoredOrderIds = (): number[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  const fetchOrderStatuses = async () => {
    try {
      setLoading(true)
      const orderIds = getStoredOrderIds()
      
      if (orderIds.length === 0) {
        setOrders([])
        return
      }

      const statuses = await smmApi.getMultipleOrderStatus(orderIds)
      const orderList: Order[] = []
      
      for (const [orderIdStr, status] of Object.entries(statuses)) {
        const orderId = Number(orderIdStr)
        if (status.error) {
          orderList.push({
            id: `#${orderId}`,
            orderId: orderId,
            service: "Unknown",
            quantity: 0,
            status: status.error,
            date: "N/A",
          })
        } else {
          orderList.push({
            id: `#${orderId}`,
            orderId: orderId,
            service: "Service",
            quantity: status.remains ? Number(status.remains) : 0,
            status: status.status || "Unknown",
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            charge: status.charge,
            start_count: status.start_count,
            remains: status.remains,
            currency: status.currency,
          })
        }
      }

      setOrders(orderList)
    } catch (err) {
      console.error("Failed to fetch order statuses:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderStatuses()
  }, [])

  const handleOrderSubmit = (order: any) => {
    // Refresh orders after new order is created
    fetchOrderStatuses()
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
                <CreateOrderForm onOrderSubmit={handleOrderSubmit} />
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
