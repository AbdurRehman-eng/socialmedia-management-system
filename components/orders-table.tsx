import { Download } from "lucide-react"

interface Order {
  id: string
  service: string
  quantity: number
  status: string
  date: string
}

export default function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-green-100 overflow-hidden">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">My Orders</h2>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-2 sm:px-4 font-bold text-slate-900 text-sm">Order ID</th>
              <th className="text-left py-3 px-2 sm:px-4 font-bold text-slate-900 text-sm">Service</th>
              <th className="text-left py-3 px-2 sm:px-4 font-bold text-slate-900 text-sm">Quantity</th>
              <th className="text-left py-3 px-2 sm:px-4 font-bold text-slate-900 text-sm">Status</th>
              <th className="text-left py-3 px-2 sm:px-4 font-bold text-slate-900 text-sm">Date</th>
              <th className="text-left py-3 px-2 sm:px-4 font-bold text-slate-900 text-sm">Report</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="py-4 px-2 sm:px-4 font-semibold text-slate-900 text-sm">{order.id}</td>
                <td className="py-4 px-2 sm:px-4 text-gray-700 text-sm">{order.service}</td>
                <td className="py-4 px-2 sm:px-4 text-gray-700 text-sm">{order.quantity}</td>
                <td className="py-4 px-2 sm:px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                      order.status === "Completed"
                        ? "bg-green-200 text-slate-900"
                        : order.status === "In progress" || order.status === "Partial" || order.status === "In Progress"
                          ? "bg-green-100 text-green-700"
                          : order.status?.includes("error") || order.status?.includes("Error")
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-4 px-2 sm:px-4 text-gray-700 text-sm">{order.date}</td>
                <td className="py-4 px-2 sm:px-4">
                  <button className="text-gray-700 hover:text-green-600 transition flex items-center gap-1">
                    <Download size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-900 text-sm">{order.id}</p>
                <p className="text-xs text-gray-600 mt-1">{order.service}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  order.status === "Completed"
                    ? "bg-green-200 text-slate-900"
                    : order.status === "In progress" || order.status === "Partial" || order.status === "In Progress"
                      ? "bg-green-100 text-green-700"
                      : order.status?.includes("error") || order.status?.includes("Error")
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {order.status}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>Qty: {order.quantity}</span>
              <span>{order.date}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-700">Report</span>
              <button className="text-gray-700 hover:text-green-600 transition">
                <Download size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
