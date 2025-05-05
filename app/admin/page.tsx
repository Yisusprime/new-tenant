"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getTenantInfo } from "@/lib/tenant-utils"
import { useToast } from "@/components/ui/use-toast"
import { Heart, Search, Star, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { CategoryProvider, useCategories } from "@/components/categories/category-context"
import { ProductProvider, useProducts, type Product, type Extra } from "@/components/products/product-context"
import { doc, onSnapshot } from "firebase/firestore"
import { db, rtdb } from "@/lib/firebase-config"
import { ProductDetailModal } from "@/components/products/product-detail-modal"
import { ref, get, onValue, off } from "firebase/database"
import { useCart } from "@/components/cart/cart-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FeaturedProducts } from "@/components/landing/featured-products"
import { CategoriesSlider } from "@/components/landing/categories-slider"
import { PopularProducts } from "@/components/landing/popular-products"
import { RestaurantInfoSheet } from "@/components/landing/restaurant-info-sheet"
import { BottomNavigation } from "@/components/landing/bottom-navigation"

// Main component wrapper with providers
export default function TenantLandingPageWrapper() {
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [tenantInfo, setTenantInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  // Get tenantId from hostname
  useEffect(() => {
    const hostname = window.location.hostname
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

    if (hostname.includes(`.${rootDomain}`) && !hostname.startsWith("www.")) {
      const subdomain = hostname.replace(`.${rootDomain}`, "")
      setTenantId(subdomain)
    }
  }, [])

  // Fetch tenant info and set up real-time listener
  useEffect(() => {
    if (!tenantId) return

    // Primero cargamos los datos iniciales
    const loadInitialData = async () => {
      try {
        const info = await getTenantInfo(tenantId)
        setTenantInfo(info)
      } catch (error) {
        console.error("Error al obtener información inicial del tenant:", error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()

    // Luego configuramos un listener en tiempo real para detectar cambios
    const tenantRef = doc(db, "tenants", tenantId)
    const unsubscribe = onSnapshot(
      tenantRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          console.log("Datos del tenant actualizados:", data)
          setTenantInfo(data)
        }
      },
      (error) => {
        console.error("Error en el listener del tenant:", error)
      },
    )

    // Limpiamos el listener cuando el componente se desmonta
    return () => unsubscribe()
  }, [tenantId])

  if (loading || !tenantId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!tenantInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Restaurante no encontrado</h1>
          <p className="text-muted-foreground mb-4">El restaurante "{tenantId}" no existe o no está disponible</p>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <CategoryProvider tenantId={tenantId}>
      <ProductProvider tenantId={tenantId}>
        <TenantLandingPage tenantId={tenantId} tenantInfo={tenantInfo} />
      </ProductProvider>
    </CategoryProvider>
  )
}

// Main component with data from context
function TenantLandingPage({
  tenantId,
  tenantInfo,
}: {
  tenantId: string
  tenantInfo: any
}) {
  const { categories, loading: categoriesLoading } = useCategories()
  const { products, loading: productsLoading } = useProducts()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [extras, setExtras] = useState<Extra[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isShiftActive, setIsShiftActive] = useState(false)
  const { toast } = useToast()
  const { addItem, itemCount } = useCart()

  // Obtener colores personalizados o usar valores predeterminados
  const primaryColor = tenantInfo.primaryColor || "#f97316"
  const secondaryColor = tenantInfo.secondaryColor || "#dc2626"
  const buttonColor = tenantInfo.buttonColor || "#f97316"
  const productButtonColor = tenantInfo.productButtonColor || "#f97316"
  const buttonTextColor = tenantInfo.buttonTextColor || "#ffffff"
  const backgroundColor = tenantInfo.backgroundColor || "#f9fafb"
  const bannerOpacity = tenantInfo.bannerOpacity !== undefined ? tenantInfo.bannerOpacity : 0.2

  // Verificar si hay un turno activo en tiempo real
  useEffect(() => {
    if (!tenantId) return

    const shiftsRef = ref(rtdb, `tenants/${tenantId}/shifts`)

    const handleShiftsChange = (snapshot: any) => {
      if (snapshot.exists()) {
        const shifts = snapshot.val()
        // Verificar si hay algún turno activo
        const hasActiveShift = Object.values(shifts).some((shift: any) => shift.status === "active")
        console.log("Estado del turno:", hasActiveShift ? "Activo" : "Inactivo")
        setIsShiftActive(hasActiveShift)
      } else {
        console.log("No hay turnos registrados")
        setIsShiftActive(false)
      }
    }

    onValue(shiftsRef, handleShiftsChange)

    return () => {
      off(shiftsRef)
    }
  }, [tenantId])

  // Cargar extras
  useEffect(() => {
    if (!tenantId) return

    const fetchExtras = async () => {
      try {
        const extrasRef = ref(rtdb, `tenants/${tenantId}/extras`)
        const snapshot = await get(extrasRef)

        if (snapshot.exists()) {
          const extrasData = snapshot.val()
          const extrasArray: Extra[] = []

          Object.keys(extrasData).forEach((key) => {
            extrasArray.push({
              id: key,
              name: extrasData[key].name,
              description: extrasData[key].description || "",
              price: extrasData[key].price || 0,
              imageUrl: extrasData[key].imageUrl || "",
              available: extrasData[key].available !== false,
            })
          })

          setExtras(extrasArray)
        }
      } catch (error) {
        console.error("Error al cargar extras:", error)
      }
    }

    fetchExtras()
  }, [tenantId])

  // Función para abrir el modal de detalles del producto
  const openProductDetail = (product: Product) => {
    if (!isShiftActive) {
      toast({
        title: "Restaurante cerrado",
        description: "Lo sentimos, el restaurante no está atendiendo en este momento.",
        variant: "destructive",
      })
      return
    }

    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  // Filter featured products
  const featuredProducts = products
    .filter((product) => product.featured && product.available)
    .sort((a, b) => a.name.localeCompare(b.name))

  // Filter popular products (non-featured but available)
  const popularProducts = products
    .filter((product) => !product.featured && product.available)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 4) // Limit to 4 items

  // Usar datos del tenant para la información del restaurante
  const restaurantInfo = {
    name: tenantInfo.name || "Restaurante Ejemplo",
    description:
      tenantInfo.description ||
      "Disfruta de la mejor experiencia gastronómica con nuestros platos preparados con ingredientes frescos y de alta calidad.",
    address: tenantInfo.address || "Calle Principal 123, Ciudad Ejemplo",
    phone: tenantInfo.phone || "+1 234 567 890",
    email: tenantInfo.email || "info@restauranteejemplo.com",
    website: tenantInfo.website || "www.restauranteejemplo.com",
    openingHours: tenantInfo.openingHours || [
      { day: "Lunes - Viernes", hours: "11:00 - 22:00" },
      { day: "Sábados", hours: "12:00 - 23:00" },
      { day: "Domingos", hours: "12:00 - 20:00" },
    ],
    features: tenantInfo.features || ["Terraza", "Wi-Fi gratis", "Accesible", "Estacionamiento"],
    socialMedia: tenantInfo.socialMedia || {
      facebook: "restauranteejemplo",
      instagram: "@restauranteejemplo",
      twitter: "@rest_ejemplo",
    },
  }

  if (categoriesLoading || productsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: backgroundColor }}>
      {/* Contenedor principal con ancho máximo para pantallas grandes */}
      <div className="mx-auto max-w-6xl">
        {/* Alerta de restaurante cerrado */}
        {!isShiftActive && (
          <Alert variant="destructive" className="mb-4 mx-4 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Restaurante cerrado</AlertTitle>
            <AlertDescription>
              Este restaurante no está atendiendo pedidos en este momento. Por favor, regresa más tarde.
            </AlertDescription>
          </Alert>
        )}

        {/* Banner y Logo */}
        <div className="relative">
          <div
            className="h-32 md:h-40 lg:h-48 relative rounded-b-lg overflow-hidden"
            style={{
              background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
            }}
          >
            {/* Banner image */}
            <div className="absolute inset-0" style={{ opacity: bannerOpacity }}>
              <Image
                src={tenantInfo.bannerUrl || "/placeholder.svg?key=i6gc5"}
                alt="Banner de comida"
                fill
                className="object-cover"
              />
            </div>

            {/* Botón de Abierto/Cerrado (izquierda) con Sheet */}
            <div className="absolute top-4 left-4 z-10">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className={`${
                      isShiftActive
                        ? "bg-white/70 hover:bg-white/90 text-green-600"
                        : "bg-white/70 hover:bg-white/90 text-red-600"
                    } font-medium border-0`}
                    size="sm"
                  >
                    {isShiftActive ? "Abierto" : "Cerrado"}
                  </Button>
                </SheetTrigger>
                <RestaurantInfoSheet
                  restaurantInfo={restaurantInfo}
                  bannerUrl={tenantInfo.bannerUrl || "/modern-restaurant-interior.png"}
                />
              </Sheet>
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
                src={tenantInfo.logoUrl || "/placeholder.svg?height=200&width=200&query=restaurante+logo"}
                alt={tenantInfo.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Título del restaurante */}
        <div className="mt-20 text-center px-4">
          <h1 className="text-2xl font-bold">{tenantInfo.name}</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-1">
            <span className="flex items-center">
              <Star size={16} className="fill-yellow-400 text-yellow-400 mr-1" />
              {tenantInfo.rating || "4.8"}
            </span>
            <span>•</span>
            <span>{tenantInfo.distance || "0.8 km"}</span>
            <span>•</span>
            <span>{tenantInfo.deliveryTime || "20-35 min"}</span>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="px-4 mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Buscar platos, categorías..."
              className="pl-10 bg-white rounded-full border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Artículos destacados - Slider */}
        <FeaturedProducts
          products={featuredProducts}
          productButtonColor={productButtonColor}
          buttonTextColor={buttonTextColor}
          openProductDetail={openProductDetail}
          isShiftActive={isShiftActive}
        />

        {/* Categorías pequeñas - Slider */}
        <CategoriesSlider categories={categories} />

        {/* Productos populares */}
        <PopularProducts
          products={popularProducts}
          productButtonColor={productButtonColor}
          buttonTextColor={buttonTextColor}
          openProductDetail={openProductDetail}
          isShiftActive={isShiftActive}
        />
      </div>

      {/* Modal de detalles del producto */}
      <ProductDetailModal
        product={selectedProduct}
        extras={extras}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        buttonColor={productButtonColor}
        buttonTextColor={buttonTextColor}
      />

      {/* Menú inferior fijo */}
      <BottomNavigation
        categories={categories}
        itemCount={itemCount}
        buttonColor={buttonColor}
        buttonTextColor={buttonTextColor}
      />

      {/* Estilos adicionales para ocultar la barra de desplazamiento pero mantener la funcionalidad */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
