"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SuperAdminSidebar } from "@/components/superadmin-sidebar"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase-config"

export default function SuperAdminDashboardPage() {
  const { user, loading, logout, checkUserRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [tenants, setTenants] = useState<any[]>([])
  const [loadingTenants, setLoadingTenants] = useState(true)

  useEffect(() => {
    async function fetchTenants() {
      try {
        const tenantsRef = collection(db, "tenants")
        const tenantsSnap = await getDocs(tenantsRef)

        const tenantsData = tenantsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }))

        setTenants(tenantsData)
      } catch (error) {
        console.error("Error al obtener tenants:", error)
      } finally {
        setLoadingTenants(false)
      }
    }

    fetchTenants()
  }, [])

  useEffect(() => {
    // Verificar si el usuario está autenticado y es superadmin
    if (!loading && (!user || !checkUserRole("superadmin"))) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos de Super Admin para acceder a este dashboard.",
        variant: "destructive",
      })
      router.push("/superadmin/login")
    }
  }, [user, loading, router, toast, checkUserRole])

  const handleLogout = async () => {
    await logout()
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    })
    router.push("/superadmin/login")
  }

  if (loading || loadingTenants) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <SuperAdminSidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Panel de Super Administrador</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name || user?.email} (Super Admin)</span>
            <Button variant="outline" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>

        <Tabs defaultValue="tenants">
          <TabsList className="mb-4">
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="tenants">
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Tenants Registrados</h2>
                <Link href="/superadmin/tenants/new">
                  <Button>Añadir Nuevo Tenant</Button>
                </Link>
              </div>

              <div className="grid gap-4">
                {tenants.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No hay tenants registrados</p>
                    </CardContent>
                  </Card>
                ) : (
                  tenants.map((tenant) => (
                    <Card key={tenant.id}>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{tenant.name}</h3>
                          <p className="text-sm text-muted-foreground">{tenant.domain}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${
                              tenant.status === "active" ? "bg-green-500" : "bg-amber-500"
                            }`}
                          ></span>
                          <span className="text-sm">{tenant.status === "active" ? "Activo" : "Pendiente"}</span>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/superadmin/tenants/${tenant.id}`}>Gestionar</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas Generales</CardTitle>
                <CardDescription>Resumen de actividad en la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-4xl font-bold">{tenants.length}</p>
                    <p className="text-sm text-muted-foreground">Total Tenants</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-4xl font-bold">{tenants.filter((t) => t.status === "active").length}</p>
                    <p className="text-sm text-muted-foreground">Tenants Activos</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-4xl font-bold">{tenants.filter((t) => t.status === "pending").length}</p>
                    <p className="text-sm text-muted-foreground">Tenants Pendientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de la Plataforma</CardTitle>
                <CardDescription>Gestiona la configuración global</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Configuración del sistema en construcción...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
