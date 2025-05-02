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

      // Verificar si estamos en un subdominio de tenant
      const isSubdomain = () => {
        if (typeof window === "undefined") return false

        const hostname = window.location.hostname
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

        // Verificar si es un subdominio del dominio raíz
        if (hostname.endsWith(`.${rootDomain}`) && hostname !== `www.${rootDomain}`) {
          return true
        }

        // Para desarrollo local
        if (hostname.includes("localhost")) {
          const subdomainMatch = hostname.match(/^([^.]+)\.localhost/)
          if (subdomainMatch && subdomainMatch[1] !== "www" && subdomainMatch[1] !== "app") {
            return true
          }
        }

        return false
      }

      // Si estamos en un subdominio y el usuario es superadmin, tratarlo como admin normal
      if (isSubdomain() && role === "superadmin") {
        console.log("Usuario superadmin en subdominio, redirigiendo a admin dashboard")
        router.push("/admin/dashboard")
        return
      }

      switch (role) {
        case "superadmin":
          // Solo redirigir a superadmin dashboard si estamos en el dominio principal
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
