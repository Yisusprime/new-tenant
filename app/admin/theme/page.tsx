"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { BlobImageUploader } from "@/components/blob-image-uploader"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"
import {
  Loader2,
  Save,
  Clock,
  MapPin,
  Phone,
  Star,
  Heart,
  Search,
  Plus,
  Home,
  ShoppingBag,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ThemeManager() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewTab, setPreviewTab] = useState("main") // Para cambiar entre vistas previas
  const [tenantData, setTenantData] = useState<any>({
    name: "Restaurante Ejemplo",
    description:
      "Disfruta de la mejor experiencia gastronómica con nuestros platos preparados con ingredientes frescos y de alta calidad.",
    logoUrl: "/restaurant-logo.png",
    bannerUrl: "/modern-restaurant-interior.png",
    primaryColor: "#f97316", // orange-500
    secondaryColor: "#dc2626", // red-600
    buttonColor: "#f97316", // orange-500
    productButtonColor: "#f97316", // color para botones de productos
    buttonTextColor: "#ffffff", // color de texto en botones
    backgroundColor: "#f9fafb", // color de fondo
    bannerOpacity: 0.2, // Nueva opción para controlar la opacidad del banner
    isOpen: true, // Estado predeterminado del restaurante (abierto/cerrado)
    rating: "4.8",
    distance: "0.8 km",
    deliveryTime: "20-35 min",
    address: "Calle Principal 123, Ciudad Ejemplo",
    phone: "+1 234 567 890",
    email: "info@restauranteejemplo.com",
    website: "www.restauranteejemplo.com",
    openingHours: [
      { day: "Lunes - Viernes", hours: "11:00 - 22:00" },
      { day: "Sábados", hours: "12:00 - 23:00" },
      { day: "Domingos", hours: "12:00 - 20:00" },
    ],
    features: ["Terraza", "Wi-Fi gratis", "Accesible", "Estacionamiento"],
    socialMedia: {
      facebook: "restauranteejemplo",
      instagram: "@restauranteejemplo",
      twitter: "@rest_ejemplo",
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

  // Cargar datos del tenant
  useEffect(() => {
    async function loadTenantData() {
      if (!tenantId) return

      try {
        const tenantRef = doc(db, "tenants", tenantId)
        const tenantSnap = await getDoc(tenantRef)

        if (tenantSnap.exists()) {
          const data = tenantSnap.data()

          // Combinar datos existentes con los predeterminados
          setTenantData((prev) => ({
            ...prev,
            ...data,
            // Asegurarse de que estos campos existan
            bannerOpacity: data.bannerOpacity !== undefined ? data.bannerOpacity : prev.bannerOpacity,
            isOpen: data.isOpen !== undefined ? data.isOpen : prev.isOpen,
            openingHours: data.openingHours || prev.openingHours,
            features: data.features || prev.features,
            socialMedia: data.socialMedia || prev.socialMedia,
          }))
        }
      } catch (error) {
        console.error("Error al cargar datos del tenant:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del restaurante",
          variant: "destructive",
        })
      }
    }

    if (tenantId) {
      loadTenantData()
    }
  }, [tenantId, toast])

  // Manejar cambios en los campos de texto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Manejar campos anidados (como socialMedia.facebook)
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setTenantData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setTenantData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Manejar cambios en los switches
  const handleSwitchChange = (name: string, checked: boolean) => {
    setTenantData((prev) => ({ ...prev, [name]: checked }))
  }

  // Manejar cambios en los horarios
  const handleScheduleChange = (index: number, field: "day" | "hours", value: string) => {
    setTenantData((prev) => {
      const newHours = [...prev.openingHours]
      newHours[index] = { ...newHours[index], [field]: value }
      return { ...prev, openingHours: newHours }
    })
  }

  // Manejar cambios en las características
  const handleFeatureChange = (index: number, value: string) => {
    setTenantData((prev) => {
      const newFeatures = [...prev.features]
      newFeatures[index] = value
      return { ...prev, features: newFeatures }
    })
  }

  // Añadir nuevo horario
  const addSchedule = () => {
    setTenantData((prev) => ({
      ...prev,
      openingHours: [...prev.openingHours, { day: "Nuevo día", hours: "00:00 - 00:00" }],
    }))
  }

  // Eliminar horario
  const removeSchedule = (index: number) => {
    setTenantData((prev) => {
      const newHours = [...prev.openingHours]
      newHours.splice(index, 1)
      return { ...prev, openingHours: newHours }
    })
  }

  // Añadir nueva característica
  const addFeature = () => {
    setTenantData((prev) => ({
      ...prev,
      features: [...prev.features, "Nueva característica"],
    }))
  }

  // Eliminar característica
  const removeFeature = (index: number) => {
    setTenantData((prev) => {
      const newFeatures = [...prev.features]
      newFeatures.splice(index, 1)
      return { ...prev, features: newFeatures }
    })
  }

  // Manejar subida de logo
  const handleLogoUpload = (url: string) => {
    setTenantData((prev) => ({ ...prev, logoUrl: url }))
  }

  // Manejar subida de banner
  const handleBannerUpload = (url: string) => {
    setTenantData((prev) => ({ ...prev, bannerUrl: url }))
  }

  // Manejar cambio en el slider de opacidad
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    setTenantData((prev) => ({ ...prev, bannerOpacity: value }))
  }

  // Guardar cambios
  const saveChanges = async () => {
    if (!tenantId) return

    setSaving(true)
    try {
      const tenantRef = doc(db, "tenants", tenantId)

      await updateDoc(tenantRef, {
        ...tenantData,
        updatedAt: serverTimestamp(),
      })

      toast({
        title: "Cambios guardados",
        description: "Los cambios se han guardado correctamente",
      })

      // Notificar al usuario que debe refrescar la página principal para ver los cambios
      toast({
        title: "Actualización completa",
        description:
          "Para ver los cambios en la página principal, haz clic en el botón de actualizar en la esquina superior derecha.",
      })
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

  // Productos de ejemplo para la vista previa
  const exampleProducts = [
    {
      id: "1",
      name: "Pizza Margherita",
      description: "Tomate, mozzarella, albahaca fresca y aceite de oliva",
      price: 12.99,
      imageUrl: "/pizza-margherita.png",
    },
    {
      id: "2",
      name: "Pasta Carbonara",
      description: "Espaguetis con huevo, queso pecorino, panceta y pimienta negra",
      price: 14.5,
      imageUrl: "/pasta-carbonara.png",
    },
    {
      id: "3",
      name: "Tacos al Pastor",
      description: "Tortillas de maíz con carne de cerdo marinada, piña, cebolla y cilantro",
      price: 10.99,
      imageUrl: "/tacos-al-pastor.png",
    },
  ]

  // Categorías de ejemplo para la vista previa
  const exampleCategories = [
    { id: "1", name: "Pizzas", imageUrl: "/delicious-pizza.png" },
    { id: "2", name: "Pastas", imageUrl: "/colorful-pasta-arrangement.png" },
    { id: "3", name: "Tacos", imageUrl: "/delicious-tacos.png" },
    { id: "4", name: "Ensaladas", imageUrl: "/vibrant-salad-bowl.png" },
    { id: "5", name: "Postres", imageUrl: "/placeholder.svg?key=lf6fq" },
    { id: "6", name: "Bebidas", imageUrl: "/placeholder.svg?key=9pfi8" },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <TenantAdminSidebar tenantid={tenantId || ""} />
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Personalización</h1>
            <p className="text-muted-foreground">Personaliza la apariencia de tu restaurante</p>
          </div>
          <Button onClick={saveChanges} disabled={saving} className="mt-4 md:mt-0">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de edición - ahora ocupa 2/3 del espacio */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="general">
              <TabsList className="mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="colors">Colores</TabsTrigger>
                <TabsTrigger value="images">Imágenes</TabsTrigger>
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="display">Visualización</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Información General</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nombre del Restaurante</Label>
                      <Input id="name" name="name" value={tenantData.name} onChange={handleInputChange} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={tenantData.description}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="rating">Calificación</Label>
                        <Input id="rating" name="rating" value={tenantData.rating} onChange={handleInputChange} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="distance">Distancia</Label>
                        <Input id="distance" name="distance" value={tenantData.distance} onChange={handleInputChange} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="deliveryTime">Tiempo de entrega</Label>
                        <Input
                          id="deliveryTime"
                          name="deliveryTime"
                          value={tenantData.deliveryTime}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isOpen"
                        checked={tenantData.isOpen}
                        onCheckedChange={(checked) => handleSwitchChange("isOpen", checked)}
                      />
                      <Label htmlFor="isOpen">Restaurante abierto por defecto</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="colors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Colores</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="primaryColor">Color Primario (Gradiente Inicio)</Label>
                      <div className="flex gap-4 items-center">
                        <Input
                          id="primaryColor"
                          name="primaryColor"
                          type="color"
                          value={tenantData.primaryColor}
                          onChange={handleInputChange}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={tenantData.primaryColor}
                          onChange={handleInputChange}
                          name="primaryColor"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="secondaryColor">Color Secundario (Gradiente Fin)</Label>
                      <div className="flex gap-4 items-center">
                        <Input
                          id="secondaryColor"
                          name="secondaryColor"
                          type="color"
                          value={tenantData.secondaryColor}
                          onChange={handleInputChange}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={tenantData.secondaryColor}
                          onChange={handleInputChange}
                          name="secondaryColor"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="buttonColor">Color de Botones Principales</Label>
                      <div className="flex gap-4 items-center">
                        <Input
                          id="buttonColor"
                          name="buttonColor"
                          type="color"
                          value={tenantData.buttonColor}
                          onChange={handleInputChange}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={tenantData.buttonColor}
                          onChange={handleInputChange}
                          name="buttonColor"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="productButtonColor">Color de Botones de Productos</Label>
                      <div className="flex gap-4 items-center">
                        <Input
                          id="productButtonColor"
                          name="productButtonColor"
                          type="color"
                          value={tenantData.productButtonColor || "#f97316"}
                          onChange={handleInputChange}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={tenantData.productButtonColor || "#f97316"}
                          onChange={handleInputChange}
                          name="productButtonColor"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="buttonTextColor">Color de Texto en Botones</Label>
                      <div className="flex gap-4 items-center">
                        <Input
                          id="buttonTextColor"
                          name="buttonTextColor"
                          type="color"
                          value={tenantData.buttonTextColor || "#ffffff"}
                          onChange={handleInputChange}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={tenantData.buttonTextColor || "#ffffff"}
                          onChange={handleInputChange}
                          name="buttonTextColor"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="backgroundColor">Color de Fondo</Label>
                      <div className="flex gap-4 items-center">
                        <Input
                          id="backgroundColor"
                          name="backgroundColor"
                          type="color"
                          value={tenantData.backgroundColor || "#f9fafb"}
                          onChange={handleInputChange}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={tenantData.backgroundColor || "#f9fafb"}
                          onChange={handleInputChange}
                          name="backgroundColor"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Imágenes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-2">
                      <Label>Logo del Restaurante</Label>
                      <BlobImageUploader
                        currentImageUrl={tenantData.logoUrl}
                        onImageUploaded={handleLogoUpload}
                        folder="logos"
                        aspectRatio="square"
                        tenantId={tenantId || undefined}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Recomendado: Imagen cuadrada de al menos 200x200px
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Label>Banner del Restaurante</Label>
                      <BlobImageUploader
                        currentImageUrl={tenantData.bannerUrl}
                        onImageUploaded={handleBannerUpload}
                        folder="banners"
                        aspectRatio="wide"
                        tenantId={tenantId || undefined}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Recomendado: Imagen panorámica de al menos 1200x400px
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="display" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Opciones de Visualización</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-2">
                      <Label htmlFor="bannerOpacity">Opacidad del Banner</Label>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                          <span className="text-sm">Transparente</span>
                          <Input
                            id="bannerOpacity"
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={tenantData.bannerOpacity}
                            onChange={handleOpacityChange}
                            className="flex-1"
                          />
                          <span className="text-sm">Opaco</span>
                        </div>
                        <div className="text-sm text-center">
                          {tenantData.bannerOpacity === 0
                            ? "Banner completamente transparente (sin difuminado)"
                            : `Opacidad: ${Math.round(tenantData.bannerOpacity * 100)}%`}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="info" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Contacto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input id="address" name="address" value={tenantData.address} onChange={handleInputChange} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" name="phone" value={tenantData.phone} onChange={handleInputChange} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" value={tenantData.email} onChange={handleInputChange} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="website">Sitio Web</Label>
                      <Input id="website" name="website" value={tenantData.website} onChange={handleInputChange} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Horarios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tenantData.openingHours.map((schedule: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={schedule.day}
                            onChange={(e) => handleScheduleChange(index, "day", e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            value={schedule.hours}
                            onChange={(e) => handleScheduleChange(index, "hours", e.target.value)}
                            className="flex-1"
                          />
                          <Button variant="outline" size="sm" onClick={() => removeSchedule(index)}>
                            Eliminar
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" onClick={addSchedule} className="w-full">
                        Añadir Horario
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Características</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tenantData.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={feature}
                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                            className="flex-1"
                          />
                          <Button variant="outline" size="sm" onClick={() => removeFeature(index)}>
                            Eliminar
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" onClick={addFeature} className="w-full">
                        Añadir Característica
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Redes Sociales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        name="socialMedia.facebook"
                        value={tenantData.socialMedia.facebook}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        name="socialMedia.instagram"
                        value={tenantData.socialMedia.instagram}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        name="socialMedia.twitter"
                        value={tenantData.socialMedia.twitter}
                        onChange={handleInputChange}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Vista previa - ahora ocupa 1/3 del espacio y es sticky */}
          <div className="hidden lg:block">
            <div className="sticky top-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Vista Previa</CardTitle>
                    <Tabs value={previewTab} onValueChange={setPreviewTab} className="w-auto">
                      <TabsList className="grid grid-cols-3 h-8">
                        <TabsTrigger value="main" className="text-xs px-2">
                          Principal
                        </TabsTrigger>
                        <TabsTrigger value="info" className="text-xs px-2">
                          Información
                        </TabsTrigger>
                        <TabsTrigger value="product" className="text-xs px-2">
                          Producto
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden">
                  <div className="border rounded-md overflow-hidden h-[600px] relative">
                    {/* Vista previa del sitio */}
                    <div
                      className="h-full overflow-y-auto"
                      style={{ backgroundColor: tenantData.backgroundColor || "#f9fafb" }}
                    >
                      {previewTab === "main" && (
                        <div className="min-h-screen">
                          {/* Banner y Logo */}
                          <div className="relative">
                            <div
                              className="h-32 relative"
                              style={{
                                background: `linear-gradient(to right, ${tenantData.primaryColor}, ${tenantData.secondaryColor})`,
                              }}
                            >
                              {/* Banner image */}
                              <div className="absolute inset-0" style={{ opacity: tenantData.bannerOpacity }}>
                                <Image
                                  src={tenantData.bannerUrl || "/placeholder.svg?key=i6gc5"}
                                  alt="Banner de comida"
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              {/* Botón de Abierto/Cerrado (izquierda) */}
                              <div className="absolute top-4 left-4 z-10">
                                <Button
                                  variant="outline"
                                  className={`${
                                    tenantData.isOpen
                                      ? "bg-white/70 hover:bg-white/90 text-green-600"
                                      : "bg-white/70 hover:bg-white/90 text-red-600"
                                  } font-medium border-0`}
                                  size="sm"
                                >
                                  {tenantData.isOpen ? "Abierto" : "Cerrado"}
                                </Button>
                              </div>

                              {/* Botones de acción (derecha) */}
                              <div className="absolute top-4 right-4 z-10 flex gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full bg-white/50 hover:bg-white/80 border-0"
                                >
                                  <Heart size={16} />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full bg-white/50 hover:bg-white/80 border-0"
                                >
                                  <Search size={16} />
                                </Button>
                              </div>
                            </div>

                            {/* Logo flotante */}
                            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
                              <div className="relative w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                                <Image
                                  src={
                                    tenantData.logoUrl || "/placeholder.svg?height=200&width=200&query=restaurante+logo"
                                  }
                                  alt={tenantData.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Título del restaurante */}
                          <div className="mt-20 text-center px-4">
                            <h1 className="text-2xl font-bold">{tenantData.name}</h1>
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-1">
                              <span className="flex items-center">
                                <Star size={16} className="fill-yellow-400 text-yellow-400 mr-1" />
                                {tenantData.rating}
                              </span>
                              <span>•</span>
                              <span>{tenantData.distance}</span>
                              <span>•</span>
                              <span>{tenantData.deliveryTime}</span>
                            </div>
                          </div>

                          {/* Barra de búsqueda */}
                          <div className="px-4 mt-6">
                            <div className="relative">
                              <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                size={18}
                              />
                              <Input
                                type="text"
                                placeholder="Buscar platos, categorías..."
                                className="pl-10 bg-white rounded-full border-gray-200"
                              />
                            </div>
                          </div>

                          {/* Artículos destacados - Slider */}
                          <div className="mt-6">
                            <div className="px-4 flex justify-between items-center mb-4">
                              <h2 className="text-xl font-bold">Destacados</h2>
                              <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                                  <ChevronLeft size={18} />
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                                  <ChevronRight size={18} />
                                </Button>
                              </div>
                            </div>

                            <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 px-4 pb-4">
                              {exampleProducts.map((product) => (
                                <div key={product.id} className="flex-shrink-0 w-[220px] snap-start">
                                  <Card className="overflow-hidden h-full">
                                    <div className="relative h-32">
                                      <Image
                                        src={
                                          product.imageUrl || "/placeholder.svg?height=200&width=300&query=plato+comida"
                                        }
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                                      >
                                        <Heart size={16} />
                                      </Button>
                                    </div>
                                    <CardContent className="p-3">
                                      <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-sm">{product.name}</h3>
                                        <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                          <span>4.8</span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {product.description}
                                      </p>
                                      <div className="flex justify-between items-center mt-2">
                                        <span className="font-bold text-sm">${product.price.toFixed(2)}</span>
                                        <Button
                                          size="sm"
                                          className="h-7 text-xs rounded-full"
                                          style={{
                                            backgroundColor: tenantData.productButtonColor,
                                            color: tenantData.buttonTextColor,
                                          }}
                                        >
                                          Añadir
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Categorías pequeñas - Slider */}
                          <div className="mt-6">
                            <div className="px-4 flex justify-between items-center mb-4">
                              <h2 className="text-xl font-bold">Categorías</h2>
                              <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                                  <ChevronLeft size={18} />
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                                  <ChevronRight size={18} />
                                </Button>
                              </div>
                            </div>

                            <div className="flex overflow-x-auto scrollbar-hide gap-4 px-4 pb-4">
                              {exampleCategories.slice(0, 6).map((category) => (
                                <div key={category.id} className="flex-shrink-0">
                                  <div className="flex flex-col items-center gap-2 w-14">
                                    <div className="relative w-14 h-14 rounded-full bg-white shadow-sm overflow-hidden">
                                      <Image
                                        src={category.imageUrl || "/placeholder.svg"}
                                        alt={category.name}
                                        fill
                                        className="object-cover p-2"
                                      />
                                    </div>
                                    <span className="text-xs text-center font-medium">{category.name}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Menú inferior fijo */}
                          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
                            <div className="flex justify-around items-center h-16 px-4">
                              <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
                                <Home size={20} />
                                <span className="text-xs">Inicio</span>
                              </Button>

                              <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
                                <Search size={20} />
                                <span className="text-xs">Buscar</span>
                              </Button>

                              <Button
                                className="flex items-center justify-center rounded-full h-14 w-14 shadow-lg -mt-5"
                                style={{
                                  backgroundColor: tenantData.buttonColor,
                                  color: tenantData.buttonTextColor || "#ffffff",
                                }}
                              >
                                <Plus size={24} />
                              </Button>

                              <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
                                <ShoppingBag size={20} />
                                <span className="text-xs">Pedidos</span>
                              </Button>

                              <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
                                <User size={20} />
                                <span className="text-xs">Perfil</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {previewTab === "info" && (
                        <div className="p-4 space-y-4">
                          <h2 className="text-xl font-bold">Información del Restaurante</h2>

                          {/* Banner del restaurante */}
                          <div className="relative h-40 rounded-lg overflow-hidden">
                            <Image
                              src={tenantData.bannerUrl || "/modern-restaurant-interior.png"}
                              alt={tenantData.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Información del restaurante */}
                          <div className="mt-4">
                            <h3 className="text-lg font-bold">{tenantData.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{tenantData.description}</p>

                            <div className="mt-4 space-y-3">
                              <div className="flex items-start gap-2">
                                <MapPin size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{tenantData.address}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Phone size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{tenantData.phone}</span>
                              </div>
                            </div>

                            <Separator className="my-4" />

                            {/* Horarios */}
                            <div>
                              <h4 className="font-medium flex items-center gap-2 mb-2">
                                <Clock size={18} />
                                Horarios
                              </h4>
                              <div className="space-y-2">
                                {tenantData.openingHours.map((schedule: any, index: number) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span>{schedule.day}</span>
                                    <span>{schedule.hours}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <Separator className="my-4" />

                            {/* Características */}
                            <div>
                              <h4 className="font-medium mb-2">Características</h4>
                              <div className="flex flex-wrap gap-2">
                                {tenantData.features.map((feature: string, index: number) => (
                                  <Badge key={index} variant="outline" className="bg-gray-100">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {previewTab === "product" && (
                        <div className="p-4 space-y-4">
                          <h2 className="text-xl font-bold">Detalle de Producto</h2>

                          <Card className="overflow-hidden">
                            <div className="relative h-48">
                              <Image src="/pizza-margherita.png" alt="Pizza Margherita" fill className="object-cover" />
                            </div>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg">Pizza Margherita</h3>
                                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
                                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                  <span>4.8</span>
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground mt-2">
                                Tomate, mozzarella, albahaca fresca y aceite de oliva. Una pizza clásica italiana con
                                ingredientes frescos y de alta calidad.
                              </p>

                              <div className="mt-4 flex justify-between items-center">
                                <span className="font-bold text-xl">$12.99</span>
                                <Button
                                  className="rounded-full"
                                  style={{
                                    backgroundColor: tenantData.productButtonColor,
                                    color: tenantData.buttonTextColor,
                                  }}
                                >
                                  Añadir al carrito
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
