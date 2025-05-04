"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTenantInfo } from "@/lib/tenant-utils"
import { useToast } from "@/components/ui/use-toast"
import { ArrowRight, Clock, Search, Star, UtensilsCrossed } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function TenantLandingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tenantInfo, setTenantInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)

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
      image: "/placeholder.svg?key=sl0yt",
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
      image: "/placeholder.svg?key=agsxn",
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
  ]

  const categories = [
    { id: 1, name: "Hamburguesas", image: "/placeholder.svg?key=ncq59" },
    { id: 2, name: "Pizzas", image: "/placeholder.svg?key=ixs22" },
    { id: 3, name: "Ensaladas", image: "/placeholder.svg?key=zbb51" },
    { id: 4, name: "Pastas", image: "/placeholder.svg?key=da4cm" },
    { id: 5, name: "Postres", image: "/placeholder.svg?key=vo9og" },
    { id: 6, name: "Bebidas", image: "/placeholder.svg?key=cyyji" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">{tenantInfo.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>
            <Link href="/menu">
              <Button size="sm">Ver Menú</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative h-[300px] md:h-[400px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/placeholder.svg?key=9lj3b')`,
        }}
      >
        <div className="container mx-auto px-4 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{tenantInfo.name}</h1>
          <p className="text-xl mb-6 max-w-lg">
            Disfruta de la mejor comida directamente en tu casa. Haz tu pedido ahora.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/menu">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                Ver Menú Completo
              </Button>
            </Link>
            <Link href="/reservations">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                Hacer Reserva
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Search and Categories */}
      <section className="container mx-auto px-4 py-8">
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input type="text" placeholder="Buscar platos, categorías..." className="pl-10 bg-white" />
        </div>

        <h2 className="text-xl font-bold mb-4">Categorías</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link href={`/menu?category=${category.id}`} key={category.id}>
              <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="relative h-16 w-16 mx-auto mb-2">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-sm font-medium">{category.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Items */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Platos Destacados</h2>
          <Link href="/menu" className="text-primary flex items-center gap-1 text-sm font-medium">
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48">
                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold mb-1">{item.name}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold">${item.price.toFixed(2)}</span>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{item.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <Clock size={14} />
                  <span>{item.time}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Menu Tabs */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-4">Nuestro Menú</h2>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 bg-white p-1 rounded-lg">
            <TabsTrigger value="all">Todo</TabsTrigger>
            <TabsTrigger value="popular">Más Popular</TabsTrigger>
            <TabsTrigger value="offers">Ofertas</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-24 w-24 md:h-32 md:w-32 flex-shrink-0">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold">${item.price.toFixed(2)}</span>
                      <Button size="sm">Añadir</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/menu">
                <Button variant="outline" className="mt-4">
                  Ver Menú Completo
                </Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="popular">
            <div className="text-center py-12">
              <UtensilsCrossed className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Próximamente</h3>
              <p className="text-muted-foreground">Estamos preparando nuestros platos más populares.</p>
            </div>
          </TabsContent>

          <TabsContent value="offers">
            <div className="text-center py-12">
              <UtensilsCrossed className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Próximamente</h3>
              <p className="text-muted-foreground">Estamos preparando nuestras mejores ofertas.</p>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Listo para ordenar?</h2>
          <p className="text-lg mb-6 max-w-lg mx-auto">
            Haz tu pedido ahora y disfruta de la mejor comida en la comodidad de tu hogar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Ver Menú Completo
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                Contactar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white text-lg font-bold mb-4">{tenantInfo.name}</h3>
              <p className="mb-4">La mejor experiencia gastronómica directamente en tu hogar.</p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white">
                  Facebook
                </a>
                <a href="#" className="hover:text-white">
                  Instagram
                </a>
                <a href="#" className="hover:text-white">
                  Twitter
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-white text-lg font-bold mb-4">Horario</h3>
              <p className="mb-2">Lunes - Viernes: 11:00 - 22:00</p>
              <p className="mb-2">Sábado - Domingo: 11:00 - 23:00</p>
              <p>Festivos: 12:00 - 22:00</p>
            </div>
            <div>
              <h3 className="text-white text-lg font-bold mb-4">Contacto</h3>
              <p className="mb-2">Calle Principal 123</p>
              <p className="mb-2">Ciudad, CP 12345</p>
              <p className="mb-2">Teléfono: (123) 456-7890</p>
              <p>Email: info@{tenantId}.gastroo.online</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-sm text-center">
            <p>
              &copy; {new Date().getFullYear()} {tenantInfo.name}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
