"use client"

import { useEffect, useState } from "react"
import PageLayout from "@/components/page-layout"
import { Download, Loader2, DollarSign, Package, CheckCircle } from "lucide-react"
import { formatCoins } from "@/lib/coins"
import { toast } from "sonner"

interface OrderData {
  order_id: number
  service_name: string
  quantity: number
  cost_coins: number
  status: string
  created_at: string
}

interface MonthlyReport {
  month: string
  year: number
  orders: number
  completed: number
  spent: number
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<OrderData[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [completionRate, setCompletionRate] = useState(0)
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([])

  useEffect(() => {
    loadOrderData()
  }, [])

  const loadOrderData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await response.json()
      const ordersData = data.orders as OrderData[]
      
      setOrders(ordersData)
      
      // Calculate total orders
      setTotalOrders(ordersData.length)
      
      // Calculate total spent
      const spent = ordersData.reduce((sum, order) => sum + Number(order.cost_coins || 0), 0)
      setTotalSpent(spent)
      
      // Calculate completion rate
      const completedOrders = ordersData.filter(order => 
        order.status?.toLowerCase() === 'completed'
      ).length
      const rate = ordersData.length > 0 ? (completedOrders / ordersData.length) * 100 : 0
      setCompletionRate(rate)
      
      // Generate monthly reports
      const monthlyData = generateMonthlyReports(ordersData)
      setMonthlyReports(monthlyData)
      
    } catch (error) {
      console.error('Failed to load order data:', error)
      toast.error('Failed to load reports data')
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyReports = (ordersData: OrderData[]): MonthlyReport[] => {
    const monthlyMap: { [key: string]: MonthlyReport } = {}
    
    ordersData.forEach(order => {
      const date = new Date(order.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthName,
          year: date.getFullYear(),
          orders: 0,
          completed: 0,
          spent: 0
        }
      }
      
      monthlyMap[monthKey].orders++
      monthlyMap[monthKey].spent += Number(order.cost_coins || 0)
      
      if (order.status?.toLowerCase() === 'completed') {
        monthlyMap[monthKey].completed++
      }
    })
    
    // Sort by date (newest first)
    return Object.values(monthlyMap).sort((a, b) => {
      return b.year - a.year || b.month.localeCompare(a.month)
    }).slice(0, 6) // Last 6 months
  }

  const exportToCSV = (report: MonthlyReport) => {
    const relevantOrders = orders.filter(order => {
      const date = new Date(order.created_at)
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      return monthName === report.month
    })
    
    if (relevantOrders.length === 0) {
      toast.error('No orders found for this period')
      return
    }
    
    const headers = ['Order ID', 'Service', 'Quantity', 'Cost (Coins)', 'Status', 'Date']
    const rows = relevantOrders.map(order => [
      order.order_id,
      order.service_name || 'Unknown',
      order.quantity,
      order.cost_coins,
      order.status || 'Pending',
      new Date(order.created_at).toLocaleDateString()
    ])
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${report.month.replace(' ', '-')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Report downloaded')
  }

  if (loading) {
    return (
      <PageLayout title="Reports">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Reports">
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{totalOrders}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{formatCoins(totalSpent)}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completion Rate</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{completionRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {orders.filter(o => o.status?.toLowerCase() === 'completed').length} / {totalOrders} completed
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Reports */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Monthly Reports</h2>
          {monthlyReports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No orders yet. Start placing orders to see reports.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {monthlyReports.map((report, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900">{report.month}</h3>
                    <div className="flex gap-6 mt-2 text-sm text-gray-600">
                      <span>{report.orders} orders</span>
                      <span>{report.completed} completed</span>
                      <span>{formatCoins(report.spent)} spent</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => exportToCSV(report)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                  >
                    <Download size={18} />
                    Export CSV
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
