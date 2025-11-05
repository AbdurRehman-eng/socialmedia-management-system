"use client"

import type React from "react"

import { useState } from "react"

export default function CreateOrderForm({ onOrderSubmit }: { onOrderSubmit?: (order: any) => void }) {
  const [formData, setFormData] = useState({
    category: "",
    service: "",
    link: "",
    keywords: "",
  })

  const [cost, setCost] = useState(78.78)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onOrderSubmit) {
      onOrderSubmit({
        id: "#" + Math.floor(Math.random() * 10000),
        service: formData.service || "New Service",
        quantity: 100,
        status: "Pending",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      })
    }
    setFormData({ category: "", service: "", link: "", keywords: "" })
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-green-100">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Create Order</h2>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Category and Service Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-2">Select Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 text-sm"
            >
              <option value="">Choose...</option>
              <option value="social">Social Media</option>
              <option value="seo">SEO</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-2">Select Service</label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 text-sm"
            >
              <option value="">Choose...</option>
              <option value="facebook">Facebook Likes</option>
              <option value="seo">SEO Backlinks</option>
            </select>
          </div>
        </div>

        {/* Link Field */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-2">Link</label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="https://example.com"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 placeholder-gray-400 text-sm"
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-2">Keywords / Comments</label>
          <textarea
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            placeholder="Enter keywords or comments..."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 placeholder-gray-400 resize-none text-sm"
            rows={3}
          />
        </div>

        {/* Cost and Submit */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-100 gap-3 sm:gap-4">
          <div>
            <p className="text-slate-900 font-semibold text-sm sm:text-base">
              Cost: <span className="text-green-600 font-bold">P-{cost.toFixed(2)}</span>
            </p>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-all transform hover:scale-105 text-sm sm:text-base"
          >
            Submit Order
          </button>
        </div>
      </form>
    </div>
  )
}
