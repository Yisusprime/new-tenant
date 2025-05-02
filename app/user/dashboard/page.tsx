"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Settings, HelpCircle } from "lucide-react"
import Link from "next/link"
import LoadingScreen from "@/components/loading-screen"

export default function UserDashboard() {
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !user || !userProfile) {
    return <LoadingScreen />
  }

  return (
    <DashboardLayout>
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard de Usuario</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Bienvenido, {userProfile.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
              <CardDescription>Información de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{userProfile.name}</h3>
                  <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                  <p className="text-xs text-muted-foreground">Rol: {userProfile.role}</p>
                </div>
              </div>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Editar Perfil
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Ayuda y Soporte
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acceso Rápido</CardTitle>
              <CardDescription>Acciones disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/settings">
                  <Button variant="outline" className="w-full h-24 flex flex-col">
                    <Settings className="h-8 w-8 mb-2" />
                    <span>Configuración</span>
                  </Button>
                </Link>
                <Link href="/help">
                  <Button variant="outline" className="w-full h-24 flex flex-col">
                    <HelpCircle className="h-8 w-8 mb-2" />
                    <span>Ayuda</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
            <CardDescription>Detalles sobre tu cuenta y el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Información de Usuario</p>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      <span className="font-medium">ID:</span> {user.uid}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> {userProfile.email}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Rol:</span> {userProfile.role}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Fecha de registro:</span>{" "}
                      {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : "No disponible"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Información del Tenant</p>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      <span className="font-medium">Tenant ID:</span> {userProfile.tenantId || "No asignado"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Propietario:</span> {userProfile.isTenantOwner ? "Sí" : "No"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Si necesitas cambiar tu rol o acceder a funcionalidades adicionales, contacta con el administrador del
                  sistema.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
