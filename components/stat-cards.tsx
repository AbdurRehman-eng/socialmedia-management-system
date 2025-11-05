import { ShoppingCart, Zap, CheckCircle, Wallet } from "lucide-react"

export default function StatCards() {
  const stats = [
    { label: "Total Orders", value: "1,248", icon: ShoppingCart },
    { label: "Active Orders", value: "32", icon: Zap },
    { label: "Completed", value: "1,180", icon: CheckCircle },
    { label: "Credit Balance", value: "P.890", icon: Wallet },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div
            key={idx}
            className="bg-green-400 rounded-2xl p-4 sm:p-6 shadow-md border-2 border-green-500 flex items-center gap-3 sm:gap-4"
          >
            <div className="bg-slate-900 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Icon size={24} className="text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-slate-900 text-xs sm:text-sm font-medium">{stat.label}</p>
              <p className="text-slate-900 text-lg sm:text-2xl font-bold truncate">{stat.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
