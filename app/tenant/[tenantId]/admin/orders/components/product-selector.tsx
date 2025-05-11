"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { formatCurrency } from "@/lib/utils"
import { Loader2, Minus, Plus, Search } from "lucide-react"
import type { Product, ProductExtra } from "@/lib/types/product"
import { getCategories, type Category } from "@/lib/services/category-service"

interface ProductSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Product[]
  extras: ProductExtra[]
  onAddProduct: (product: Product, quantity: number, selectedExtras: ProductExtra[]) => void
  tenantId: string
  branchId: string
}

export function ProductSelector({
  open,
  onOpenChange,
  products,
  extras,
  onAddProduct,
  tenantId,
  branchId,
}: ProductSelectorProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedExtras, setSelectedExtras] = useState<ProductExtra[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(false)

  // Cargar categorías al abrir el diálogo
  useEffect(() => {
    if (open) {
      loadCategories()
    }
  }, [open, tenantId, branchId])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const categoriesData = await getCategories(tenantId, branchId)
      setCategories(categoriesData.filter((c) => c.isActive))
      setLoading(false)
    } catch (error) {
      console.error("Error al cargar categorías:", error)
      setLoading(false)
    }
  }

  // Filtrar productos según la búsqueda y categoría seleccionada
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setQuantity(1)
    setSelectedExtras([])
  }

  const handleToggleExtra = (extra: ProductExtra) => {
    if (selectedExtras.some((e) => e.id === extra.id)) {
      setSelectedExtras(selectedExtras.filter((e) => e.id !== extra.id))
    } else {
      setSelectedExtras([...selectedExtras, extra])
    }
  }

  const handleAddToOrder = () => {
    if (selectedProduct) {
      onAddProduct(selectedProduct, quantity, selectedExtras)
      resetForm()
    }
  }

  const resetForm = () => {
    setSelectedProduct(null)
    setQuantity(1)
    setSelectedExtras([])
    setSearchTerm("")
  }

  const calculateTotal = () => {
    if (!selectedProduct) return 0

    const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0)
    return (selectedProduct.price + extrasTotal) * quantity
  }

  // Filtrar extras disponibles para el producto seleccionado
  const availableExtras =
    selectedProduct && selectedProduct.availableExtras
      ? extras.filter((extra) => selectedProduct.availableExtras?.includes(extra.id))
      : []

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm()
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Seleccionar Producto</DialogTitle>
          <DialogDescription>Busca y selecciona los productos para agregar al pedido.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col">
          {!selectedProduct ? (
            // Vista de selección de producto
            <>
              <div className="mb-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Buscar productos..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
                  <ScrollArea className="w-full" orientation="horizontal">
                    <TabsList className="w-full justify-start">
                      <TabsTrigger value="all">Todos</TabsTrigger>
                      {categories.map((category) => (
                        <TabsTrigger key={category.id} value={category.id}>
                          {category.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </ScrollArea>

                  <TabsContent value="all" className="mt-2">
                    <ProductGrid products={filteredProducts} onSelectProduct={handleSelectProduct} loading={loading} />
                  </TabsContent>

                  {categories.map((category) => (
                    <TabsContent key={category.id} value={category.id} className="mt-2">
                      <ProductGrid
                        products={filteredProducts}
                        onSelectProduct={handleSelectProduct}
                        loading={loading}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </>
          ) : (
            // Vista de detalles del producto seleccionado
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{selectedProduct.name}</h3>
                  {selectedProduct.description && (
                    <p className="text-sm text-gray-500 mt-1">{selectedProduct.description}</p>
                  )}
                  <p className="text-lg font-medium mt-2">{formatCurrency(selectedProduct.price)}</p>
                </div>
                {selectedProduct.imageUrl && (
                  <div className="w-24 h-24 rounded-md overflow-hidden">
                    <img
                      src={selectedProduct.imageUrl || "/placeholder.svg"}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-4 bg-gray-100 p-3 rounded-md">
                <span className="font-medium">Cantidad:</span>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-3 font-medium">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {availableExtras.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Extras disponibles:</h4>
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-2">
                      {availableExtras.map((extra) => (
                        <div key={extra.id} className="flex items-center justify-between border p-2 rounded-md">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`extra-${extra.id}`}
                              checked={selectedExtras.some((e) => e.id === extra.id)}
                              onCheckedChange={() => handleToggleExtra(extra)}
                            />
                            <div>
                              <Label htmlFor={`extra-${extra.id}`} className="font-medium">
                                {extra.name}
                              </Label>
                              {extra.description && <p className="text-xs text-gray-500">{extra.description}</p>}
                            </div>
                          </div>
                          <span className="font-medium">{formatCurrency(extra.price)}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <div className="mt-auto pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          {selectedProduct ? (
            <div className="flex w-full justify-between">
              <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                Volver
              </Button>
              <Button onClick={handleAddToOrder}>Agregar al Pedido</Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ProductGridProps {
  products: Product[]
  onSelectProduct: (product: Product) => void
  loading: boolean
}

function ProductGrid({ products, onSelectProduct, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (products.length === 0) {
    return <div className="text-center py-12 text-gray-500">No se encontraron productos</div>
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-md p-3 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onSelectProduct(product)}
          >
            <div className="flex items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{product.name}</h3>
                {product.description && <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>}
                <p className="mt-1 font-medium">{formatCurrency(product.price)}</p>
              </div>
              {product.imageUrl && (
                <div className="w-16 h-16 rounded-md overflow-hidden ml-2 flex-shrink-0">
                  <img
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
