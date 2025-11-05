"use client"

import PageLayout from "@/components/page-layout"
import { Star } from "lucide-react"

export default function ServiceListPage() {
  const services = [
    {
      id: 1,
      name: "Facebook Likes HQ",
      category: "Social Media",
      price: "₱0.50/100",
      rating: 4.8,
      reviews: 245,
      description: "High-quality Facebook likes from real accounts",
    },
    {
      id: 2,
      name: "Instagram Followers",
      category: "Social Media",
      price: "₱0.80/100",
      rating: 4.9,
      reviews: 312,
      description: "Real and active Instagram followers",
    },
    {
      id: 3,
      name: "SEO Backlinks",
      category: "SEO",
      price: "₱15/link",
      rating: 4.7,
      reviews: 189,
      description: "High authority backlinks for SEO improvement",
    },
    {
      id: 4,
      name: "TikTok Views",
      category: "Social Media",
      price: "₱0.30/1000",
      rating: 4.9,
      reviews: 428,
      description: "Boost your TikTok video visibility instantly",
    },
    {
      id: 5,
      name: "YouTube Subscribers",
      category: "Social Media",
      price: "₱2/subscriber",
      rating: 4.6,
      reviews: 156,
      description: "Grow your YouTube channel with real subscribers",
    },
    {
      id: 6,
      name: "Twitter Followers",
      category: "Social Media",
      price: "₱0.60/100",
      rating: 4.8,
      reviews: 201,
      description: "Increase your Twitter presence with active followers",
    },
  ]

  return (
    <PageLayout title="Service List">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-shadow"
          >
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">{service.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{service.category}</p>
            </div>

            <p className="text-sm text-gray-600 mb-4">{service.description}</p>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="ml-1 font-semibold text-slate-900">{service.rating}</span>
              </div>
              <span className="text-sm text-gray-600">({service.reviews} reviews)</span>
            </div>

            <div className="mb-4 pb-4 border-t border-gray-100">
              <p className="text-2xl font-bold text-green-600 mt-4">{service.price}</p>
            </div>

            <button className="w-full bg-green-500 text-slate-900 font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
              Order Now
            </button>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
