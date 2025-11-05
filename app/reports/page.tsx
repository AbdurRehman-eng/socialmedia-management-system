"use client"

import PageLayout from "@/components/page-layout"
import { BarChart3, TrendingUp, Download } from "lucide-react"

export default function ReportsPage() {
  const reports = [
    {
      id: 1,
      title: "Monthly Performance",
      date: "November 2023",
      orders: 156,
      spent: "₱12,400",
      completed: 142,
    },
    {
      id: 2,
      title: "October Summary",
      date: "October 2023",
      orders: 203,
      spent: "₱18,900",
      completed: 189,
    },
    {
      id: 3,
      title: "Q3 Analytics",
      date: "Jul - Sep 2023",
      orders: 456,
      spent: "₱42,300",
      completed: 428,
    },
  ]

  return (
    <PageLayout title="Reports">
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">815</p>
              </div>
              <BarChart3 className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">₱73,600</p>
              </div>
              <TrendingUp className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completion Rate</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">96.3%</p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </div>
        </div>

        {/* Available Reports */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Download Reports</h2>
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">{report.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{report.date}</p>
                  <div className="flex gap-6 mt-2 text-sm text-gray-600">
                    <span>{report.orders} orders</span>
                    <span>{report.completed} completed</span>
                    <span>{report.spent} spent</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium">
                  <Download size={18} />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
