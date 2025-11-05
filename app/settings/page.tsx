"use client"

import PageLayout from "@/components/page-layout"
import { Save, Lock, Bell, User } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    fullName: "John Doe",
    email: "john@example.com",
    phone: "+1 234 567 8900",
    timezone: "UTC+8",
    notifications: true,
    emailAlerts: true,
  })

  const handleSave = () => {
    alert("Settings saved successfully!")
  }

  return (
    <PageLayout title="Settings">
      <div className="space-y-6">
        {/* Account Settings */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <User className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-slate-900">Account Information</h2>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                value={settings.fullName}
                onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>UTC+8</option>
                <option>UTC+9</option>
                <option>UTC+10</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
          </div>

          <div className="space-y-4 max-w-2xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="font-medium text-slate-900">Enable push notifications</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="font-medium text-slate-900">Email notifications for orders</span>
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-slate-900">Security</h2>
          </div>

          <div className="space-y-4 max-w-2xl">
            <button className="w-full px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium">
              Change Password
            </button>
            <button className="w-full px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium">
              Enable Two-Factor Authentication
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-green-500 text-slate-900 rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </PageLayout>
  )
}
