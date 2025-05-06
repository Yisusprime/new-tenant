"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Heart, Star, Home, ShoppingBag, User, Plus, ChevronLeft, ChevronRight } from "lucide-react"

interface MobilePreviewProps {
  tenantData: any
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function MobilePreview({ tenantData, activeTab, setActiveTab }: MobilePreviewProps) {
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Productos de ejemplo para la vista previa
  const exampleProducts = [
    {
      id: "1",
      name: "Pizza Margherita",
      description: "Tomate, mozzarella, albahaca fresca y aceite de oliva",
      price: 12.99,
      imageUrl: "/pizza-margherita.png",
      featured: true,
      category: "pizzas",
    },
    {
      id: "2",
      name: "Pasta Carbonara",
      description: "Espaguetis con huevo, queso pecorino, panceta y pimienta negra",
      price: 14.5,
      imageUrl: "/pasta-carbonara.png",
      featured: true,
      category: "pastas",
    },
    {
      id: "3",
      name: "Tacos al Pastor",
      description: "Tortillas de maíz con carne de cerdo marinada, piña, cebolla y cilantro",
      price: 10.99,
      imageUrl: "/tacos-al-pastor.png",
      featured: false,
      category: "tacos",
    },
    {
      id: "4",
      name: "Ensalada César",
      description: "Lechuga romana, crutones, parmesano y aderezo César",
      price: 8.99,
      imageUrl: "/vibrant-salad-bowl.png",
      featured: false,
      category: "ensaladas",
    },
  ]

  // Categorías de ejemplo
  const categories = [
    { id: "all", name: "Todos" },
    { id: "pizzas", name: "Pizzas" },
    { id: "pastas", name: "Pastas" },
    { id: "tacos", name: "Tacos" },
    { id: "ensaladas", name: "Ensaladas" },
  ]

  // Filtrar productos destacados y populares
  const featuredProducts = exampleProducts.filter((product) => product.featured)
  const popularProducts = exampleProducts.filter((product) => !product.featured).slice(0, 4)

  return (
    <div className="sticky top-4">
      <div className="flex flex-col items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="home">Inicio</TabsTrigger>
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="product">Producto</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Dispositivo móvil simulado */}
        <div className="border-[10px] border-gray-800 rounded-[32px] w-[320px] h-[640px] overflow-hidden shadow-xl bg-white relative">
          {/* Barra de estado */}
          <div className="h-6 bg-gray-800 w-full flex justify-between items-center px-4">
            <div className="text-white text-[10px]">9:41</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>

          {/* Contenido del móvil - Réplica exacta de admin/page.jsx */}
          <div
            className="h-[calc(100%-6rem)] overflow-y-auto hide-scrollbar"
            style={{ backgroundColor: tenantData.backgroundColor || "#f9fafb" }}
          >
            {/* Banner y Logo */}
            <div className="relative">
              <div
                className="h-32 relative rounded-b-lg overflow-hidden"
                style={{
                  background: `linear-gradient(to right, ${tenantData.primaryColor || "#f97316"}, ${tenantData.secondaryColor || "#dc2626"})`,
                }}
              >
                {/* Banner image */}
                <div className="absolute inset-0" style={{ opacity: tenantData.bannerOpacity || 0.2 }}>
                  <Image
                    src={tenantData.bannerUrl || "/modern-restaurant-interior.png"}
                    alt="Banner de comida"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Botón de Abierto/Cerrado (izquierda) */}
                <div className="absolute top-2 left-2 z-10">
                  <Button
                    variant="outline"
                    className={`${
                      tenantData.isOpen
                        ? "bg-white/70 hover:bg-white/90 text-green-600"
                        : "bg-white/70 hover:bg-white/90 text-red-600"
                    } font-medium border-0 text-xs py-1 px-2 h-auto`}
                    size="sm"
                  >
                    {tenantData.isOpen ? "Abierto" : "Cerrado"}
                  </Button>
                </div>

                {/* Botones de acción (derecha) */}
                <div className="absolute top-2 right-2 z-10 flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full bg-white/50 hover:bg-white/80 border-0"
                  >
                    <Heart size={12} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full bg-white/50 hover:bg-white/80 border-0"
                  >
                    <Search size={12} />
                  </Button>
                </div>
              </div>

              {/* Logo flotante */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-12">
                <div className="relative w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                  <Image
                    src={tenantData.logoUrl || "/restaurant-logo.png"}
                    alt={tenantData.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Título del restaurante */}
            <div className="mt-16 text-center px-4">
              <h1 className="text-lg font-bold">{tenantData.name}</h1>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-1">
                <span className="flex items-center">
                  <Star size={12} className="fill-yellow-400 text-yellow-400 mr-1" />
                  {tenantData.rating || "4.8"}
                </span>
                <span>•</span>
                <span>{tenantData.distance || "0.8 km"}</span>
                <span>•</span>
                <span>{tenantData.deliveryTime || "20-35 min"}</span>
              </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="px-4 mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <Input
                  type="text"
                  placeholder="Buscar platos, categorías..."
                  className="pl-10 bg-white rounded-full border-gray-200 h-8 text-xs"
                />
              </div>
            </div>

            {/* Artículos destacados - Slider */}
            {featuredProducts.length > 0 && (
              <div className="mt-4">
                <div className="px-4 flex justify-between items-center mb-2">
                  <h2 className="text-sm font-bold">Destacados</h2>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                      <ChevronLeft size={14} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>

                <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-3 px-4 pb-3">
                  {featuredProducts.map((product) => (
                    <div key={product.id} className="flex-shrink-0 w-[160px] snap-start cursor-pointer">
                      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                        <div className="relative h-24">
                          <Image
                            src={product.imageUrl || "/placeholder.svg?height=200&width=300&query=plato+comida"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/80 hover:bg-white"
                          >
                            <Heart size={12} />
                          </Button>
                        </div>
                        <CardContent className="p-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-xs">{product.name}</h3>
                            <div className="flex items-center gap-1 bg-gray-100 px-1 py-0.5 rounded text-[10px]">
                              <Star size={8} className="fill-yellow-400 text-yellow-400" />
                              <span>4.8</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-bold text-xs">${product.price.toFixed(2)}</span>
                            <Button
                              size="sm"
                              className="h-6 text-[10px] px-2 rounded-full"
                              style={{
                                backgroundColor: tenantData.productButtonColor || "#f97316",
                                color: tenantData.buttonTextColor || "#ffffff",
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
              <div className="mt-4">
                <div className="px-4 flex justify-between items-center mb-2">
                  <h2 className="text-sm font-bold">Categorías</h2>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                      <ChevronLeft size={14} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>

                <div className="flex overflow-x-auto scrollbar-hide gap-3 px-4 pb-3">
                  {categories.slice(0, 8).map((category) => (
                    <div key={category.id} className="flex-shrink-0">
                      <div className="flex flex-col items-center gap-1 w-12">
                        <div className="relative w-12 h-12 rounded-full bg-white shadow-sm overflow-hidden">
                          <Image
                            src={`/abstract-geometric-shapes.png?height=80&width=80&query=${category.name}`}
                            alt={category.name}
                            fill
                            className="object-cover p-2"
                          />
                        </div>
                        <span className="text-[10px] text-center font-medium">{category.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Productos populares */}
            {popularProducts.length > 0 && (
              <div className="mt-4 px-4 pb-16">
                <h2 className="text-sm font-bold mb-2">Más populares</h2>
                <div className="grid grid-cols-1 gap-3">
                  {popularProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex h-full">
                        <div className="relative h-auto w-1/3 flex-shrink-0">
                          <Image
                            src={product.imageUrl || "/placeholder.svg?height=200&width=300&query=plato+comida"}
                            alt={product.name}
                            width={100}
                            height={100}
                            className="object-cover h-full"
                          />
                        </div>
                        <CardContent className="p-2 flex flex-col justify-between flex-grow">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-xs">{product.name}</h3>
                              <div className="flex items-center gap-1 bg-gray-100 px-1 py-0.5 rounded text-[10px]">
                                <Star size={8} className="fill-yellow-400 text-yellow-400" />
                                <span>4.7</span>
                              </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-bold text-xs">${product.price.toFixed(2)}</span>
                            <Button
                              size="sm"
                              className="h-6 text-[10px] px-2 rounded-full"
                              style={{
                                backgroundColor: tenantData.productButtonColor || "#f97316",
                                color: tenantData.buttonTextColor || "#ffffff",
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

          {/* Menú inferior fijo */}
          <div className="h-12 border-t bg-white flex justify-around items-center">
            <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-1">
              <Home size={16} />
              <span className="text-[10px]">Inicio</span>
            </Button>

            <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-1">
              <Search size={16} />
              <span className="text-[10px]">Buscar</span>
            </Button>

            <Button
              className="flex items-center justify-center rounded-full h-10 w-10 shadow-lg -mt-4"
              style={{
                backgroundColor: tenantData.buttonColor || "#f97316",
                color: tenantData.buttonTextColor || "#ffffff",
              }}
            >
              <Plus size={20} />
            </Button>

            <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-1 relative">
              <ShoppingBag size={16} />
              <span className="text-[10px]">Carrito</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
            </Button>

            <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-1">
              <User size={16} />
              <span className="text-[10px]">Perfil</span>
            </Button>
          </div>
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
