"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Edit, Camera } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const { user, loading, logout, checkUserRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [isLogoutRef, setIsLogoutRef] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // Datos de ejemplo para el perfil
  const [profileData, setProfileData] = useState({
    name: "Carlos Rodríguez",
    email: "carlos@ejemplo.com",
    phone: "+34 612 345 678",
    role: "Administrador",
    joinDate: "15/03/2023",
    avatar: "/placeholder.svg?key=tg44l",
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

  useEffect(() => {
    // Verificar si el usuario está autenticado y tiene acceso a este tenant
    if (
      !loading &&
      !isLogoutRef &&
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

    // Actualizar los datos del perfil con la información del usuario
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }))
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

  const handleSaveProfile = () => {
    toast({
      title: "Perfil actualizado",
      description: "Los cambios en tu perfil han sido guardados correctamente.",
    })
    setEditMode(false)
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
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Perfil Personal</h1>
            <p className="text-muted-foreground">Gestiona tu información personal y preferencias</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Gestiona tu información personal y de contacto</CardDescription>
              </div>
              <Button variant={editMode ? "default" : "outline"} size="sm" onClick={() => setEditMode(!editMode)}>
                {editMode ? (
                  "Cancelar"
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt={profileData.name} />
                      <AvatarFallback>{profileData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {editMode && (
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="text-center">
                    <Badge variant="outline">{profileData.role}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">Miembro desde {profileData.joinDate}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      {editMode ? (
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm font-medium">{profileData.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      {editMode ? (
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm font-medium">{profileData.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      {editMode ? (
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm font-medium">{profileData.phone}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rol</Label>
                      <p className="text-sm font-medium">{profileData.role}</p>
                    </div>
                  </div>

                  {editMode && (
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setEditMode(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveProfile}>Guardar cambios</Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Gestiona tu contraseña y seguridad de la cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Contraseña actual</Label>
                <Input id="current-password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input id="new-password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" />
              </div>
              <Button className="w-full">Actualizar contraseña</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Configura tus preferencias de notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nuevos pedidos</Label>
                  <p className="text-sm text-muted-foreground">Recibe notificaciones de nuevos pedidos</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reseñas de clientes</Label>
                  <p className="text-sm text-muted-foreground">Notificaciones de nuevas reseñas</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Actualizaciones del sistema</Label>
                  <p className="text-sm text-muted-foreground">Información sobre actualizaciones</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Boletín informativo</Label>
                  <p className="text-sm text-muted-foreground">Recibe noticias y promociones</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
