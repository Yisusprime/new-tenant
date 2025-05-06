"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Menu, Heart, Share, Info, ArrowLeft } from "lucide-react"

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
      category: "pizzas",
    },
    {
      id: "2",
      name: "Pasta Carbonara",
      description: "Espaguetis con huevo, queso pecorino, panceta y pimienta negra",
      price: 14.5,
      imageUrl: "/pasta-carbonara.png",
      category: "pastas",
    },
    {
      id: "3",
      name: "Tacos al Pastor",
      description: "Tortillas de maíz con carne de cerdo marinada, piña, cebolla y cilantro",
      price: 10.99,
      imageUrl: "/tacos-al-pastor.png",
      category: "tacos",
    },
    {
      id: "4",
      name: "Ensalada César",
      description: "Lechuga romana, crutones, parmesano y aderezo César",
      price: 8.99,
      imageUrl: "/vibrant-salad-bowl.png",
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

  return (
    <div className="sticky top-4">
      <div className="flex flex-col items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="home">Inicio</TabsTrigger>
            <TabsTrigger value="menu">Menú</TabsTrigger>
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

          {/* Contenido del móvil */}
          <div className="h-[calc(100%-6rem)] overflow-y-auto hide-scrollbar">
            {activeTab === "home" && (
              <div className="flex flex-col h-full">
                {/* Header con banner y logo */}
                <div className="relative">
                  <div
                    className="h-32 w-full relative"
                    style={{
                      background: `linear-gradient(to right, ${tenantData.primaryColor || "#f97316"}, ${tenantData.secondaryColor || "#dc2626"})`,
                    }}
                  >
                    {/* Banner image */}
                    <div className="absolute inset-0" style={{ opacity: tenantData.bannerOpacity || 0.3 }}>
                      <Image
                        src={tenantData.bannerUrl || "/modern-restaurant-interior.png"}
                        alt="Banner"
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Estado abierto/cerrado */}
                    <div className="absolute top-2 right-2">
                      <Badge variant={tenantData.isOpen ? "default" : "destructive"} className="text-xs">
                        {tenantData.isOpen ? "Abierto" : "Cerrado"}
                      </Badge>
                    </div>
                  </div>

                  {/* Logo flotante */}
                  <div className="absolute left-4 -bottom-10 flex items-end">
                    <div className="w-20 h-20 rounded-xl border-4 border-white bg-white shadow-md overflow-hidden">
                      <Image
                        src={tenantData.logoUrl || "/restaurant-logo.png"}
                        alt={tenantData.name}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-3 mb-1">
                      <h1 className="font-bold text-lg">{tenantData.name}</h1>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{tenantData.rating} ★</span>
                        <span className="mx-1">•</span>
                        <span>{tenantData.deliveryTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Espacio para el logo flotante */}
                <div className="h-14"></div>

                {/* Barra de búsqueda */}
                <div className="px-4 mt-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Buscar platos..."
                      className="w-full pl-10 pr-4 py-2 text-sm border rounded-full"
                    />
                  </div>
                </div>

                {/* Categorías horizontales */}
                <div className="mt-4 px-4">
                  <h2 className="font-bold text-sm mb-2">Categorías</h2>
                  <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
                    {categories.map((category) => (
                      <Badge
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        className="cursor-pointer whitespace-nowrap"
                        style={{
                          backgroundColor: selectedCategory === category.id ? tenantData.buttonColor : "transparent",
                          color: selectedCategory === category.id ? tenantData.buttonTextColor : "inherit",
                        }}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Productos destacados */}
                <div className="mt-4 px-4 pb-4">
                  <h2 className="font-bold text-sm mb-2">Productos destacados</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {exampleProducts
                      .filter((p) => selectedCategory === "all" || p.category === selectedCategory)
                      .map((product) => (
                        <Card key={product.id} className="overflow-hidden border">
                          <div className="relative h-24">
                            <Image
                              src={product.imageUrl || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-2">
                            <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="font-bold text-sm">${product.price.toFixed(2)}</span>
                              <Button
                                size="sm"
                                className="h-6 text-xs px-2 rounded-full"
                                style={{
                                  backgroundColor: tenantData.productButtonColor || "#f97316",
                                  color: tenantData.buttonTextColor || "#ffffff",
                                }}
                              >
                                Añadir
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "menu" && (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center">
                    <ArrowLeft size={20} className="mr-2" />
                    <h1 className="font-bold">Menú</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search size={20} />
                    <Menu size={20} />
                  </div>
                </div>

                {/* Categorías */}
                <div className="flex border-b">
                  <div className="flex overflow-x-auto hide-scrollbar">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className={`px-4 py-3 whitespace-nowrap font-medium text-sm cursor-pointer ${
                          selectedCategory === category.id ? "border-b-2 border-black" : ""
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lista de productos */}
                <div className="flex-1 overflow-y-auto hide-scrollbar">
                  {exampleProducts
                    .filter((p) => selectedCategory === "all" || p.category === selectedCategory)
                    .map((product) => (
                      <div key={product.id} className="flex p-4 border-b">
                        <div className="flex-1 pr-3">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                          <div className="mt-2 flex justify-between items-center">
                            <span className="font-bold">${product.price.toFixed(2)}</span>
                            <Button
                              size="sm"
                              className="h-7 text-xs rounded-full"
                              style={{
                                backgroundColor: tenantData.productButtonColor || "#f97316",
                                color: tenantData.buttonTextColor || "#ffffff",
                              }}
                            >
                              Añadir
                            </Button>
                          </div>
                        </div>
                        <div className="w-20 h-20 relative rounded-md overflow-hidden">
                          <Image
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === "product" && (
              <div className="flex flex-col h-full">
                {/* Imagen del producto */}
                <div className="relative h-48">
                  <Image src="/pizza-margherita.png" alt="Pizza Margherita" fill className="object-cover" />
                  <div className="absolute top-4 left-4">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-white/80">
                      <ArrowLeft size={16} />
                    </Button>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-white/80">
                      <Heart size={16} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-white/80">
                      <Share size={16} />
                    </Button>
                  </div>
                </div>

                {/* Detalles del producto */}
                <div className="p-4">
                  <h1 className="text-xl font-bold">Pizza Margherita</h1>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="flex items-center">
                      <span className="text-yellow-500">★</span> 4.8
                    </span>
                    <span className="mx-2">•</span>
                    <span>15-20 min</span>
                  </div>

                  <p className="mt-3 text-sm text-gray-700">
                    Tomate, mozzarella, albahaca fresca y aceite de oliva. Una pizza clásica italiana con ingredientes
                    frescos y de alta calidad.
                  </p>

                  <div className="mt-4 flex items-center">
                    <Info size={16} className="text-gray-500 mr-2" />
                    <span className="text-sm text-gray-500">Información nutricional y alérgenos</span>
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <div className="font-bold text-xl">${"12.99"}</div>
                    <Button
                      className="rounded-full"
                      style={{
                        backgroundColor: tenantData.buttonColor || "#f97316",
                        color: tenantData.buttonTextColor || "#ffffff",
                      }}
                    >
                      Añadir al carrito
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Barra de navegación inferior */}
          <div className="h-12 border-t bg-white flex justify-around items-center">
            <div className="flex flex-col items-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span className="text-[10px]">Inicio</span>
            </div>
            <div className="flex flex-col items-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span className="text-[10px]">Chat</span>
            </div>
            <div className="flex flex-col items-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className="text-[10px]">Carrito</span>
            </div>
            <div className="flex flex-col items-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span className="text-[10px]">Perfil</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
