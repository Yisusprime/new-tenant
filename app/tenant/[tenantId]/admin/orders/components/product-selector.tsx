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
import { Checkbox } from "@/components/ui/checkbox"
import type { Product, ProductExtra } from "@/lib/types/product"
import { formatCurrency } from "@/lib/utils"
import { Loader2, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCategories } from "@/lib/services/category-service"
import type { Category } from "@/lib/services/category-service"

interface ProductSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Product[]
  extras: ProductExtra[]
  onAddProduct: (product: Product, quantity: number, selectedExtras: ProductExtra[]) => void
}

export function ProductSelector({ open, onOpenChange, products, extras, onAddProduct }: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedExtras, setSelectedExtras] = useState<ProductExtra[]>([])
  const [availableExtras, setAvailableExtras] = useState<ProductExtra[]>([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setSearchTerm("")
      setSelectedProduct(null)
      setQuantity(1)
      setSelectedExtras([])
      loadCategories()
    }
  }, [open])

  useEffect(() => {
    let filtered = products

    // Filtrar por categoría si hay una seleccionada
    if (selectedCategory) {
      filtered = filtered.filter((product) => product.categoryId === selectedCategory)
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          (product.description && product.description.toLowerCase().includes(term)),
      )
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory])

  const loadCategories = async () => {
    try {
      // Aquí deberías obtener el tenantId y branchId del contexto o props
      // Por ahora, usamos valores de ejemplo
      const tenantId = window.location.pathname.split("/")[2]
      const branchId = localStorage.getItem(`${tenantId}_currentBranch`) || ""

      if (tenantId && branchId) {
        const categoriesData = await getCategories(tenantId, branchId)
        setCategories(categoriesData.filter((c) => c.isActive))
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error)
    }
  }

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setQuantity(1)
    setSelectedExtras([])

    // Filtrar extras disponibles para este producto
    if (product.availableExtras && product.availableExtras.length > 0) {
      const productExtras = extras.filter((extra) => product.availableExtras!.includes(extra.id))
      setAvailableExtras(productExtras)
    } else {
      setAvailableExtras([])
    }
  }

  const handleExtraToggle = (extra: ProductExtra) => {
    if (selectedExtras.some((e) => e.id === extra.id)) {
      setSelectedExtras(selectedExtras.filter((e) => e.id !== extra.id))
    } else {
      setSelectedExtras([...selectedExtras, extra])
    }
  }

  const handleAddProduct = () => {
    if (!selectedProduct) return

    setLoading(true)
    try {
      onAddProduct(selectedProduct, quantity, selectedExtras)
      setSelectedProduct(null)
      setQuantity(1)
      setSelectedExtras([])
      onOpenChange(false)
    } catch (error) {
      console.error("Error al agregar producto:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    if (!selectedProduct) return 0

    const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0)
    return (selectedProduct.price + extrasTotal) * quantity
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seleccionar Producto</DialogTitle>
          <DialogDescription>Busca y selecciona productos para agregar al pedido.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={selectedProduct ? "details" : "products"} className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedProduct}>
              Detalles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="py-4">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="w-64">
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">No se encontraron productos</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`border rounded-md p-4 cursor-pointer transition-colors ${
                        selectedProduct?.id === product.id ? "border-primary bg-primary/5" : "hover:border-gray-400"
                      }`}
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          {product.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                          )}
                        </div>
                        <p className="font-medium">{formatCurrency(product.price)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="py-4">
            {selectedProduct && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{selectedProduct.name}</h3>
                    {selectedProduct.description && <p className="text-gray-500 mt-1">{selectedProduct.description}</p>}
                  </div>
                  <p className="font-medium text-lg">{formatCurrency(selectedProduct.price)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="mx-4 font-medium">{quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {availableExtras.length > 0 && (
                  <div className="space-y-2">
                    <Label>Extras Disponibles</Label>
                    <div className="space-y-2 border rounded-md p-4">
                      {availableExtras.map((extra) => (
                        <div key={extra.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`extra-${extra.id}`}
                              checked={selectedExtras.some((e) => e.id === extra.id)}
                              onCheckedChange={() => handleExtraToggle(extra)}
                            />
                            <Label htmlFor={`extra-${extra.id}`} className="cursor-pointer">
                              {extra.name}
                            </Label>
                          </div>
                          <span>{formatCurrency(extra.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleAddProduct} disabled={!selectedProduct || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Agregar al Pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
