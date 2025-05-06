"use client"
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Heart, Search, Star, MapPin, Phone, Clock, ChevronLeft, ChevronRight } from "lucide-react"

interface RestaurantPreviewProps {
  previewTab: string
  setPreviewTab: (tab: string) => void
  tenantData: any
}

export function RestaurantPreview({ previewTab, setPreviewTab, tenantData }: RestaurantPreviewProps) {
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

  return (
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
              className="h-full overflow-y-auto hide-scrollbar"
              style={{ backgroundColor: tenantData.backgroundColor || "#f9fafb" }}
            >
              {previewTab === "main" && (
                <div className="min-h-screen pb-16">
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
                          src={tenantData.logoUrl || "/placeholder.svg?height=200&width=200&query=restaurante+logo"}
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
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                          <ChevronLeft size={18} />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                          <ChevronRight size={18} />
                        </Button>
                      </div>
                    </div>

                    <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-4 px-4 pb-4">
                      {exampleProducts.map((product) => (
                        <div key={product.id} className="flex-shrink-0 w-[220px] snap-start">
                          <Card className="overflow-hidden h-full">
                            <div className="relative h-32">
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
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
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

                    <div className="flex overflow-x-auto hide-scrollbar gap-4 px-4 pb-4">
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

                    {/* Métodos de pago y opciones de servicio */}
                    {(tenantData.paymentMethods || tenantData.serviceOptions) && (
                      <>
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2">Métodos de pago aceptados</h4>
                          <div className="flex flex-wrap gap-2">
                            {tenantData.paymentMethods?.acceptsCash !== false && (
                              <Badge variant="outline" className="bg-gray-100">
                                Efectivo
                              </Badge>
                            )}
                            {tenantData.paymentMethods?.acceptsCard !== false && (
                              <Badge variant="outline" className="bg-gray-100">
                                Tarjeta
                              </Badge>
                            )}
                            {tenantData.paymentMethods?.acceptsTransfer === true && (
                              <Badge variant="outline" className="bg-gray-100">
                                Transferencia
                              </Badge>
                            )}
                            {tenantData.paymentMethods?.acceptsOnlinePayment === true && (
                              <Badge variant="outline" className="bg-gray-100">
                                Pago en línea
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2">Opciones de servicio</h4>
                          <div className="flex flex-wrap gap-2">
                            {tenantData.serviceOptions?.offersPickup !== false && (
                              <Badge variant="outline" className="bg-gray-100">
                                Retiro en local
                              </Badge>
                            )}
                            {tenantData.serviceOptions?.offersTakeaway !== false && (
                              <Badge variant="outline" className="bg-gray-100">
                                Para llevar
                              </Badge>
                            )}
                            {tenantData.serviceOptions?.offersDelivery === true && (
                              <Badge variant="outline" className="bg-gray-100">
                                Domicilio
                              </Badge>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="mt-4 pt-4 border-t">
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

                    <div className="mt-4 pt-4 border-t">
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
  )
}
