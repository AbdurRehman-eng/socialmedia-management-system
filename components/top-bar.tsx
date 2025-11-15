"use client"

import { User, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export default function TopBar() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-green-100 border-b border-green-200 px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
      {/* User Info */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <span className="text-slate-900 font-semibold text-sm md:text-base">
          {user?.username || "User"}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Right Icons */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-lg">
              <User size={20} className="text-slate-900" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-semibold">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
              <LogOut size={16} className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
