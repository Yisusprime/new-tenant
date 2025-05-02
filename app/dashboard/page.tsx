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

      switch (role) {
        case "superadmin":
          router.push("/superadmin/dashboard")
          break
        case "admin":
          router.push("/admin/dashboard")
          break
        case "manager":
          router.push("/manager/dashboard")
          break
        case "waiter":
          router.push("/waiter/dashboard")
          break
        case "delivery":
          router.push("/delivery/dashboard")
          break
        case "client":
          router.push("/client/dashboard")
          break
        default:
          router.push("/user/dashboard")
      }
    }
  }, [user, userProfile, loading, router])

  return <LoadingScreen message="Redirigiendo al dashboard correspondiente..." />
}
