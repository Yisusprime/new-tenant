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

    // Verificar si estamos en un subdominio
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

    // Obtener el subdominio actual
    const getCurrentSubdomain = () => {
      if (typeof window === "undefined") return null

      const hostname = window.location.hostname
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

      if (hostname.endsWith(`.${rootDomain}`)) {
        return hostname.replace(`.${rootDomain}`, "")
      }

      if (hostname.includes("localhost")) {
        const subdomainMatch = hostname.match(/^([^.]+)\.localhost/)
        if (subdomainMatch) {
          return subdomainMatch[1]
        }
      }

      return null
    }

    // Redirigir según el rol del usuario
    if (userProfile) {
      const { role, tenantId } = userProfile
      const currentSubdomain = getCurrentSubdomain()
      const isOnSubdomain = isSubdomain()

      console.log("Redirección del dashboard:", {
        role,
        tenantId,
        currentSubdomain,
        isOnSubdomain,
      })

      // Si el usuario es superadmin y está en un subdominio, redirigirlo al dominio principal
      if (role === "superadmin" && isOnSubdomain) {
        console.log("Usuario superadmin en subdominio, redirigiendo al dominio principal")
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
        window.location.href = `https://www.${rootDomain}/superadmin/dashboard`
        return
      }

      // Si estamos en un subdominio pero el usuario pertenece a otro tenant
      if (isOnSubdomain && currentSubdomain !== tenantId && role !== "superadmin" && role !== "admin") {
        console.log("Usuario en subdominio incorrecto, redirigiendo a su tenant")
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
        window.location.href = `https://${tenantId}.${rootDomain}/dashboard`
        return
      }

      // Redirección basada en rol
      switch (role) {
        case "superadmin":
          // Solo redirigir a superadmin dashboard si estamos en el dominio principal
          if (!isOnSubdomain) {
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
