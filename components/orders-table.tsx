import { RotateCcw } from "lucide-react"
import { Button } from "./ui/button"

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

export default function OrdersTable({ orders }: { orders: Order[] }) {
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
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 text-sm">{order.remains || '0'}</span>
                    {order.status?.toLowerCase() === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs bg-slate-600 text-white hover:bg-slate-700 border-0"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Refill
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
            
            {order.status?.toLowerCase() === "completed" && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs bg-slate-600 text-white hover:bg-slate-700 border-0"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Refill
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
