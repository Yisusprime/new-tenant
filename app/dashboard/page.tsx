"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import LoadingScreen from "@/components/loading-screen"

export default function DashboardRedirect() {
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/login")
      return
    }

    // Redirigir según el rol del usuario
    if (userProfile) {
      const { role } = userProfile

      if (role === "superadmin") {
        router.push("/superadmin/dashboard")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, userProfile, loading, router])

  return <LoadingScreen message="Redirigiendo al dashboard correspondiente..." />
}
