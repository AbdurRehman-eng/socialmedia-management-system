"use client"
import { Suspense } from "react"
import { useRouter } from "next/navigation"
import PageLayout from "@/components/page-layout"
import CreateOrderForm from "@/components/create-order-form"

export default function NewOrderPage() {
  const router = useRouter()

  const handleOrderSubmit = (order: any) => {
    // Order is already saved to localStorage by CreateOrderForm
    // Optionally redirect to my-orders page
    setTimeout(() => {
      router.push("/my-orders")
    }, 2000)
  }

  return (
    <PageLayout title="Create New Order">
      <div className="max-w-2xl">
        <Suspense fallback={<div className="bg-white rounded-2xl p-6 border border-green-100">Loading form...</div>}>
          <CreateOrderForm onOrderSubmit={handleOrderSubmit} />
        </Suspense>
      </div>
    </PageLayout>
  )
}
