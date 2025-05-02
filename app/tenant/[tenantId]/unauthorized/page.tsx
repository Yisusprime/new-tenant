"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export default function Unauthorized() {
  const params = useParams()
  const tenantId = params?.tenantId as string
  const { userProfile } = useAuth()

  // Determinar a dónde redirigir al usuario según su rol
  const getRedirectPath = () => {
    if (!userProfile) return `/tenant/${tenantId}/login`

    switch (userProfile.role) {
      case "admin":
        return `/tenant/${tenantId}/dashboard`
      case "client":
        return `/tenant/${tenantId}/client`
      case "delivery":
        return `/tenant/${tenantId}/delivery`
      case "waiter":
        return `/tenant/${tenantId}/waiter`
      case "manager":
        return `/tenant/${tenantId}/manager`
      default:
        return `/tenant/${tenantId}/login`
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold mb-4">Acceso Denegado</h1>
        <p className="text-muted-foreground mb-8">
          No tienes permiso para acceder a esta área. Por favor, contacta con el administrador si crees que esto es un
          error.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href={getRedirectPath()}>Ir a mi Área</Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver atrás
          </Button>
        </div>
      </div>
    </div>
  )
}
