"use client"

import PageLayout from "@/components/page-layout"
import { Plus, Minus, TrendingUp } from "lucide-react"

export default function BalancePage() {
  return (
    <PageLayout title="Account Balance">
      <div className="space-y-6">
        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Current Balance</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">₱25,000.00</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">₱8,240.00</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Minus className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Available to Order</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">₱25,000.00</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Plus className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Add Balance Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Add Balance</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Amount (₱)</label>
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>Select Payment Method</option>
                <option>Bank Transfer</option>
                <option>Credit Card</option>
                <option>PayPal</option>
              </select>
            </div>
            <button className="w-full bg-green-500 text-slate-900 font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
              Add Balance
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Transactions</h2>
          <div className="space-y-4">
            {[
              { type: "Order", amount: "-₱890", date: "Nov 4, 2023" },
              { type: "Top-up", amount: "+₱5,000", date: "Nov 3, 2023" },
              { type: "Order", amount: "-₱450", date: "Nov 2, 2023" },
            ].map((tx, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-slate-900">{tx.type}</p>
                  <p className="text-sm text-gray-600">{tx.date}</p>
                </div>
                <p className={`font-semibold ${tx.amount.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                  {tx.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
