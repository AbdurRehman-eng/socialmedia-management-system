"use client"

import { useState } from "react"
import Sidebar from "./sidebar"
import TopBar from "./top-bar"
import StatCards from "./stat-cards"
import CreateOrderForm from "./create-order-form"
import OrdersTable from "./orders-table"

export default function DashboardLayout() {
  const [orders, setOrders] = useState([
    {
      id: "#10258",
      service: "Facebook Likes HQ [ARAB]",
      quantity: 100,
      status: "Completed",
      date: "Oct 29, 2023",
    },
    {
      id: "#10260",
      service: "SEO Backlinks",
      quantity: 60,
      status: "In Progress",
      date: "Oct 30, 2023",
    },
  ])

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
            <StatCards />

            {/* Create Order and Orders Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Create Order Form */}
              <div className="lg:col-span-2">
                <CreateOrderForm onOrderSubmit={(order) => setOrders([...orders, order])} />
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-green-100">
                <h2 className="text-lg font-bold text-slate-900 mb-4">My Orders</h2>
                <div className="space-y-3">
                  {orders.slice(0, 2).map((order) => (
                    <div key={order.id} className="pb-3 border-b border-gray-100 last:border-0">
                      <p className="text-sm font-semibold text-slate-900">{order.id}</p>
                      <p className="text-xs text-gray-600 mt-1 truncate">{order.service}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">{order.quantity}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            order.status === "Completed" ? "bg-green-200 text-slate-900" : "bg-green-100 text-green-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Full Orders Table */}
            <OrdersTable orders={orders} />
          </div>
        </div>
      </div>
    </div>
  )
}
