"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"
import { getTenantInfo } from "@/lib/tenant-utils"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [tenantInfo, setTenantInfo] = useState<any>(null)
  const [loadingTenant, setLoadingTenant] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

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

  const handleSaveSettings = () => {
    setIsSaving(true)

    // Simulate saving
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido guardados correctamente.",
      })
    }, 1000)
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
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <TenantAdminSidebar tenantid={tenantId} />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Configuración - {tenantInfo.name}</h1>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Apariencia</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Configuración General</CardTitle>
                <CardDescription>Gestiona la configuración básica de tu restaurante</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="restaurant-name">Nombre del Restaurante</Label>
                  <Input id="restaurant-name" defaultValue={tenantInfo.name} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email de Contacto</Label>
                  <Input id="contact-email" type="email" defaultValue={tenantInfo.ownerEmail || ""} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" type="tel" defaultValue="(123) 456-7890" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" defaultValue="Calle Principal 123, Ciudad" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="online-ordering">Pedidos Online</Label>
                    <p className="text-sm text-muted-foreground">Permitir a los clientes realizar pedidos online</p>
                  </div>
                  <Switch id="online-ordering" defaultChecked />
                </div>

                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Apariencia</CardTitle>
                <CardDescription>Personaliza la apariencia de tu sitio</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Configuración de apariencia en construcción...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>Configura las notificaciones de tu restaurante</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Configuración de notificaciones en construcción...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
