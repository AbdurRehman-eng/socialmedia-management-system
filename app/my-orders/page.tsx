"use client"

import { useState } from "react"
import PageLayout from "@/components/page-layout"
import OrdersTable from "@/components/orders-table"

export default function MyOrdersPage() {
  const [orders] = useState([
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
    {
      id: "#10261",
      service: "Instagram Followers",
      quantity: 250,
      status: "Completed",
      date: "Oct 28, 2023",
    },
    {
      id: "#10262",
      service: "TikTok Views",
      quantity: 500,
      status: "In Progress",
      date: "Oct 31, 2023",
    },
  ])

  return (
    <PageLayout title="My Orders">
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
        <OrdersTable orders={orders} />
      </div>
    </PageLayout>
  )
}
