"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Search, Filter, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function MenuPage() {
  const { user, loading, logout, checkUserRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [isLogoutRef, setIsLogoutRef] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Datos de ejemplo para el menú
  const categories = [
    { id: "all", name: "Todos" },
    { id: "burgers", name: "Hamburguesas" },
    { id: "pizzas", name: "Pizzas" },
    { id: "salads", name: "Ensaladas" },
    { id: "desserts", name: "Postres" },
    { id: "drinks", name: "Bebidas" },
  ]

  const menuItems = [
    {
      id: 1,
      name: "Hamburguesa Clásica",
      description: "Carne de res, queso cheddar, lechuga, tomate y salsa especial",
      price: 9.99,
      category: "burgers",
      image: "/placeholder.svg?key=l40zs",
      featured: true,
      available: true,
    },
    {
      id: 2,
      name: "Pizza Margherita",
      description: "Salsa de tomate, mozzarella fresca y albahaca",
      price: 12.99,
      category: "pizzas",
      image: "/pizza-margherita.png",
      featured: true,
      available: true,
    },
    {
      id: 3,
      name: "Ensalada César",
      description: "Lechuga romana, crutones, parmesano y aderezo césar",
      price: 7.99,
      category: "salads",
      image: "/placeholder.svg?key=4vn3z",
      featured: false,
      available: true,
    },
    {
      id: 4,
      name: "Tarta de Chocolate",
      description: "Tarta casera de chocolate con helado de vainilla",
      price: 5.99,
      category: "desserts",
      image: "/placeholder.svg?key=dluec",
      featured: false,
      available: true,
    },
    {
      id: 5,
      name: "Refresco de Cola",
      description: "Refresco de cola con hielo y limón",
      price: 2.49,
      category: "drinks",
      image: "/placeholder.svg?key=jsl66",
      featured: false,
      available: true,
    },
    {
      id: 6,
      name: "Hamburguesa Vegana",
      description: "Hamburguesa de garbanzos, lechuga, tomate y salsa de aguacate",
      price: 10.99,
      category: "burgers",
      image: "/placeholder.svg?key=h7f22",
      featured: true,
      available: false,
    },
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

  // Filtrar los elementos del menú según la búsqueda y categoría
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || !selectedCategory || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
      <div className="flex-1 p-4 md:p-8 overflow-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Menú</h1>
            <p className="text-muted-foreground">Gestiona los productos de tu restaurante</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>

        {/* Barra de acciones */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Buscar productos..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Producto
            </Button>
          </div>
        </div>

        {/* Categorías */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="whitespace-nowrap"
              onClick={() => setSelectedCategory(category.id === "all" ? null : category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Lista de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className={`overflow-hidden ${!item.available ? "opacity-60" : ""}`}>
              <div className="relative h-48">
                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                {item.featured && <Badge className="absolute top-2 left-2 bg-yellow-500">Destacado</Badge>}
                {!item.available && <Badge className="absolute top-2 right-2 bg-red-500">No disponible</Badge>}
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{item.name}</h3>
                  <span className="font-bold">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{categories.find((c) => c.id === item.category)?.name}</Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/menu/${item.id}`}>Ver detalles</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron productos que coincidan con tu búsqueda.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory(null)
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
