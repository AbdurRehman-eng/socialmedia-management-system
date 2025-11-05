"use client"

import type React from "react"

import Sidebar from "./sidebar"
import TopBar from "./top-bar"

interface PageLayoutProps {
  title: string
  children: React.ReactNode
}

export default function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="flex h-screen bg-green-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 sm:mb-6">{title}</h1>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
