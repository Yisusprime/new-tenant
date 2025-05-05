"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus } from "lucide-react"
import Image from "next/image"
import { ref, get } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  categoryId: string
  available: boolean
}

interface Category {
  id: string
  name: string
}

interface ProductSelectorProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  selectedCategoryId: string | null
  onProductSelect: (product: Product) => void
}

export function ProductSelector({
  isOpen,
  onOpenChange,
  tenantId,
  selectedCategoryId,
  onProductSelect,
}: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(selectedCategoryId)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !tenantId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // CORREGIDO: Ruta correcta para categorías
        const categoriesRef = ref(rtdb, `${tenantId}/categories`)
        const categoriesSnapshot = await get(categoriesRef)
        const categoriesData = categoriesSnapshot.val() || {}

        const categoriesList: Category[] = Object.keys(categoriesData).map((key) => ({
          id: key,
          name: categoriesData[key].name,
        }))
        setCategories(categoriesList)

        // CORREGIDO: Ruta correcta para productos
        const productsRef = ref(rtdb, `${tenantId}/products`)
        const productsSnapshot = await get(productsRef)
        const productsData = productsSnapshot.val() || {}

        const productsList: Product[] = Object.keys(productsData).map((key) => ({
          id: key,
          name: productsData[key].name,
          description: productsData[key].description || "",
          price: productsData[key].price || 0,
          imageUrl: productsData[key].imageUrl || "",
          categoryId: productsData[key].categoryId || "",
          available: productsData[key].available !== false, // Por defecto true
        }))
        setProducts(productsList)

        // Si hay un categoryId seleccionado, usarlo
        if (selectedCategoryId) {
          setActiveCategory(selectedCategoryId)
        } else if (categoriesList.length > 0) {
          // Si no, usar la primera categoría
          setActiveCategory(categoriesList[0].id)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isOpen, tenantId, selectedCategoryId])

  // Filtrar productos por búsqueda y categoría
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory ? product.categoryId === activeCategory : true
    return matchesSearch && product.available
  })

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Seleccionar Producto</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Buscar productos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col flex-grow overflow-hidden">
          <Tabs defaultValue={activeCategory || "all"} className="flex-grow overflow-hidden flex flex-col">
            <TabsList className="mb-4 overflow-x-auto flex-nowrap justify-start">
              <TabsTrigger value="all" onClick={() => setActiveCategory(null)}>
                Todos
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} onClick={() => setActiveCategory(category.id)}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-grow overflow-y-auto">
              <TabsContent value="all" className="mt-0 h-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {loading ? (
                    <div className="col-span-full text-center py-8">Cargando productos...</div>
                  ) : error ? (
                    <div className="col-span-full text-center py-8 text-red-500">{error}</div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="col-span-full text-center py-8">No se encontraron productos</div>
                  ) : (
                    filteredProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden cursor-pointer hover:bg-gray-50">
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            {product.imageUrl ? (
                              <Image
                                src={product.imageUrl || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span className="text-xs">Sin imagen</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium text-sm">{product.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                            <p className="text-sm font-semibold mt-1">${product.price.toFixed(2)}</p>
                          </div>
                          <Button size="sm" className="flex-shrink-0" onClick={() => onProductSelect(product)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-0 h-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {loading ? (
                      <div className="col-span-full text-center py-8">Cargando productos...</div>
                    ) : error ? (
                      <div className="col-span-full text-center py-8 text-red-500">{error}</div>
                    ) : (
                      products
                        .filter((p) => p.categoryId === category.id && p.available)
                        .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((product) => (
                          <Card key={product.id} className="overflow-hidden cursor-pointer hover:bg-gray-50">
                            <CardContent className="p-3 flex items-center gap-3">
                              <div className="relative h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                {product.imageUrl ? (
                                  <Image
                                    src={product.imageUrl || "/placeholder.svg"}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span className="text-xs">Sin imagen</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow">
                                <h3 className="font-medium text-sm">{product.name}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                                <p className="text-sm font-semibold mt-1">${product.price.toFixed(2)}</p>
                              </div>
                              <Button size="sm" className="flex-shrink-0" onClick={() => onProductSelect(product)}>
                                <Plus className="h-4 w-4" />
                              </Button>
                            </CardContent>
                          </Card>
                        ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
