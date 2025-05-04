"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"
import { getTenantInfo } from "@/lib/tenant-utils"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  Edit,
  Camera,
  Users,
  ShoppingBag,
  TrendingUp,
  Settings,
  AlertCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

export default function TenantAdminDashboardPage() {
  const { user, loading, logout, checkUserRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [tenantInfo, setTenantInfo] = useState<any>(null)
  const [loadingTenant, setLoadingTenant] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [isLogoutRef, setIsLogoutRef] = useState(false)
  const [editMode, setEditMode] = useState({
    profile: false,
    restaurant: false,
  })

  // Datos de ejemplo para el perfil y el restaurante
  const [profileData, setProfileData] = useState({
    name: "Carlos Rodríguez",
    email: "carlos@ejemplo.com",
    phone: "+34 612 345 678",
    role: "Administrador",
    joinDate: "15/03/2023",
    avatar: "/placeholder.svg?key=tg44l",
  })

  const [restaurantData, setRestaurantData] = useState({
    name: "Restaurante El Buen Sabor",
    description:
      "Ofrecemos la mejor comida casera con ingredientes frescos y de calidad. Especialidad en platos tradicionales y cocina de autor.",
    address: "Calle Principal 123, Ciudad",
    phone: "+34 912 345 678",
    email: "info@elbuensabor.com",
    website: "www.elbuensabor.com",
    openingHours: [
      { day: "Lunes - Viernes", hours: "11:00 - 23:00" },
      { day: "Sábado - Domingo", hours: "12:00 - 00:00" },
      { day: "Festivos", hours: "12:00 - 22:00" },
    ],
    logo: "/restaurant-logo.png",
    coverImage: "/modern-restaurant-interior.png",
    categories: ["Mediterránea", "Española", "Tapas"],
    features: [
      { name: "Terraza", enabled: true },
      { name: "Wifi gratis", enabled: true },
      { name: "Accesible", enabled: true },
      { name: "Parking", enabled: false },
      { name: "Admite mascotas", enabled: false },
    ],
  })

  // Estadísticas de ejemplo
  const stats = [
    { name: "Pedidos hoy", value: 24, icon: ShoppingBag, change: "+12%" },
    { name: "Clientes nuevos", value: 8, icon: Users, change: "+5%" },
    { name: "Ingresos", value: "€1,240", icon: TrendingUp, change: "+18%" },
    { name: "Valoración media", value: "4.8", icon: Star, change: "+0.2" },
  ]

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

        // Actualizar los datos del restaurante con la información del tenant
        if (info) {
          setRestaurantData((prev) => ({
            ...prev,
            name: info.name || prev.name,
          }))
        }
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
    setEditMode((prev) => ({ ...prev, profile: false }))
  }

  const handleSaveRestaurant = () => {
    toast({
      title: "Información actualizada",
      description: "Los datos del restaurante han sido actualizados correctamente.",
    })
    setEditMode((prev) => ({ ...prev, restaurant: false }))
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
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">Gestiona tu restaurante y perfil</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              {user?.name || user?.email} ({user?.role})
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>

        {/* Resumen de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-sm">{stat.name}</span>
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className={`text-xs ${stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                    {stat.change} vs. ayer
                  </span>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Perfil Personal</TabsTrigger>
            <TabsTrigger value="restaurant">Datos del Local</TabsTrigger>
          </TabsList>

          {/* Perfil Personal */}
          <TabsContent value="profile">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>Gestiona tu información personal y de contacto</CardDescription>
                  </div>
                  <Button
                    variant={editMode.profile ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditMode((prev) => ({ ...prev, profile: !prev.profile }))}
                  >
                    {editMode.profile ? (
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
                        {editMode.profile && (
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
                          {editMode.profile ? (
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
                          {editMode.profile ? (
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
                          {editMode.profile ? (
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

                      {editMode.profile && (
                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setEditMode((prev) => ({ ...prev, profile: false }))}
                          >
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
          </TabsContent>

          {/* Datos del Local */}
          <TabsContent value="restaurant">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Información del Restaurante</CardTitle>
                    <CardDescription>Gestiona los datos principales de tu establecimiento</CardDescription>
                  </div>
                  <Button
                    variant={editMode.restaurant ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditMode((prev) => ({ ...prev, restaurant: !prev.restaurant }))}
                  >
                    {editMode.restaurant ? (
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
                  <div className="flex flex-col gap-6">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <Image
                        src={restaurantData.coverImage || "/placeholder.svg"}
                        alt={restaurantData.name}
                        fill
                        className="object-cover"
                      />
                      {editMode.restaurant && (
                        <Button size="sm" variant="secondary" className="absolute bottom-4 right-4">
                          <Camera className="h-4 w-4 mr-2" />
                          Cambiar imagen
                        </Button>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                            <Image
                              src={restaurantData.logo || "/placeholder.svg"}
                              alt={restaurantData.name}
                              width={128}
                              height={128}
                              className="object-cover"
                            />
                          </div>
                          {editMode.restaurant && (
                            <Button
                              size="icon"
                              variant="secondary"
                              className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                            >
                              <Camera className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {restaurantData.categories.map((category, index) => (
                            <Badge key={index} variant="secondary">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="restaurant-name">Nombre del restaurante</Label>
                            {editMode.restaurant ? (
                              <Input
                                id="restaurant-name"
                                value={restaurantData.name}
                                onChange={(e) => setRestaurantData((prev) => ({ ...prev, name: e.target.value }))}
                              />
                            ) : (
                              <p className="text-sm font-medium">{restaurantData.name}</p>
                            )}
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Descripción</Label>
                            {editMode.restaurant ? (
                              <Textarea
                                id="description"
                                value={restaurantData.description}
                                onChange={(e) =>
                                  setRestaurantData((prev) => ({ ...prev, description: e.target.value }))
                                }
                                rows={3}
                              />
                            ) : (
                              <p className="text-sm">{restaurantData.description}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address">Dirección</Label>
                            {editMode.restaurant ? (
                              <Input
                                id="address"
                                value={restaurantData.address}
                                onChange={(e) => setRestaurantData((prev) => ({ ...prev, address: e.target.value }))}
                              />
                            ) : (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{restaurantData.address}</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            {editMode.restaurant ? (
                              <Input
                                id="phone"
                                value={restaurantData.phone}
                                onChange={(e) => setRestaurantData((prev) => ({ ...prev, phone: e.target.value }))}
                              />
                            ) : (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{restaurantData.phone}</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            {editMode.restaurant ? (
                              <Input
                                id="email"
                                type="email"
                                value={restaurantData.email}
                                onChange={(e) => setRestaurantData((prev) => ({ ...prev, email: e.target.value }))}
                              />
                            ) : (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{restaurantData.email}</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="website">Sitio web</Label>
                            {editMode.restaurant ? (
                              <Input
                                id="website"
                                value={restaurantData.website}
                                onChange={(e) => setRestaurantData((prev) => ({ ...prev, website: e.target.value }))}
                              />
                            ) : (
                              <div className="flex items-center gap-2 text-sm">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span>{restaurantData.website}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {editMode.restaurant && (
                          <div className="flex justify-end gap-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setEditMode((prev) => ({ ...prev, restaurant: false }))}
                            >
                              Cancelar
                            </Button>
                            <Button onClick={handleSaveRestaurant}>Guardar cambios</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Horario de Apertura</CardTitle>
                  <CardDescription>Configura los horarios de tu restaurante</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {restaurantData.openingHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{schedule.day}</span>
                      </div>
                      <span>{schedule.hours}</span>
                    </div>
                  ))}
                  <Separator />
                  <Button className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar horarios
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Características del Local</CardTitle>
                  <CardDescription>Servicios y comodidades disponibles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {restaurantData.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{feature.name}</span>
                      <Switch checked={feature.enabled} />
                    </div>
                  ))}
                  <Separator />
                  <Button variant="outline" className="w-full">
                    Añadir característica
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Estado de la cuenta</CardTitle>
                  <CardDescription>Información sobre tu suscripción y uso</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Plan actual</span>
                          <Badge>Premium</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Próxima facturación</span>
                          <span>15/06/2023</span>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Almacenamiento</span>
                          <span className="text-sm">65% usado</span>
                        </div>
                        <Progress value={65} className="h-2" />
                        <p className="text-xs text-muted-foreground">650MB de 1GB</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Actualización disponible</p>
                          <p className="text-xs text-yellow-700">Hay una nueva versión de la plataforma disponible.</p>
                        </div>
                      </div>
                      <div className="flex justify-between gap-4">
                        <Button variant="outline" className="flex-1">
                          <Settings className="h-4 w-4 mr-2" />
                          Configuración
                        </Button>
                        <Button className="flex-1">Actualizar plan</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function Star(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
