"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"
import { getTenantInfo } from "@/lib/tenant-utils"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Phone, Save, Palette, ImageIcon, Info, CreditCard, LayoutGrid, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BlobImageUploader } from "@/components/blob-image-uploader"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { Slider } from "@/components/ui/slider"

export default function RestaurantPage() {
  const { user, loading, logout, checkUserRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [tenantInfo, setTenantInfo] = useState<any>(null)
  const [loadingTenant, setLoadingTenant] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [isLogoutRef, setIsLogoutRef] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)

  // Datos del restaurante
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
    // Datos de personalización
    logoUrl: "/restaurant-logo.png",
    bannerUrl: "/modern-restaurant-interior.png",
    primaryColor: "#f97316", // orange-500
    secondaryColor: "#dc2626", // red-600
    buttonColor: "#f97316", // orange-500
    productButtonColor: "#f97316", // color para botones de productos
    buttonTextColor: "#ffffff", // color de texto en botones
    backgroundColor: "#f9fafb", // color de fondo
    bannerOpacity: 0.2, // Opacidad del banner
    isOpen: true, // Estado del restaurante (abierto/cerrado)
    socialMedia: {
      facebook: "restauranteejemplo",
      instagram: "@restauranteejemplo",
      twitter: "@rest_ejemplo",
    },
    // Opciones para métodos de pago
    paymentMethods: {
      acceptsCash: true,
      acceptsCard: true,
      acceptsTransfer: false,
      acceptsOnlinePayment: false,
      onlinePaymentInstructions: "",
    },
    // Opciones para servicios
    serviceOptions: {
      offersPickup: true,
      offersTakeaway: true,
      offersDelivery: false,
      deliveryRadius: "",
      deliveryFee: "",
      freeDeliveryThreshold: "",
      estimatedDeliveryTime: "",
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

  useEffect(() => {
    async function fetchTenantInfo() {
      if (!tenantId) return

      try {
        const info = await getTenantInfo(tenantId)
        setTenantInfo(info)

        // Cargar datos del tenant desde Firestore
        const tenantRef = doc(db, "tenants", tenantId)
        const tenantSnap = await getDoc(tenantRef)

        if (tenantSnap.exists()) {
          const data = tenantSnap.data()

          // Combinar datos existentes con los predeterminados
          setRestaurantData((prev) => ({
            ...prev,
            ...data,
            name: data.name || prev.name,
            description: data.description || prev.description,
            address: data.address || prev.address,
            phone: data.phone || prev.phone,
            email: data.email || prev.email,
            website: data.website || prev.website,
            logoUrl: data.logoUrl || prev.logoUrl,
            bannerUrl: data.bannerUrl || prev.bannerUrl,
            primaryColor: data.primaryColor || prev.primaryColor,
            secondaryColor: data.secondaryColor || prev.secondaryColor,
            buttonColor: data.buttonColor || prev.buttonColor,
            buttonTextColor: data.buttonTextColor || prev.buttonTextColor,
            backgroundColor: data.backgroundColor || prev.backgroundColor,
            bannerOpacity: data.bannerOpacity !== undefined ? data.bannerOpacity : prev.bannerOpacity,
            isOpen: data.isOpen !== undefined ? data.isOpen : prev.isOpen,
            openingHours: data.openingHours || prev.openingHours,
            features: data.features || prev.features,
            socialMedia: data.socialMedia || prev.socialMedia,
            paymentMethods: {
              ...prev.paymentMethods,
              ...(data.paymentMethods || {}),
            },
            serviceOptions: {
              ...prev.serviceOptions,
              ...(data.serviceOptions || {}),
            },
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

  // Manejar cambios en los campos de texto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Manejar campos anidados (como socialMedia.facebook)
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setRestaurantData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setRestaurantData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Manejar cambios en los switches
  const handleSwitchChange = (name: string, checked: boolean) => {
    setRestaurantData((prev) => ({ ...prev, [name]: checked }))
  }

  // Manejar cambios en los switches anidados
  const handleNestedSwitchChange = (parent: string, name: string, checked: boolean) => {
    setRestaurantData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [name]: checked,
      },
    }))
  }

  // Manejar cambios en los horarios
  const handleScheduleChange = (index: number, field: "day" | "hours", value: string) => {
    setRestaurantData((prev) => {
      const newHours = [...prev.openingHours]
      newHours[index] = { ...newHours[index], [field]: value }
      return { ...prev, openingHours: newHours }
    })
  }

  // Añadir nuevo horario
  const addSchedule = () => {
    setRestaurantData((prev) => ({
      ...prev,
      openingHours: [...prev.openingHours, { day: "Nuevo día", hours: "00:00 - 00:00" }],
    }))
  }

  // Eliminar horario
  const removeSchedule = (index: number) => {
    setRestaurantData((prev) => {
      const newHours = [...prev.openingHours]
      newHours.splice(index, 1)
      return { ...prev, openingHours: newHours }
    })
  }

  // Manejar subida de logo
  const handleLogoUpload = (url: string) => {
    setRestaurantData((prev) => ({ ...prev, logoUrl: url }))
  }

  // Manejar subida de banner
  const handleBannerUpload = (url: string) => {
    setRestaurantData((prev) => ({ ...prev, bannerUrl: url }))
  }

  // Manejar cambio en el slider de opacidad
  const handleOpacityChange = (value: number[]) => {
    setRestaurantData((prev) => ({ ...prev, bannerOpacity: value[0] }))
  }

  const handleSaveRestaurant = async () => {
    if (!tenantId) return

    setSaving(true)
    try {
      const tenantRef = doc(db, "tenants", tenantId)

      await updateDoc(tenantRef, {
        ...restaurantData,
        updatedAt: serverTimestamp(),
      })

      toast({
        title: "Información actualizada",
        description: "Los datos del restaurante han sido actualizados correctamente.",
      })
      setEditMode(false)
    } catch (error) {
      console.error("Error al guardar cambios:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
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
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Tenant no encontrado</h2>
            <p className="text-muted-foreground mb-4">El tenant "{tenantId}" no existe o no está disponible</p>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <TenantAdminSidebar tenantid={tenantId} />
      <div className="flex-1 p-4 md:p-8 overflow-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Datos del Local</h1>
            <p className="text-muted-foreground">Gestiona la información y apariencia de tu restaurante</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleSaveRestaurant} disabled={saving}>
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
            <Button variant="outline" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="general">
              <Info className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="images">
              <ImageIcon className="h-4 w-4 mr-2" />
              Imágenes
            </TabsTrigger>
            <TabsTrigger value="colors">
              <Palette className="h-4 w-4 mr-2" />
              Colores
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Phone className="h-4 w-4 mr-2" />
              Contacto
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="h-4 w-4 mr-2" />
              Pagos y Servicios
            </TabsTrigger>
            <TabsTrigger value="display">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Visualización
            </TabsTrigger>
          </TabsList>

          {/* Pestaña General */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>Datos básicos de tu restaurante</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del restaurante</Label>
                    <Input id="name" name="name" value={restaurantData.name} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isOpen">Estado del restaurante</Label>
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{restaurantData.isOpen ? "Abierto" : "Cerrado"}</p>
                        <p className="text-xs text-muted-foreground">
                          {restaurantData.isOpen
                            ? "Los clientes pueden realizar pedidos"
                            : "Los clientes no pueden realizar pedidos"}
                        </p>
                      </div>
                      <Switch
                        checked={restaurantData.isOpen}
                        onCheckedChange={(checked) => handleSwitchChange("isOpen", checked)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={restaurantData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Describe brevemente tu restaurante, especialidades y propuesta de valor.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña Imágenes */}
          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Imágenes</CardTitle>
                <CardDescription>Logo y banner de tu restaurante</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-4">
                    <Label>Logo del Restaurante</Label>
                    <div className="grid md:grid-cols-2 gap-4 items-start">
                      <div className="flex flex-col gap-2">
                        <div className="bg-gray-50 border rounded-md p-4 flex items-center justify-center h-40">
                          {restaurantData.logoUrl ? (
                            <div className="relative w-32 h-32">
                              <Image
                                src={restaurantData.logoUrl || "/placeholder.svg"}
                                alt="Logo del restaurante"
                                fill
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground">
                              <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                              <p>Sin logo</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col justify-between h-full">
                        <div>
                          <p className="text-sm mb-2">Sube el logo de tu restaurante</p>
                          <p className="text-xs text-muted-foreground mb-4">
                            Recomendado: Imagen cuadrada de al menos 200x200px
                          </p>
                        </div>
                        <BlobImageUploader
                          currentImageUrl={restaurantData.logoUrl}
                          onImageUploaded={handleLogoUpload}
                          folder="logos"
                          aspectRatio="square"
                          tenantId={tenantId || undefined}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>Banner del Restaurante</Label>
                    <div className="grid md:grid-cols-2 gap-4 items-start">
                      <div className="flex flex-col gap-2">
                        <div className="bg-gray-50 border rounded-md p-4 flex items-center justify-center h-40">
                          {restaurantData.bannerUrl ? (
                            <div className="relative w-full h-32">
                              <Image
                                src={restaurantData.bannerUrl || "/placeholder.svg"}
                                alt="Banner del restaurante"
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground">
                              <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                              <p>Sin banner</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col justify-between h-full">
                        <div>
                          <p className="text-sm mb-2">Sube el banner de tu restaurante</p>
                          <p className="text-xs text-muted-foreground mb-4">
                            Recomendado: Imagen panorámica de al menos 1200x400px
                          </p>
                        </div>
                        <BlobImageUploader
                          currentImageUrl={restaurantData.bannerUrl}
                          onImageUploaded={handleBannerUpload}
                          folder="banners"
                          aspectRatio="wide"
                          tenantId={tenantId || undefined}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña Colores */}
          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle>Colores</CardTitle>
                <CardDescription>Personaliza los colores de tu tienda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Color primario</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: restaurantData.primaryColor }}
                      />
                      <Input
                        id="primaryColor"
                        name="primaryColor"
                        type="color"
                        value={restaurantData.primaryColor}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Color principal de tu marca</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Color secundario</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: restaurantData.secondaryColor }}
                      />
                      <Input
                        id="secondaryColor"
                        name="secondaryColor"
                        type="color"
                        value={restaurantData.secondaryColor}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Color complementario de tu marca</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buttonColor">Color de botones</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: restaurantData.buttonColor }}
                      />
                      <Input
                        id="buttonColor"
                        name="buttonColor"
                        type="color"
                        value={restaurantData.buttonColor}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Color para botones principales</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buttonTextColor">Color de texto en botones</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: restaurantData.buttonTextColor }}
                      />
                      <Input
                        id="buttonTextColor"
                        name="buttonTextColor"
                        type="color"
                        value={restaurantData.buttonTextColor}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Color del texto dentro de los botones</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Color de fondo</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: restaurantData.backgroundColor }}
                      />
                      <Input
                        id="backgroundColor"
                        name="backgroundColor"
                        type="color"
                        value={restaurantData.backgroundColor}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Color de fondo para la tienda</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productButtonColor">Color de botones de productos</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: restaurantData.productButtonColor }}
                      />
                      <Input
                        id="productButtonColor"
                        name="productButtonColor"
                        type="color"
                        value={restaurantData.productButtonColor}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Color para botones de productos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña Contacto */}
          <TabsContent value="contact">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                  <CardDescription>Datos de contacto de tu restaurante</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input id="address" name="address" value={restaurantData.address} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" name="phone" value={restaurantData.phone} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={restaurantData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Sitio web</Label>
                    <Input id="website" name="website" value={restaurantData.website} onChange={handleInputChange} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Redes Sociales</CardTitle>
                  <CardDescription>Enlaces a tus perfiles sociales</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="socialMedia.facebook">Facebook</Label>
                    <Input
                      id="socialMedia.facebook"
                      name="socialMedia.facebook"
                      value={restaurantData.socialMedia.facebook}
                      onChange={handleInputChange}
                      placeholder="restauranteejemplo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialMedia.instagram">Instagram</Label>
                    <Input
                      id="socialMedia.instagram"
                      name="socialMedia.instagram"
                      value={restaurantData.socialMedia.instagram}
                      onChange={handleInputChange}
                      placeholder="@restauranteejemplo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialMedia.twitter">Twitter</Label>
                    <Input
                      id="socialMedia.twitter"
                      name="socialMedia.twitter"
                      value={restaurantData.socialMedia.twitter}
                      onChange={handleInputChange}
                      placeholder="@rest_ejemplo"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Horario de Apertura</CardTitle>
                  <CardDescription>Configura los horarios de tu restaurante</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {restaurantData.openingHours.map((schedule, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex-1">
                          <Input
                            value={schedule.day}
                            onChange={(e) => handleScheduleChange(index, "day", e.target.value)}
                            placeholder="Día"
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            value={schedule.hours}
                            onChange={(e) => handleScheduleChange(index, "hours", e.target.value)}
                            placeholder="Horario"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSchedule(index)}
                          className="text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addSchedule} className="w-full">
                      Añadir horario
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pestaña Pagos y Servicios */}
          <TabsContent value="payment">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Métodos de Pago</CardTitle>
                  <CardDescription>Configura las formas de pago aceptadas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Efectivo</p>
                      <p className="text-xs text-muted-foreground">Aceptar pagos en efectivo</p>
                    </div>
                    <Switch
                      checked={restaurantData.paymentMethods.acceptsCash}
                      onCheckedChange={(checked) => handleNestedSwitchChange("paymentMethods", "acceptsCash", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Tarjeta</p>
                      <p className="text-xs text-muted-foreground">Aceptar pagos con tarjeta</p>
                    </div>
                    <Switch
                      checked={restaurantData.paymentMethods.acceptsCard}
                      onCheckedChange={(checked) => handleNestedSwitchChange("paymentMethods", "acceptsCard", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Transferencia</p>
                      <p className="text-xs text-muted-foreground">Aceptar pagos por transferencia bancaria</p>
                    </div>
                    <Switch
                      checked={restaurantData.paymentMethods.acceptsTransfer}
                      onCheckedChange={(checked) =>
                        handleNestedSwitchChange("paymentMethods", "acceptsTransfer", checked)
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Pago online</p>
                      <p className="text-xs text-muted-foreground">Aceptar pagos online</p>
                    </div>
                    <Switch
                      checked={restaurantData.paymentMethods.acceptsOnlinePayment}
                      onCheckedChange={(checked) =>
                        handleNestedSwitchChange("paymentMethods", "acceptsOnlinePayment", checked)
                      }
                    />
                  </div>
                  {restaurantData.paymentMethods.acceptsOnlinePayment && (
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="onlinePaymentInstructions">Instrucciones de pago online</Label>
                      <Textarea
                        id="onlinePaymentInstructions"
                        name="paymentMethods.onlinePaymentInstructions"
                        value={restaurantData.paymentMethods.onlinePaymentInstructions}
                        onChange={handleInputChange}
                        placeholder="Instrucciones para el pago online"
                        rows={3}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Opciones de Servicio</CardTitle>
                  <CardDescription>Configura los servicios que ofreces</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Recogida en local</p>
                      <p className="text-xs text-muted-foreground">Los clientes pueden recoger su pedido</p>
                    </div>
                    <Switch
                      checked={restaurantData.serviceOptions.offersPickup}
                      onCheckedChange={(checked) => handleNestedSwitchChange("serviceOptions", "offersPickup", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Para llevar</p>
                      <p className="text-xs text-muted-foreground">Ofrecer servicio para llevar</p>
                    </div>
                    <Switch
                      checked={restaurantData.serviceOptions.offersTakeaway}
                      onCheckedChange={(checked) =>
                        handleNestedSwitchChange("serviceOptions", "offersTakeaway", checked)
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Entrega a domicilio</p>
                      <p className="text-xs text-muted-foreground">Ofrecer servicio de entrega a domicilio</p>
                    </div>
                    <Switch
                      checked={restaurantData.serviceOptions.offersDelivery}
                      onCheckedChange={(checked) =>
                        handleNestedSwitchChange("serviceOptions", "offersDelivery", checked)
                      }
                    />
                  </div>
                  {restaurantData.serviceOptions.offersDelivery && (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="deliveryRadius">Radio de entrega (km)</Label>
                        <Input
                          id="deliveryRadius"
                          name="serviceOptions.deliveryRadius"
                          value={restaurantData.serviceOptions.deliveryRadius}
                          onChange={handleInputChange}
                          placeholder="Ej: 5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deliveryFee">Coste de entrega (€)</Label>
                        <Input
                          id="deliveryFee"
                          name="serviceOptions.deliveryFee"
                          value={restaurantData.serviceOptions.deliveryFee}
                          onChange={handleInputChange}
                          placeholder="Ej: 2.50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="freeDeliveryThreshold">Pedido mínimo para entrega gratuita (€)</Label>
                        <Input
                          id="freeDeliveryThreshold"
                          name="serviceOptions.freeDeliveryThreshold"
                          value={restaurantData.serviceOptions.freeDeliveryThreshold}
                          onChange={handleInputChange}
                          placeholder="Ej: 20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estimatedDeliveryTime">Tiempo estimado de entrega (min)</Label>
                        <Input
                          id="estimatedDeliveryTime"
                          name="serviceOptions.estimatedDeliveryTime"
                          value={restaurantData.serviceOptions.estimatedDeliveryTime}
                          onChange={handleInputChange}
                          placeholder="Ej: 30-45"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pestaña Visualización */}
          <TabsContent value="display">
            <Card>
              <CardHeader>
                <CardTitle>Opciones de Visualización</CardTitle>
                <CardDescription>Personaliza cómo se muestra tu tienda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Opacidad del banner</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Transparente</span>
                      <span className="text-sm">Opaco</span>
                    </div>
                    <Slider
                      value={[restaurantData.bannerOpacity]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={handleOpacityChange}
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      {Math.round(restaurantData.bannerOpacity * 100)}%
                    </div>
                  </div>
                  <div className="bg-gray-50 border rounded-md p-4 relative overflow-hidden h-40">
                    {restaurantData.bannerUrl && (
                      <div className="absolute inset-0">
                        <Image
                          src={restaurantData.bannerUrl || "/placeholder.svg"}
                          alt="Banner preview"
                          fill
                          className="object-cover"
                          style={{ opacity: restaurantData.bannerOpacity }}
                        />
                      </div>
                    )}
                    <div className="relative z-10 flex items-center justify-center h-full">
                      <div className="bg-white/80 p-4 rounded-md shadow-sm">
                        <p className="font-medium text-center">{restaurantData.name}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Vista previa de cómo se verá el banner con la opacidad seleccionada
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
