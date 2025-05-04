"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getTenantInfo } from "@/lib/tenant-utils"
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft, ChevronRight, Home, Search, ShoppingBag, Star, User, Heart, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function TenantLandingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tenantInfo, setTenantInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [showAllCategories, setShowAllCategories] = useState(false)

  const featuredSliderRef = useRef<HTMLDivElement>(null)
  const categoriesSliderRef = useRef<HTMLDivElement>(null)

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
        setLoading(false)
      }
    }

    if (tenantId) {
      fetchTenantInfo()
    }
  }, [tenantId])

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

  // Datos de ejemplo para el menú
  const featuredItems = [
    {
      id: 1,
      name: "Hamburguesa Especial",
      description: "Carne de res, queso cheddar, bacon, lechuga y tomate",
      price: 12.99,
      image: "/placeholder.svg?key=t4zdp",
      rating: 4.8,
      time: "15-25 min",
    },
    {
      id: 2,
      name: "Pizza Margherita",
      description: "Salsa de tomate, mozzarella fresca y albahaca",
      price: 14.5,
      image: "/pizza-margherita.png",
      rating: 4.7,
      time: "20-30 min",
    },
    {
      id: 3,
      name: "Ensalada César",
      description: "Lechuga romana, crutones, parmesano y aderezo césar",
      price: 9.99,
      image: "/placeholder.svg?key=bd3fe",
      rating: 4.5,
      time: "10-15 min",
    },
    {
      id: 4,
      name: "Pasta Carbonara",
      description: "Espaguetis con salsa carbonara, panceta y queso parmesano",
      price: 13.5,
      image: "/pasta-carbonara.png",
      rating: 4.9,
      time: "15-25 min",
    },
    {
      id: 5,
      name: "Sushi Mix",
      description: "Selección de 12 piezas de sushi variado",
      price: 18.99,
      image: "/placeholder.svg?key=02qen",
      rating: 4.8,
      time: "25-35 min",
    },
    {
      id: 6,
      name: "Tacos al Pastor",
      description: "3 tacos de cerdo marinado con piña y cilantro",
      price: 10.5,
      image: "/tacos-al-pastor.png",
      rating: 4.7,
      time: "15-20 min",
    },
  ]

  const popularItems = [
    {
      id: 7,
      name: "Burrito de Pollo",
      description: "Burrito grande con pollo, arroz, frijoles y guacamole",
      price: 11.99,
      image: "/placeholder.svg?key=4a7of",
      rating: 4.6,
    },
    {
      id: 8,
      name: "Ramen Tonkotsu",
      description: "Ramen con caldo de cerdo, huevo y chashu",
      price: 15.99,
      image: "/placeholder.svg?key=c82ht",
      rating: 4.9,
    },
    {
      id: 9,
      name: "Lasaña Casera",
      description: "Lasaña de carne con bechamel y queso gratinado",
      price: 13.5,
      image: "/placeholder.svg?height=200&width=300&query=lasana+casera",
      rating: 4.7,
    },
    {
      id: 10,
      name: "Poke Bowl",
      description: "Bowl de arroz, salmón, aguacate y vegetales",
      price: 14.99,
      image: "/placeholder.svg?height=200&width=300&query=poke+bowl",
      rating: 4.8,
    },
  ]

  const categories = [
    { id: 1, name: "Hamburguesas", image: "/placeholder.svg?height=80&width=80&query=hamburguesa+icono" },
    { id: 2, name: "Pizzas", image: "/placeholder.svg?height=80&width=80&query=pizza+icono" },
    { id: 3, name: "Ensaladas", image: "/placeholder.svg?height=80&width=80&query=ensalada+icono" },
    { id: 4, name: "Pastas", image: "/placeholder.svg?height=80&width=80&query=pasta+icono" },
    { id: 5, name: "Postres", image: "/placeholder.svg?height=80&width=80&query=postre+icono" },
    { id: 6, name: "Bebidas", image: "/placeholder.svg?height=80&width=80&query=bebida+icono" },
    { id: 7, name: "Sushi", image: "/placeholder.svg?height=80&width=80&query=sushi+icono" },
    { id: 8, name: "Tacos", image: "/placeholder.svg?height=80&width=80&query=taco+icono" },
    { id: 9, name: "Desayunos", image: "/placeholder.svg?height=80&width=80&query=desayuno+icono" },
    { id: 10, name: "Vegetariano", image: "/placeholder.svg?height=80&width=80&query=vegetariano+icono" },
  ]

  const allCategories = [
    ...categories,
    { id: 11, name: "Vegano", image: "/placeholder.svg?height=80&width=80&query=vegano+icono" },
    { id: 12, name: "Sin Gluten", image: "/placeholder.svg?height=80&width=80&query=sin+gluten+icono" },
    { id: 13, name: "Mariscos", image: "/placeholder.svg?height=80&width=80&query=mariscos+icono" },
    { id: 14, name: "Sopas", image: "/placeholder.svg?height=80&width=80&query=sopa+icono" },
    { id: 15, name: "Carnes", image: "/placeholder.svg?height=80&width=80&query=carne+icono" },
    { id: 16, name: "Asiático", image: "/placeholder.svg?height=80&width=80&query=asiatico+icono" },
    { id: 17, name: "Mexicano", image: "/placeholder.svg?height=80&width=80&query=mexicano+icono" },
    { id: 18, name: "Italiano", image: "/placeholder.svg?height=80&width=80&query=italiano+icono" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Banner y Logo */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-orange-500 to-red-600 relative">
          {/* Banner image */}
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/placeholder.svg?height=200&width=1200&query=comida+gourmet+banner"
              alt="Banner de comida"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Logo flotante */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
          <div className="relative w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
            <Image
              src="/placeholder.svg?height=200&width=200&query=restaurante+logo"
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
            4.8
          </span>
          <span>•</span>
          <span>0.8 km</span>
          <span>•</span>
          <span>20-35 min</span>
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
          />
        </div>
      </div>

      {/* Artículos destacados - Slider */}
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
          {featuredItems.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-[280px] snap-start">
              <Card className="overflow-hidden h-full">
                <div className="relative h-40">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
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
                    <h3 className="font-bold text-base">{item.name}</h3>
                    <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold">${item.price.toFixed(2)}</span>
                    <Button size="sm" className="h-8 rounded-full">
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
              <div className="flex flex-col items-center gap-2 w-16">
                <div className="relative w-16 h-16 rounded-full bg-white shadow-sm overflow-hidden">
                  <Image
                    src={category.image || "/placeholder.svg"}
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

      {/* Productos populares */}
      <div className="mt-6 px-4">
        <h2 className="text-xl font-bold mb-4">Más populares</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popularItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="flex h-full">
                <div className="relative h-auto w-1/3 flex-shrink-0">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                </div>
                <CardContent className="p-3 flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold">{item.name}</h3>
                      <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span>{item.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold">${item.price.toFixed(2)}</span>
                    <Button size="sm" className="h-8 rounded-full">
                      Añadir
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
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

          <Sheet>
            <SheetTrigger asChild>
              <Button className="flex items-center justify-center rounded-full h-14 w-14 bg-primary text-white shadow-lg -mt-5">
                <Plus size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
              <div className="pt-6">
                <h2 className="text-xl font-bold mb-6 text-center">Todas las categorías</h2>
                <div className="grid grid-cols-4 gap-6">
                  {allCategories.map((category) => (
                    <Link
                      href={`/admin/menu?category=${category.id}`}
                      key={category.id}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="relative w-16 h-16 rounded-full bg-white shadow-sm overflow-hidden">
                        <Image
                          src={category.image || "/placeholder.svg"}
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

      {/* Estilos adicionales para ocultar la barra de desplazamiento pero mantener la funcionalidad */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
