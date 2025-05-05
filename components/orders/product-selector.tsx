"use client"

import { useState, useEffect } from "react"
import { ref, get } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus } from "lucide-react"

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(selectedCategoryId)

  useEffect(() => {
    if (isOpen && tenantId) {
      fetchData()
    }
  }, [isOpen, tenantId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch categories
      const categoriesRef = ref(rtdb, `tenants/${tenantId}/categories`)
      const categoriesSnapshot = await get(categoriesRef)
      const categoriesData = categoriesSnapshot.val() || {}

      const categoriesList: Category[] = Object.keys(categoriesData).map((key) => ({
        id: key,
        name: categoriesData[key].name,
      }))
      setCategories(categoriesList)

      // Fetch products
      const productsRef = ref(rtdb, `tenants/${tenantId}/products`)
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

      setLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError(`Error al cargar los datos: ${error instanceof Error ? error.message : "Desconocido"}`)
      setLoading(false)
    }
  }

  // Filtrar productos por búsqueda y categoría
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory ? product.categoryId === activeCategory : true
    return matchesSearch && matchesCategory && product.available
  })

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Seleccionar Producto</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Tabs
            defaultValue="all"
            value={activeCategory || "all"}
            onValueChange={(value) => setActiveCategory(value === "all" ? null : value)}
          >
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="all">Todos</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {loading ? (
                  <div className="col-span-full flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : error ? (
                  <div className="col-span-full bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
                    {error}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No se encontraron productos
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      {product.imageUrl && (
                        <div className="h-32 bg-muted">
                          <img
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                          </div>
                          <span className="font-medium">${product.price.toFixed(2)}</span>
                        </div>
                        <Button onClick={() => onProductSelect(product)} variant="outline" size="sm" className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Añadir
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {loading ? (
                    <div className="col-span-full flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : error ? (
                    <div className="col-span-full bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
                      {error}
                    </div>
                  ) : (
                    products
                      .filter(
                        (product) =>
                          product.categoryId === category.id &&
                          product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                          product.available,
                      )
                      .map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                          {product.imageUrl && (
                            <div className="h-32 bg-muted">
                              <img
                                src={product.imageUrl || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium">{product.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                              </div>
                              <span className="font-medium">${product.price.toFixed(2)}</span>
                            </div>
                            <Button
                              onClick={() => onProductSelect(product)}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Añadir
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
