"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  LayoutDashboard,
  Plus,
  ShoppingBag,
  DollarSign,
  List,
  BarChart3,
  Settings,
  Menu,
  X,
  Shield,
  Users,
} from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  // User menu items (limited to dashboard, my orders, reports)
  const userMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { id: "my-orders", label: "My Orders", icon: ShoppingBag, href: "/my-orders" },
    { id: "reports", label: "Reports", icon: BarChart3, href: "/reports" },
  ]

  // Admin gets all user functions PLUS admin-specific items
  const adminMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { id: "new-order", label: "New Order", icon: Plus, href: "/new-order" },
    { id: "my-orders", label: "My Orders", icon: ShoppingBag, href: "/my-orders" },
    { id: "balance", label: "Balance", icon: DollarSign, href: "/balance" },
    { id: "service-list", label: "Service List", icon: List, href: "/service-list" },
    { id: "reports", label: "Reports", icon: BarChart3, href: "/reports" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
    { id: "divider", label: "divider", icon: null, href: "" }, // Divider
    { id: "users", label: "User Management", icon: Users, href: "/admin/users" },
    { id: "pricing", label: "Pricing Management", icon: DollarSign, href: "/admin" },
  ]

  // Select menu based on user role
  const menuItems = user?.role === "admin" ? adminMenuItems : userMenuItems

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 md:hidden p-2 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static w-72 h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col z-40 transition-all duration-300 md:translate-x-0 shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Section */}
        <div className="relative p-8 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 to-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 overflow-hidden">
              <Image src="/logo.png" alt="Logo" width={48} height={48} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-lg tracking-tight">SMM Panel</p>
              <p className="font-bold text-green-400 text-sm tracking-wide">Reseller Platform</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-green-500/0 via-green-500 to-green-500/0 rounded-full"></div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-8 px-5 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            // Render divider
            if (item.id === "divider") {
              return (
                <div key={item.id} className="py-2">
                  <div className="border-t border-slate-700/50"></div>
                  <p className="text-xs text-gray-500 mt-3 px-4 font-semibold tracking-wider">ADMIN</p>
                </div>
              )
            }

            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link key={item.id} href={item.href}>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 text-left font-medium ${
                    active
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 scale-105"
                      : "text-gray-300 hover:text-white hover:bg-slate-800/50 hover:translate-x-1"
                  }`}
                >
                  {Icon && <Icon size={20} className="flex-shrink-0" />}
                  <span>{item.label}</span>
                  {active && <div className="ml-auto w-2 h-2 bg-white rounded-full shadow-md"></div>}
                </button>
              </Link>
            )
          })}
        </nav>

        {/* Footer Section */}
        <div className="p-6 border-t border-slate-700/50 bg-gradient-to-t from-slate-950 to-slate-900/50">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-10 h-10 opacity-30 object-contain" />
            </div>
            <p className="text-xs text-gray-400 font-medium tracking-wide">SMM RESELLER PANEL</p>
          </div>
        </div>
      </aside>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.7);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(34, 197, 94, 0.5) rgba(30, 41, 59, 0.5);
        }
      `}</style>
    </>
  )
}
