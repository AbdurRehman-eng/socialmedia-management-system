"use client"
import PageLayout from "@/components/page-layout"
import CreateOrderForm from "@/components/create-order-form"

export default function NewOrderPage() {
  const handleOrderSubmit = (order: any) => {
    console.log("New order submitted:", order)
  }

  return (
    <PageLayout title="Create New Order">
      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
          <CreateOrderForm onOrderSubmit={handleOrderSubmit} />
        </div>
      </div>
    </PageLayout>
  )
}
