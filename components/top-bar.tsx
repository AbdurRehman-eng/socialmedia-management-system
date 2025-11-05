"use client"

import { Search, Bell, User, Key } from "lucide-react"
import { useState } from "react"

export default function TopBar() {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <header className="bg-green-100 border-b border-green-200 px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
      {/* Admin Dropdown */}
      <div className="hidden sm:flex items-center gap-2">
        <button className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-slate-900 font-bold hover:bg-green-600 transition">
          ≡
        </button>
        <span className="text-slate-900 font-semibold text-sm md:text-base">Admin</span>
      </div>

      {/* Search Bar - Hidden on mobile, shown on tablet+ */}
      <div className="hidden md:flex flex-1 mx-4 lg:mx-8 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search"
          className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 placeholder-gray-400 text-sm"
        />
      </div>

      {/* Mobile Search Toggle */}
      <button className="md:hidden p-2 hover:bg-green-200 rounded-lg transition">
        <Search size={20} className="text-slate-900" />
      </button>

      {/* Right Icons */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="p-2 hover:bg-green-200 rounded-lg transition hidden sm:block">
          <Bell size={20} className="text-slate-900" />
        </button>
        <button className="p-2 hover:bg-green-200 rounded-lg transition hidden sm:block">
          <User size={20} className="text-slate-900" />
        </button>
        <button className="flex items-center gap-1 sm:gap-2 bg-slate-900 text-green-500 px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-slate-800 transition text-xs sm:text-sm md:text-base">
          <Key size={16} className="hidden sm:inline" />
          API Key
        </button>
      </div>
    </header>
  )
}
