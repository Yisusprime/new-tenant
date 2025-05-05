"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getTenantInfo } from "@/lib/tenant-utils"
import { useToast } from "@/components/ui/use-toast"
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Search,
  ShoppingBag,
  Star,
  User,
  Heart,
  Plus,
  Clock,
  MapPin,
  Phone,
  Globe,
  Mail,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { CategoryProvider, useCategories } from "@/components/categories/category-context"
import { ProductProvider, useProducts, type Product, type Extra } from "@/components/products/product-context"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { doc, onSnapshot } from "firebase/firestore"
import { db, rtdb } from "@/lib/firebase-config"
import { ProductDetailModal } from "@/components/products/product-detail-modal"
import { ref, get } from "firebase/database"
import { useCart } from "@/components/cart/cart-context"
import { v4 as uuidv4 } from "uuid"

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
  const { toast } = useToast()
  const { addItem, itemCount } = useCart()

  const featuredSliderRef = useRef<HTMLDivElement>(null)
  const categoriesSliderRef = useRef<HTMLDivElement>(null)

  // Obtener colores personalizados o usar valores predeterminados
  const primaryColor = tenantInfo.primaryColor || "#f97316"
  const secondaryColor = tenantInfo.secondaryColor || "#dc2626"
  const buttonColor = tenantInfo.buttonColor || "#f97316"
  const productButtonColor = tenantInfo.productButtonColor || "#f97316"
  const buttonTextColor = tenantInfo.buttonTextColor || "#ffffff"
  const backgroundColor = tenantInfo.backgroundColor || "#f9fafb"
  const bannerOpacity = tenantInfo.bannerOpacity !== undefined ? tenantInfo.bannerOpacity : 0.2
  const isOpen = tenantInfo.isOpen !== undefined ? tenantInfo.isOpen : true

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

  const scrollFeatured = (direction: "left" | "right") => {
    if (featuredSliderRef.current) {
      const { scrollLeft, clientWidth } = featuredSliderRef.current
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8

      featuredSliderRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      })
    }
  }

  const scrollCategories = (direction: "left" | "right") => {
    if (categoriesSliderRef.current) {
      const { scrollLeft, clientWidth } = categoriesSliderRef.current
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8

      categoriesSliderRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      })
    }
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

  // Función para añadir un producto al carrito
  const handleAddToCart = (product: Product) => {
    addItem({
      id: uuidv4(),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.imageUrl,
      extras: [],
      source: "menu", // Add this line to identify orders from the menu
    })
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: backgroundColor }}>
      {/* Contenedor principal con ancho máximo para pantallas grandes */}
      <div className="mx-auto max-w-6xl">
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
                      isOpen
                        ? "bg-white/70 hover:bg-white/90 text-green-600"
                        : "bg-white/70 hover:bg-white/90 text-red-600"
                    } font-medium border-0`}
                    size="sm"
                  >
                    {isOpen ? "Abierto" : "Cerrado"}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto hide-scrollbar">
                  <SheetHeader className="text-left">
                    <SheetTitle className="text-xl">Información del Restaurante</SheetTitle>
                  </SheetHeader>

                  {/* Banner del restaurante */}
                  <div className="mt-4 relative h-40 rounded-lg overflow-hidden">
                    <Image
                      src={tenantInfo.bannerUrl || "/modern-restaurant-interior.png"}
                      alt={restaurantInfo.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Información del restaurante */}
                  <div className="mt-4">
                    <h3 className="text-lg font-bold">{restaurantInfo.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{restaurantInfo.description}</p>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{restaurantInfo.address}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{restaurantInfo.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{restaurantInfo.email}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Globe size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{restaurantInfo.website}</span>
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
                        {restaurantInfo.openingHours.map((schedule, index) => (
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
                        {restaurantInfo.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-100">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Redes sociales */}
                    <div>
                      <h4 className="font-medium mb-2">Redes Sociales</h4>
                      <div className="space-y-2 text-sm">
                        <div>Facebook: {restaurantInfo.socialMedia.facebook}</div>
                        <div>Instagram: {restaurantInfo.socialMedia.instagram}</div>
                        <div>Twitter: {restaurantInfo.socialMedia.twitter}</div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
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
        {featuredProducts.length > 0 && (
          <div className="mt-6">
            <div className="px-4 flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Destacados</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => scrollFeatured("left")}
                >
                  <ChevronLeft size={18} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => scrollFeatured("right")}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>

            <div
              className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 px-4 pb-4"
              ref={featuredSliderRef}
            >
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[220px] sm:w-[250px] md:w-[280px] snap-start cursor-pointer"
                  onClick={() => openProductDetail(product)}
                >
                  <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                    <div className="relative h-32 sm:h-36 md:h-40">
                      <Image
                        src={product.imageUrl || "/placeholder.svg?height=200&width=300&query=plato+comida"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          toast({
                            title: "Añadido a favoritos",
                            description: `${product.name} ha sido añadido a tus favoritos`,
                          })
                        }}
                      >
                        <Heart size={16} />
                      </Button>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm sm:text-base">{product.name}</h3>
                        <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          <span>4.8</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-sm sm:text-base">${product.price.toFixed(2)}</span>
                        <Button
                          size="sm"
                          className="h-7 sm:h-8 text-xs sm:text-sm rounded-full"
                          style={{
                            backgroundColor: productButtonColor,
                            color: buttonTextColor,
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCart(product)
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
        )}

        {/* Categorías pequeñas - Slider */}
        {categories.length > 0 && (
          <div className="mt-6">
            <div className="px-4 flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Categorías</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => scrollCategories("left")}
                >
                  <ChevronLeft size={18} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => scrollCategories("right")}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>

            <div className="flex overflow-x-auto scrollbar-hide gap-4 px-4 pb-4" ref={categoriesSliderRef}>
              {categories.slice(0, 8).map((category) => (
                <Link href={`/admin/menu?category=${category.id}`} key={category.id} className="flex-shrink-0">
                  <div className="flex flex-col items-center gap-2 w-14 sm:w-16">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-sm overflow-hidden">
                      <Image
                        src={category.imageUrl || "/placeholder.svg?height=80&width=80&query=categoria+comida"}
                        alt={category.name}
                        fill
                        className="object-cover p-2"
                      />
                    </div>
                    <span className="text-xs text-center font-medium">{category.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Productos populares */}
        {popularProducts.length > 0 && (
          <div className="mt-6 px-4">
            <h2 className="text-xl font-bold mb-4">Más populares</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {popularProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openProductDetail(product)}
                >
                  <div className="flex h-full md:flex-col">
                    <div className="relative h-auto w-1/3 md:w-full md:h-40 flex-shrink-0">
                      <Image
                        src={product.imageUrl || "/placeholder.svg?height=200&width=300&query=plato+comida"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-3 flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-sm sm:text-base">{product.name}</h3>
                          <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                            <span>4.7</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-sm sm:text-base">${product.price.toFixed(2)}</span>
                        <Button
                          size="sm"
                          className="h-7 sm:h-8 text-xs sm:text-sm rounded-full"
                          style={{
                            backgroundColor: productButtonColor,
                            color: buttonTextColor,
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCart(product)
                          }}
                        >
                          Añadir
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
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

          <Sheet>
            <SheetTrigger asChild>
              <Button
                className="flex items-center justify-center rounded-full h-14 w-14 shadow-lg -mt-5"
                style={{
                  backgroundColor: buttonColor,
                  color: buttonTextColor,
                }}
              >
                <Plus size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
              <div className="pt-6">
                <h2 className="text-xl font-bold mb-6 text-center">Todas las categorías</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6">
                  {categories.map((category) => (
                    <Link
                      href={`/admin/menu?category=${category.id}`}
                      key={category.id}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-sm overflow-hidden">
                        <Image
                          src={category.imageUrl || "/placeholder.svg?height=80&width=80&query=categoria+comida"}
                          alt={category.name}
                          fill
                          className="object-cover p-2"
                        />
                      </div>
                      <span className="text-xs text-center font-medium">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/cart">
            <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 relative">
              <ShoppingBag size={20} />
              <span className="text-xs">Carrito</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>

          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
            <User size={20} />
            <span className="text-xs">Perfil</span>
          </Button>
        </div>
      </div>

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
