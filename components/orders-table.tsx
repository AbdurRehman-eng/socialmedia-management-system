import { RotateCcw, X } from "lucide-react"
import { Button } from "./ui/button"
import { useState } from "react"

interface Order {
  id: string
  service: string
  quantity: number
  status: string
  date: string
  link?: string
  charge?: string
  start_count?: string
  remains?: string
}

interface OrdersTableProps {
  orders: Order[]
  onCancelOrder?: (orderId: number) => Promise<void>
  onRefillOrder?: (orderId: number) => Promise<void>
}

export default function OrdersTable({ orders, onCancelOrder, onRefillOrder }: OrdersTableProps) {
  const [cancelingOrders, setCancelingOrders] = useState<Set<string>>(new Set())
  const [refillingOrders, setRefillingOrders] = useState<Set<string>>(new Set())

  const handleCancel = async (orderId: string) => {
    if (!onCancelOrder) return
    
    setCancelingOrders(prev => new Set(prev).add(orderId))
    try {
      await onCancelOrder(Number(orderId))
    } finally {
      setCancelingOrders(prev => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
    }
  }

  const handleRefill = async (orderId: string) => {
    if (!onRefillOrder) return
    
    setRefillingOrders(prev => new Set(prev).add(orderId))
    try {
      await onRefillOrder(Number(orderId))
    } finally {
      setRefillingOrders(prev => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
    }
  }

  const canCancel = (status: string) => {
    const s = status?.toLowerCase()
    return s !== 'completed' && s !== 'canceled' && s !== 'cancelled' && !s?.includes('error')
  }
  return (
    <div className="bg-white overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100/80">
              <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">ID</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">Link</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">Charge</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">Start count</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">Quantity</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">Service</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">Remains</th>
              <th className="text-center py-3 px-4 font-semibold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                <td className="py-3 px-4 text-slate-900 text-sm font-medium">{order.id}</td>
                <td className="py-3 px-4 text-slate-600 text-xs whitespace-pre-line">{order.date}</td>
                <td className="py-3 px-4 text-slate-600 text-xs max-w-xs truncate">
                  <a 
                    href={order.link || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                    title={order.link}
                  >
                    {order.link || 'N/A'}
                  </a>
                </td>
                <td className="py-3 px-4 text-slate-900 text-sm">{order.charge || '0'}</td>
                <td className="py-3 px-4 text-slate-900 text-sm">{order.start_count || '0'}</td>
                <td className="py-3 px-4 text-slate-900 text-sm font-medium">{order.quantity}</td>
                <td className="py-3 px-4 text-slate-700 text-xs max-w-sm">
                  <div className="line-clamp-2" title={order.service}>
                    {order.service}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        order.status?.toLowerCase() === "completed"
                          ? "bg-green-100 text-green-700"
                          : order.status?.toLowerCase() === "in progress" || order.status?.toLowerCase() === "partial"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status?.toLowerCase() === "pending"
                          ? "bg-blue-100 text-blue-700"
                          : order.status?.toLowerCase().includes("error") || order.status?.toLowerCase() === "canceled"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status?.toLowerCase() === "completed" && "✓ "}
                      {order.status}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-slate-900 text-sm">{order.remains || '0'}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    {order.status?.toLowerCase() === "completed" && onRefillOrder && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs bg-slate-600 text-white hover:bg-slate-700 border-0"
                        onClick={() => handleRefill(order.id)}
                        disabled={refillingOrders.has(order.id)}
                        title="Request refill for this order (charges same as original order)"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        {refillingOrders.has(order.id) ? 'Processing...' : 'Refill'}
                      </Button>
                    )}
                    {canCancel(order.status) && onCancelOrder && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs bg-red-600 text-white hover:bg-red-700 border-0"
                        onClick={() => handleCancel(order.id)}
                        disabled={cancelingOrders.has(order.id)}
                        title="Cancel this order"
                      >
                        <X className="w-3 h-3 mr-1" />
                        {cancelingOrders.has(order.id) ? 'Canceling...' : 'Cancel'}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 p-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-900 text-sm">Order #{order.id}</p>
                <p className="text-xs text-slate-500 mt-1">{order.date}</p>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                  order.status?.toLowerCase() === "completed"
                    ? "bg-green-100 text-green-700"
                    : order.status?.toLowerCase() === "in progress" || order.status?.toLowerCase() === "partial"
                    ? "bg-yellow-100 text-yellow-700"
                    : order.status?.toLowerCase().includes("error") || order.status?.toLowerCase() === "canceled"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {order.status?.toLowerCase() === "completed" && "✓ "}
                {order.status}
              </span>
            </div>
            
            <div className="text-xs text-slate-700 space-y-1">
              <p className="truncate"><span className="font-medium">Service:</span> {order.service}</p>
              <p><span className="font-medium">Quantity:</span> {order.quantity}</p>
              <p><span className="font-medium">Charge:</span> {order.charge || '0'}</p>
              <p><span className="font-medium">Start count:</span> {order.start_count || '0'}</p>
              <p><span className="font-medium">Remains:</span> {order.remains || '0'}</p>
            </div>
            
            {order.link && order.link !== 'N/A' && (
              <div className="pt-2 border-t border-slate-100">
                <a 
                  href={order.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline break-all"
                >
                  {order.link}
                </a>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              {order.status?.toLowerCase() === "completed" && onRefillOrder && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs bg-slate-600 text-white hover:bg-slate-700 border-0"
                  onClick={() => handleRefill(order.id)}
                  disabled={refillingOrders.has(order.id)}
                  title="Request refill for this order (charges same as original order)"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  {refillingOrders.has(order.id) ? 'Processing...' : 'Refill'}
                </Button>
              )}
              {canCancel(order.status) && onCancelOrder && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs bg-red-600 text-white hover:bg-red-700 border-0"
                  onClick={() => handleCancel(order.id)}
                  disabled={cancelingOrders.has(order.id)}
                  title="Cancel this order"
                >
                  <X className="w-3 h-3 mr-1" />
                  {cancelingOrders.has(order.id) ? 'Canceling...' : 'Cancel Order'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
