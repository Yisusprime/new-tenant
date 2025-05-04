"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getTenantInfo } from "@/lib/tenant-utils"
import { ArrowLeft, Search, ShoppingBag, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MenuPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")

  const [tenantInfo, setTenantInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [cartCount, setCartCount] = useState(0)

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

  // Datos de ejemplo para el menú
  const categories = [
    { id: "1", name: "Hamburguesas" },
    { id: "2", name: "Pizzas" },
    { id: "3", name: "Ensaladas" },
    { id: "4", name: "Pastas" },
    { id: "5", name: "Postres" },
    { id: "6", name: "Bebidas" },
  ]

  const menuItems = [
    {
      id: 1,
      name: "Hamburguesa Clásica",
      description: "Carne de res, queso cheddar, lechuga, tomate y cebolla",
      price: 10.99,
      image: "/placeholder.svg?key=kkua0",
      rating: 4.5,
      category: "1",
    },
    {
      id: 2,
      name: "Hamburguesa BBQ",
      description: "Carne de res, queso, bacon, cebolla caramelizada y salsa BBQ",
      price: 12.99,
      image: "/placeholder.svg?height=200&width=300&query=hamburguesa+bbq",
      rating: 4.8,
      category: "1",
    },
    {
      id: 3,
      name: "Pizza Margherita",
      description: "Salsa de tomate, mozzarella fresca y albahaca",
      price: 14.5,
      image: "/pizza-margherita.png",
      rating: 4.7,
      category: "2",
    },
    {
      id: 4,
      name: "Pizza Pepperoni",
      description: "Salsa de tomate, mozzarella y pepperoni",
      price: 15.5,
      image: "/placeholder.svg?height=200&width=300&query=pizza+pepperoni",
      rating: 4.6,
      category: "2",
    },
    {
      id: 5,
      name: "Ensalada César",
      description: "Lechuga romana, crutones, parmesano y aderezo césar",
      price: 9.99,
      image: "/placeholder.svg?key=7002h",
      rating: 4.5,
      category: "3",
    },
    {
      id: 6,
      name: "Ensalada Griega",
      description: "Lechuga, tomate, pepino, cebolla, aceitunas y queso feta",
      price: 10.99,
      image: "/placeholder.svg?height=200&width=300&query=ensalada+griega",
      rating: 4.4,
      category: "3",
    },
    {
      id: 7,
      name: "Pasta Carbonara",
      description: "Espaguetis con salsa carbonara, panceta y queso parmesano",
      price: 13.5,
      image: "/pasta-carbonara.png",
      rating: 4.9,
      category: "4",
    },
    {
      id: 8,
      name: "Pasta Bolognesa",
      description: "Espaguetis con salsa bolognesa y queso parmesano",
      price: 12.5,
      image: "/placeholder.svg?height=200&width=300&query=pasta+bolognesa",
      rating: 4.7,
      category: "4",
    },
    {
      id: 9,
      name: "Tarta de Chocolate",
      description: "Tarta de chocolate con helado de vainilla",
      price: 6.99,
      image: "/placeholder.svg?height=200&width=300&query=tarta+chocolate",
      rating: 4.8,
      category: "5",
    },
    {
      id: 10,
      name: "Cheesecake",
      description: "Tarta de queso con mermelada de frutos rojos",
      price: 7.5,
      image: "/placeholder.svg?height=200&width=300&query=cheesecake",
      rating: 4.9,
      category: "5",
    },
    {
      id: 11,
      name: "Refresco",
      description: "Coca-Cola, Fanta, Sprite (330ml)",
      price: 2.5,
      image: "/placeholder.svg?height=200&width=300&query=refresco",
      rating: 4.5,
      category: "6",
    },
    {
      id: 12,
      name: "Agua Mineral",
      description: "Agua mineral con o sin gas (500ml)",
      price: 1.99,
      image: "/placeholder.svg?height=200&width=300&query=agua+mineral",
      rating: 4.3,
      category: "6",
    },
  ]

  // Filtrar por categoría si se proporciona
  const filteredItems = categoryParam ? menuItems.filter((item) => item.category === categoryParam) : menuItems

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

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold">Menú</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="relative">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="container mx-auto px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input type="text" placeholder="Buscar en el menú..." className="pl-10 bg-white" />
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="container mx-auto px-4">
        <Tabs defaultValue={categoryParam || "all"} className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="bg-white p-1 rounded-lg inline-flex w-auto">
              <TabsTrigger value="all">Todos</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex h-full">
                    <div className="relative h-auto w-1/3 flex-shrink-0">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <CardContent className="p-4 flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold">{item.name}</h3>
                          <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{item.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold">${item.price.toFixed(2)}</span>
                        <Button size="sm" onClick={handleAddToCart}>
                          Añadir
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuItems
                  .filter((item) => item.category === category.id)
                  .map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex h-full">
                        <div className="relative h-auto w-1/3 flex-shrink-0">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>
                        <CardContent className="p-4 flex flex-col justify-between flex-grow">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold">{item.name}</h3>
                              <div className="flex items-center gap-1">
                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{item.rating}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-bold">${item.price.toFixed(2)}</span>
                            <Button size="sm" onClick={handleAddToCart}>
                              Añadir
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {tenantInfo.name}. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
