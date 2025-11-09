"use client"

import { useState, useEffect } from "react"
import PageLayout from "@/components/page-layout"
import OrdersTable from "@/components/orders-table"
import { smmApi } from "@/lib/api"
import { Loader2, RefreshCw, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [newOrderId, setNewOrderId] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const getStoredOrderIds = (): number[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  const saveOrderId = (orderId: number) => {
    if (typeof window === "undefined") return
    const existing = getStoredOrderIds()
    if (!existing.includes(orderId)) {
      const updated = [...existing, orderId]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }
  }

  const fetchOrderStatuses = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const orderIds = getStoredOrderIds()
      
      if (orderIds.length === 0) {
        setOrders([])
        return
      }

      // Fetch statuses for all orders (API supports up to 100 at once)
      const statuses = await smmApi.getMultipleOrderStatus(orderIds)

      const orderList: Order[] = []
      
      for (const [orderIdStr, status] of Object.entries(statuses)) {
        const orderId = Number(orderIdStr)
        if (status.error) {
          // Order not found or error
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
            service: "Service", // We don't have service name in status response
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
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOrderStatuses()
  }, [])

  const handleAddOrder = async () => {
    const orderId = Number(newOrderId.trim())
    if (!orderId || isNaN(orderId)) {
      toast.error("Please enter a valid order ID")
      return
    }

    try {
      // Save the order ID
      saveOrderId(orderId)
      setNewOrderId("")
      setDialogOpen(false)
      toast.success("Order added. Refreshing...")
      await fetchOrderStatuses(true)
    } catch (err) {
      toast.error("Failed to add order")
    }
  }

  return (
    <PageLayout title="My Orders">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => fetchOrderStatuses(true)}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Order ID
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Order ID</DialogTitle>
                <DialogDescription>
                  Enter an order ID to track its status
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  type="number"
                  placeholder="Enter order ID"
                  value={newOrderId}
                  onChange={(e) => setNewOrderId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddOrder()
                    }
                  }}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddOrder}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-12 text-center">
            <p className="text-gray-600 mb-4">No orders found.</p>
            <p className="text-sm text-gray-500">
              Add an order ID to start tracking your orders.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
            <OrdersTable orders={orders} />
          </div>
        )}
      </div>
    </PageLayout>
  )
}
