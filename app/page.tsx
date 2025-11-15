"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (user.role === "admin") {
        router.push("/admin/users")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
    </div>
  )
}
