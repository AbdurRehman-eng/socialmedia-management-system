import { Suspense } from "react"
import DashboardLayout from "@/components/dashboard-layout"

export const dynamic = "force-dynamic"

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading dashboard...</div>}>
      <DashboardLayout />
    </Suspense>
  )
}
