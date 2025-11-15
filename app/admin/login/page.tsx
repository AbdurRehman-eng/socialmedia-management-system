"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Shield } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...credentials,
          role: "admin",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Login failed")
        return
      }

      toast.success("Admin login successful!")
      router.push("/admin/users")
      router.refresh()
    } catch (error) {
      toast.error("An error occurred during login")
      console.error("Login error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden bg-slate-800 shadow-lg">
              <Image src="/logo.png" alt="Logo" width={80} height={80} className="w-full h-full object-contain p-2" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-gray-600">Access administrative panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Admin Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter admin username"
              value={credentials.username}
              onChange={(e) =>
                setCredentials({ ...credentials, username: e.target.value })
              }
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Admin Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter admin password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-900"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Admin Sign In"
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          <Link href="/login" className="text-slate-800 hover:underline">
            User? Login here
          </Link>
        </div>
      </Card>
    </div>
  )
}

