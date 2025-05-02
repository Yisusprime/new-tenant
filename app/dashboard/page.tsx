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

    // Función para verificar si estamos en un subdominio
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

    // Función para obtener el dominio principal
    const getMainDomain = () => {
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
      return window.location.protocol + "//" + rootDomain
    }

    // Redirigir según el rol del usuario
    if (userProfile) {
      const { role } = userProfile

      // Si el usuario es superadmin y está en un subdominio, redirigirlo al dominio principal
      if (role === "superadmin" && isSubdomain()) {
        console.log("Usuario superadmin en subdominio, redirigiendo al dominio principal")
        window.location.href = `${getMainDomain()}/superadmin/dashboard`
        return
      }

      // Si no estamos en un subdominio, manejar la redirección normal
      switch (role) {
        case "superadmin":
          // Solo redirigir a superadmin dashboard si estamos en el dominio principal
          if (!isSubdomain()) {
            router.push("/superadmin/dashboard")
          } else {
            // Si por alguna razón un superadmin está en un subdominio, tratarlo como admin
            router.push("/admin/dashboard")
          }
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
