"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut } from "lucide-react"

export default function ClientDashboard() {
  const params = useParams()
  const tenantId = params?.tenantId as string
  const router = useRouter()
  const { user, userProfile, loading: authLoading, signOut } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si el usuario está autenticado y es cliente
    if (!authLoading) {
      if (!user) {
        router.push(`/tenant/${tenantId}/login`)
        return
      }

      if (userProfile?.role !== "client" || userProfile?.tenantId !== tenantId) {
        router.push(`/tenant/${tenantId}/unauthorized`)
        return
      }

      setLoading(false)
    }
  }, [user, userProfile, authLoading, tenantId, router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push(`/tenant/${tenantId}/login`)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <div className="container py-12">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-bold text-xl">Portal de Cliente</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </Button>
        </div>
      </header>

      <main className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Bienvenido, {userProfile?.name}</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
              <CardDescription>Información de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Nombre:</strong> {userProfile?.name}
                </p>
                <p>
                  <strong>Correo:</strong> {userProfile?.email}
                </p>
                <p>
                  <strong>Rol:</strong> Cliente
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Acciones disponibles para clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full">Ver Menú</Button>
                <Button className="w-full">Realizar Pedido</Button>
                <Button className="w-full">Historial de Pedidos</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
