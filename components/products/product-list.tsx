"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, ChevronRight, ImageIcon, Loader2, Star } from "lucide-react"
import { useProducts } from "./product-context"
import { ProductForm } from "./product-form"
import { DeleteConfirmDialog } from "../categories/delete-confirm-dialog"
import { ProductExtrasManager } from "./product-extras-manager"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useCategories } from "../categories/category-context"
import { Input } from "@/components/ui/input"

export function ProductList() {
  const { products, loading, deleteProduct, setSelectedProduct, updateProduct } = useProducts()
  const { categories } = useCategories()
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
  const [imageError, setImageError] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState("")

  const handleAddProduct = () => {
    setIsAddingProduct(true)
    setEditingProduct(null)
  }

  const handleEditProduct = (productId: string) => {
    setEditingProduct(productId)
    setIsAddingProduct(false)
  }

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete)
      setProductToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const toggleExpandProduct = (productId: string) => {
    if (expandedProduct === productId) {
      setExpandedProduct(null)
    } else {
      setExpandedProduct(productId)
      const product = products.find((p) => p.id === productId)
      if (product) {
        setSelectedProduct(product)
      }
    }
  }

  const handleImageError = (productId: string) => {
    setImageError((prev) => ({ ...prev, [productId]: true }))
  }

  const toggleProductAvailability = async (productId: string, currentValue: boolean) => {
    await updateProduct(productId, { available: !currentValue })
  }

  const toggleProductFeatured = async (productId: string, currentValue: boolean) => {
    await updateProduct(productId, { featured: !currentValue })
  }

  const getCategoryName = (categoryId: string | undefined) => {
    if (!categoryId) return "Sin categoría"
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.name : "Categoría desconocida"
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      getCategoryName(product.categoryId).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando productos...</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Lista de Productos</h2>
            <Button onClick={handleAddProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Producto
            </Button>
          </div>
          <div className="relative">
            <Input
              placeholder="Buscar productos por nombre, descripción o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-full"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay productos</h3>
              <p className="text-muted-foreground mb-4">Añade tu primer producto para comenzar a vender</p>
              <Button onClick={handleAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Producto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className={`overflow-hidden ${!product.available ? "opacity-70" : ""}`}>
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    <div className="h-16 w-16 rounded-md overflow-hidden bg-muted mr-4 flex-shrink-0">
                      {product.imageUrl && !imageError[product.id] ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                            onError={() => handleImageError(product.id)}
                            sizes="64px"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-muted">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{product.name}</h3>
                        {product.featured && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Destacado
                          </Badge>
                        )}
                        {!product.available && (
                          <Badge variant="outline" className="text-muted-foreground">
                            No disponible
                          </Badge>
                        )}
                      </div>
                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm font-medium">${product.price.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">{getCategoryName(product.categoryId)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center gap-1 mr-2">
                        <span className="text-xs text-muted-foreground">Disponible</span>
                        <Switch
                          checked={product.available}
                          onCheckedChange={() => toggleProductAvailability(product.id, product.available)}
                        />
                      </div>
                      <div className="flex flex-col items-center gap-1 mr-2">
                        <span className="text-xs text-muted-foreground">Destacado</span>
                        <Switch
                          checked={product.featured}
                          onCheckedChange={() => toggleProductFeatured(product.id, product.featured)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditProduct(product.id)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpandProduct(product.id)}
                        className="h-8 w-8"
                      >
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            expandedProduct === product.id ? "rotate-90" : ""
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                  {expandedProduct === product.id && (
                    <div className="border-t p-4 bg-muted/30">
                      <ProductExtrasManager productId={product.id} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        {(isAddingProduct || editingProduct) && (
          <ProductForm
            productId={editingProduct}
            onCancel={() => {
              setIsAddingProduct(false)
              setEditingProduct(null)
            }}
          />
        )}
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteProduct}
        title="Eliminar producto"
        description="¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer."
      />
    </div>
  )
}
