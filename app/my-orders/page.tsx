"use client"

import { useState, useEffect } from "react"
import PageLayout from "@/components/page-layout"
import OrdersTable from "@/components/orders-table"
import { smmApi } from "@/lib/api"
import { Loader2, RefreshCw, Plus, Search, RotateCcw, Ban } from "lucide-react"
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
import type { OrderStatus } from "@/lib/api"

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

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [newOrderId, setNewOrderId] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusInput, setStatusInput] = useState("")
  const [statusResult, setStatusResult] = useState<OrderStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [refillInput, setRefillInput] = useState("")
  const [refillLoading, setRefillLoading] = useState(false)
  const [cancelInput, setCancelInput] = useState("")
  const [cancelLoading, setCancelLoading] = useState(false)

  const loadOrders = async (refreshStatus = true) => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await response.json()
      const mapped = data.orders.map(mapDbOrder)
      setOrders(mapped)
      if (refreshStatus && data.orders.length > 0) {
        await refreshOrderStatuses(data.orders.map((order: any) => order.order_id))
      }
    } catch (err) {
      console.error("Failed to load orders:", err)
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const refreshOrderStatuses = async (orderIds?: number[]) => {
    try {
      setRefreshing(true)
      
      // Get order IDs
      let ids = orderIds
      if (!ids || ids.length === 0) {
        const response = await fetch('/api/orders')
        if (!response.ok) throw new Error('Failed to fetch orders')
        const data = await response.json()
        ids = data.orders.map((order: any) => order.order_id)
      }
      
      if (ids.length === 0) {
        setOrders([])
        return
      }

      const statuses = await smmApi.getMultipleOrderStatus(ids)
      const updatedOrders = [...orders]

      await Promise.all(
        Object.entries(statuses).map(async ([orderIdStr, status]) => {
          const orderId = Number(orderIdStr)
          if (status.error) {
            toast.error(`Order ${orderId}: ${status.error}`)
            return
          }
          
          // Update order status via API
          await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(status)
          })
          
          const index = updatedOrders.findIndex((o) => o.orderId === orderId)
          if (index !== -1) {
            updatedOrders[index] = {
              ...updatedOrders[index],
              status: status.status || updatedOrders[index].status,
              charge: status.charge,
              start_count: status.start_count,
              remains: status.remains,
              currency: status.currency,
            }
          }
        })
      )

      setOrders(updatedOrders)
      toast.success("Order statuses refreshed")
    } catch (err) {
      console.error("Failed to refresh order statuses:", err)
      toast.error("Failed to refresh order statuses")
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadOrders(true)
  }, [])

  const handleAddOrder = async () => {
    const orderId = Number(newOrderId.trim())
    if (!orderId || isNaN(orderId)) {
      toast.error("Please enter a valid order ID")
      return
    }

    try {
      setAddLoading(true)
      const status = await smmApi.getOrderStatus(orderId)
      if (status.error) {
        toast.error(status.error)
        setAddLoading(false)
        return
      }

      // Create order via API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          serviceId: 0,
          serviceName: "Manual Entry",
          link: "N/A",
          quantity: status.remains ? Number(status.remains) : 0,
          costCoins: status.charge ? Number(status.charge) : 0,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      // Update order status
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(status)
      })

      setNewOrderId("")
      setDialogOpen(false)
      toast.success("Order added successfully")
      await loadOrders(false)
    } catch (err) {
      console.error("Failed to add order:", err)
      toast.error("Failed to add order")
    } finally {
      setAddLoading(false)
    }
  }

  const handleCheckStatus = async () => {
    const orderId = Number(statusInput.trim())
    if (!orderId || isNaN(orderId)) {
      toast.error("Please enter a valid order ID")
      return
    }

    try {
      setStatusLoading(true)
      const status = await smmApi.getOrderStatus(orderId)
      if (status.error) {
        toast.error(status.error)
        setStatusResult(null)
      } else {
        setStatusResult(status)
        toast.success(`Status: ${status.status || "Unknown"}`)
        
        // Update order status via API
        await fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(status)
        })
        
        await loadOrders(false)
      }
    } catch (err) {
      console.error("Failed to fetch order status:", err)
      toast.error("Failed to fetch order status")
    } finally {
      setStatusLoading(false)
    }
  }

  const handleCreateRefill = async () => {
    const orderId = Number(refillInput.trim())
    if (!orderId || isNaN(orderId)) {
      toast.error("Please enter a valid order ID")
      return
    }

    try {
      setRefillLoading(true)
      const response = await smmApi.createRefill(orderId)
      if ("refill" in response) {
        toast.success(`Refill created. Refill ID: ${response.refill}`)
      } else {
        toast.error("Failed to create refill")
      }
    } catch (err) {
      console.error("Failed to create refill:", err)
      toast.error("Failed to create refill")
    } finally {
      setRefillLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!cancelInput.trim()) {
      toast.error("Enter one or more order IDs (comma separated)")
      return
    }

    const orderIds = cancelInput
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => !isNaN(id) && id > 0)

    if (orderIds.length === 0) {
      toast.error("Please enter valid order IDs")
      return
    }

    try {
      setCancelLoading(true)
      const response = await smmApi.cancelOrders(orderIds)
      response.forEach((res) => {
        if (typeof res.cancel === "object" && "error" in res.cancel) {
          toast.error(`Order ${res.order}: ${res.cancel.error}`)
        } else {
          toast.success(`Order ${res.order} cancel requested`)
        }
      })
      await loadOrders(false)
    } catch (err) {
      console.error("Failed to cancel orders:", err)
      toast.error("Failed to cancel orders")
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <PageLayout title="My Orders">
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => refreshOrderStatuses()}
                disabled={refreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh Statuses
              </Button>
              <Button
                onClick={() => loadOrders(false)}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reload Orders
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
                <Button onClick={handleAddOrder} disabled={addLoading}>
                  {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-green-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Check Order Status</h3>
              </div>
              <Input
                type="number"
                placeholder="Order ID"
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value)}
              />
              <Button onClick={handleCheckStatus} disabled={statusLoading}>
                {statusLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check Status"}
              </Button>
              {statusResult && (
                <div className="text-xs text-gray-600 space-y-1 border-t border-gray-100 pt-2">
                  <p>Status: <span className="font-semibold text-slate-900">{statusResult.status || "Unknown"}</span></p>
                  {statusResult.charge && <p>Charge: {statusResult.charge} {statusResult.currency || ""}</p>}
                  {statusResult.remains && <p>Remains: {statusResult.remains}</p>}
                </div>
              )}
            </div>

            <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-green-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Create Refill</h3>
              </div>
              <Input
                type="number"
                placeholder="Order ID"
                value={refillInput}
                onChange={(e) => setRefillInput(e.target.value)}
              />
              <Button onClick={handleCreateRefill} disabled={refillLoading}>
                {refillLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Refill"}
              </Button>
            </div>

            <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Cancel Orders</h3>
              </div>
              <Input
                placeholder="Order IDs (comma separated)"
                value={cancelInput}
                onChange={(e) => setCancelInput(e.target.value)}
              />
              <Button onClick={handleCancelOrder} disabled={cancelLoading} variant="destructive">
                {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Orders"}
              </Button>
            </div>
          </div>
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
