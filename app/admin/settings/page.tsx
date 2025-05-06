"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const { user, loading, logout, checkUserRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [isLogoutRef, setIsLogoutRef] = useState(false)
  const [saving, setSaving] = useState(false)

  // Configuraciones de ejemplo
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      orders: true,
      marketing: false,
    },
    appearance: {
      darkMode: false,
      compactMode: false,
    },
    privacy: {
      shareData: false,
      analytics: true,
    },
  })

  // Obtener el tenantId del hostname
  useEffect(() => {
    const hostname = window.location.hostname
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

    if (hostname.includes(`.${rootDomain}`) && !hostname.startsWith("www.")) {
      const subdomain = hostname.replace(`.${rootDomain}`, "")
      setTenantId(subdomain)
    }
  }, [])

  // Verificar autenticación
  useEffect(() => {
    if (
      !loading &&
      !isLogoutRef &&
      tenantId &&
      (!user || (user.tenantId !== tenantId && !checkUserRole("superadmin")))
    ) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder a esta sección.",
        variant: "destructive",
      })
      router.push(`/login`)
    }
  }, [user, loading, tenantId, router, toast, checkUserRole, isLogoutRef])

  const handleLogout = async () => {
    setIsLogoutRef(true)
    await logout()
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    })
    router.push(`/login`)
  }

  const handleToggleSetting = (category: keyof typeof settings, setting: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting as keyof (typeof prev)[category]],
      },
    }))
  }

  const handleSaveSettings = async () => {
    setSaving(true)

    // Simulamos una operación asíncrona
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Configuración guardada",
      description: "Los cambios se han guardado correctamente.",
    })

    setSaving(false)
  }

  if (loading || !tenantId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <TenantAdminSidebar tenantid={tenantId} />
      <div className="flex-1 p-4 md:p-8 overflow-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Configuración</h1>
            <p className="text-muted-foreground">Gestiona las preferencias de tu cuenta</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Notificaciones por email</Label>
                  <p className="text-sm text-muted-foreground">Recibe actualizaciones por correo electrónico</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={() => handleToggleSetting("notifications", "email")}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Notificaciones push</Label>
                  <p className="text-sm text-muted-foreground">Recibe notificaciones en tu dispositivo</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={() => handleToggleSetting("notifications", "push")}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="order-notifications">Notificaciones de pedidos</Label>
                  <p className="text-sm text-muted-foreground">Recibe alertas sobre nuevos pedidos</p>
                </div>
                <Switch
                  id="order-notifications"
                  checked={settings.notifications.orders}
                  onCheckedChange={() => handleToggleSetting("notifications", "orders")}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing-notifications">Notificaciones de marketing</Label>
                  <p className="text-sm text-muted-foreground">Recibe ofertas y promociones</p>
                </div>
                <Switch
                  id="marketing-notifications"
                  checked={settings.notifications.marketing}
                  onCheckedChange={() => handleToggleSetting("notifications", "marketing")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Modo oscuro</Label>
                  <p className="text-sm text-muted-foreground">Cambia a un tema oscuro</p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.appearance.darkMode}
                  onCheckedChange={() => handleToggleSetting("appearance", "darkMode")}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-mode">Modo compacto</Label>
                  <p className="text-sm text-muted-foreground">Reduce el espacio entre elementos</p>
                </div>
                <Switch
                  id="compact-mode"
                  checked={settings.appearance.compactMode}
                  onCheckedChange={() => handleToggleSetting("appearance", "compactMode")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="share-data">Compartir datos</Label>
                  <p className="text-sm text-muted-foreground">Compartir datos anónimos para mejorar el servicio</p>
                </div>
                <Switch
                  id="share-data"
                  checked={settings.privacy.shareData}
                  onCheckedChange={() => handleToggleSetting("privacy", "shareData")}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Analíticas</Label>
                  <p className="text-sm text-muted-foreground">Permitir recopilación de datos de uso</p>
                </div>
                <Switch
                  id="analytics"
                  checked={settings.privacy.analytics}
                  onCheckedChange={() => handleToggleSetting("privacy", "analytics")}
                />
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 flex justify-end">
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
