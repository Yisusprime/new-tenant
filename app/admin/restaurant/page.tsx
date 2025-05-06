"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Save } from "lucide-react"

// Importar componentes modulares de restaurant
import { GeneralInfo } from "@/components/restaurant/general-info"
import { Branding } from "@/components/restaurant/branding"
import { MediaUploads } from "@/components/restaurant/media-uploads"
import { DisplayOptions } from "@/components/restaurant/display-options"
import { ContactDetails } from "@/components/restaurant/contact-details"
import { ServiceOptions } from "@/components/restaurant/service-options"
import { MobilePreview } from "@/components/restaurant/mobile-preview"

export default function RestaurantManager() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewTab, setPreviewTab] = useState("home") // Para cambiar entre vistas previas
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
    // Nuevas opciones para métodos de pago
    paymentMethods: {
      acceptsCash: true,
      acceptsCard: true,
      acceptsTransfer: false,
      acceptsOnlinePayment: false,
      onlinePaymentInstructions: "",
    },
    // Nuevas opciones para servicios
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

  // Manejar cambios en los switches anidados
  const handleNestedSwitchChange = (parent: string, name: string, checked: boolean) => {
    setTenantData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [name]: checked,
      },
    }))
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
            <h1 className="text-2xl md:text-3xl font-bold">Configuración del Restaurante</h1>
            <p className="text-muted-foreground">Personaliza la información y apariencia de tu restaurante</p>
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
                <TabsTrigger value="branding">Marca</TabsTrigger>
                <TabsTrigger value="media">Imágenes</TabsTrigger>
                <TabsTrigger value="contact">Contacto</TabsTrigger>
                <TabsTrigger value="display">Visualización</TabsTrigger>
                <TabsTrigger value="services">Servicios</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <GeneralInfo
                  tenantData={tenantData}
                  handleInputChange={handleInputChange}
                  handleSwitchChange={handleSwitchChange}
                />
              </TabsContent>

              <TabsContent value="branding" className="space-y-4">
                <Branding tenantData={tenantData} handleInputChange={handleInputChange} />
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <MediaUploads
                  tenantData={tenantData}
                  tenantId={tenantId}
                  handleLogoUpload={handleLogoUpload}
                  handleBannerUpload={handleBannerUpload}
                />
              </TabsContent>

              <TabsContent value="display" className="space-y-4">
                <DisplayOptions tenantData={tenantData} handleOpacityChange={handleOpacityChange} />
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <ContactDetails
                  tenantData={tenantData}
                  handleInputChange={handleInputChange}
                  handleScheduleChange={handleScheduleChange}
                  handleFeatureChange={handleFeatureChange}
                  addSchedule={addSchedule}
                  removeSchedule={removeSchedule}
                  addFeature={addFeature}
                  removeFeature={removeFeature}
                />
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <ServiceOptions
                  tenantData={tenantData}
                  handleSwitchChange={handleSwitchChange}
                  handleNestedSwitchChange={handleNestedSwitchChange}
                  handleInputChange={handleInputChange}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Vista previa móvil - ahora ocupa 1/3 del espacio y es sticky */}
          <div className="hidden lg:block">
            <MobilePreview tenantData={tenantData} activeTab={previewTab} setActiveTab={setPreviewTab} />
          </div>
        </div>
      </div>
    </div>
  )
}
