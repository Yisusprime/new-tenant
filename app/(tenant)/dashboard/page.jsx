"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"
import { getTenantInfo } from "@/lib/tenant-utils"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function TenantAdminDashboardPage() {
  const { user, loading, logout, checkUserRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [tenantInfo, setTenantInfo] = useState<any>(null)
  const [loadingTenant, setLoadingTenant] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const isLogoutRef = useRef(false) // Para rastrear si el usuario cerró sesión voluntariamente

  // Obtener el tenantId del hostname
  useEffect(() => {
    const hostname = window.location.hostname
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

    if (hostname.includes(`.${rootDomain}`) && !hostname.startsWith("www.")) {
      const subdomain = hostname.replace(`.${rootDomain}`, "")
      setTenantId(subdomain)
    }
  }, [])

  useEffect(() => {
    async function fetchTenantInfo() {
      if (!tenantId) return

      try {
        const info = await getTenantInfo(tenantId)
        setTenantInfo(info)
      } catch (error) {
        console.error("Error al obtener información del tenant:", error)
      } finally {
        setLoadingTenant(false)
      }
    }

    if (tenantId) {
      fetchTenantInfo()
    }
  }, [tenantId])

  useEffect(() => {
    // Verificar si el usuario está autenticado y tiene acceso a este tenant
    // Solo mostrar el mensaje de error si no fue un cierre de sesión voluntario
    if (
      !loading &&
      !isLogoutRef.current &&
      tenantId &&
      (!user || (user.tenantId !== tenantId && !checkUserRole("superadmin")))
    ) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder a este dashboard.",
        variant: "destructive",
      })
      router.push(`/login`)
    }
  }, [user, loading, tenantId, router, toast, checkUserRole])

  const handleLogout = async () => {
    isLogoutRef.current = true // Marcar que es un cierre de sesión voluntario
    await logout()
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    })
    router.push(`/login`)
  }

  if (loading || loadingTenant || !tenantId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando...</span>
      </div>
    )
  }

  if (!tenantInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Tenant no encontrado</CardTitle>
            <CardDescription className="text-center">
              El tenant "{tenantId}" no existe o no está disponible
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <TenantAdminSidebar tenantid={tenantId} />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Panel de Administración - {tenantInfo.name}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email} ({user?.role})
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Tenant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Nombre:</span>
                      <span>{tenantInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Subdominio:</span>
                      <span>{tenantId}.gastroo.online</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Estado:</span>
                      <span className="flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        Activo
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold">24</p>
                      <p className="text-sm text-muted-foreground">Usuarios</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold">142</p>
                      <p className="text-sm text-muted-foreground">Transacciones</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Usuarios</CardTitle>
                  <CardDescription>Gestiona los usuarios de tu tenant</CardDescription>
                </div>
                <Button>Añadir Usuario</Button>
              </CardHeader>
              <CardContent>
                <p>Lista de usuarios en construcción...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Tenant</CardTitle>
                <CardDescription>Personaliza la configuración de tu tenant</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Configuración del tenant en construcción...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
