"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Search, MoreVertical, Edit, Trash2, Star, StarOff, Eye, EyeOff, Filter } from "lucide-react"
import Image from "next/image"
import { type Product, deleteProduct, updateProduct } from "@/lib/services/product-service"
import { type Category, getCategories } from "@/lib/services/category-service"

interface ProductsListProps {
  tenantId: string
  branchId: string
  products: Product[]
  loading: boolean
  onRefresh: () => void
}

export function ProductsList({ tenantId, branchId, products, loading, onRefresh }: ProductsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [categories, setCategories] = useState<Record<string, Category>>({})
  const [loadingCategories, setLoadingCategories] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const categoriesData = await getCategories(tenantId, branchId)

        // Convertir el array de categorías a un objeto para facilitar la búsqueda
        const categoriesMap: Record<string, Category> = {}
        categoriesData.forEach((category) => {
          categoriesMap[category.id] = category
        })

        setCategories(categoriesMap)
      } catch (error) {
        console.error("Error al cargar categorías:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las categorías",
          variant: "destructive",
        })
      } finally {
        setLoadingCategories(false)
      }
    }

    if (branchId) {
      loadCategories()
    }
  }, [tenantId, branchId, toast])

  // Filtrar productos cuando cambia el término de búsqueda o los productos
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products)
      return
    }

    const lowerSearchTerm = searchTerm.toLowerCase()
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerSearchTerm) ||
        (product.description && product.description.toLowerCase().includes(lowerSearchTerm)),
    )

    setFilteredProducts(filtered)
  }, [searchTerm, products])

  // Manejar la eliminación de un producto
  const handleDelete = async (productId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return
    }

    try {
      await deleteProduct(tenantId, branchId, productId)
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente",
      })
      onRefresh()
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    }
  }

  // Manejar la activación/desactivación de un producto
  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct(tenantId, branchId, product.id, {
        ...product,
        isActive: !product.isActive,
      })
      toast({
        title: product.isActive ? "Producto desactivado" : "Producto activado",
        description: `El producto ha sido ${product.isActive ? "desactivado" : "activado"} correctamente`,
      })
      onRefresh()
    } catch (error) {
      console.error("Error al actualizar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      })
    }
  }

  // Manejar el destacado/no destacado de un producto
  const handleToggleFeatured = async (product: Product) => {
    try {
      await updateProduct(tenantId, branchId, product.id, {
        ...product,
        isFeatured: !product.isFeatured,
      })
      toast({
        title: product.isFeatured ? "Producto no destacado" : "Producto destacado",
        description: `El producto ha sido ${product.isFeatured ? "removido de destacados" : "marcado como destacado"} correctamente`,
      })
      onRefresh()
    } catch (error) {
      console.error("Error al actualizar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      })
    }
  }

  // Obtener el nombre de la categoría
  const getCategoryName = (categoryId: string): string => {
    if (loadingCategories) return "Cargando..."
    return categories[categoryId]?.name || "Sin categoría"
  }

  // Renderizar esqueletos de carga
  const renderSkeletons = () => {
    return Array.from({ length: 8 }).map((_, index) => (
      <Card key={index} className="overflow-hidden">
        <div className="aspect-square relative bg-muted">
          <Skeleton className="h-full w-full" />
        </div>
        <CardContent className="p-3">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <div className="flex justify-between items-center mt-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </CardContent>
      </Card>
    ))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" title="Filtrar">
            <Filter className="h-4 w-4" />
          </Button>
          <Button onClick={() => router.push(`/admin/products/create`)}>Nuevo Producto</Button>
        </div>
      </div>

      {searchTerm && (
        <p className="text-sm text-muted-foreground">
          {filteredProducts.length} resultado(s) encontrado(s) para "{searchTerm}"
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading || loadingCategories ? (
          renderSkeletons()
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">
              {searchTerm
                ? "No se encontraron productos que coincidan con la búsqueda."
                : "No hay productos disponibles."}
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden group">
              <div className="aspect-square relative bg-muted">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <span className="text-xs text-muted-foreground">Sin imagen</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push(`/admin/products/${product.id}`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(product)}>
                        {product.isActive ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Activar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleFeatured(product)}>
                        {product.isFeatured ? (
                          <>
                            <StarOff className="mr-2 h-4 w-4" />
                            Quitar destacado
                          </>
                        ) : (
                          <>
                            <Star className="mr-2 h-4 w-4" />
                            Destacar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(product.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardContent className="p-3">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm leading-tight line-clamp-1" title={product.name}>
                      {product.name}
                    </h3>
                    <div className="flex gap-1 flex-shrink-0">
                      {!product.isActive && (
                        <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                          Inactivo
                        </Badge>
                      )}
                      {product.isFeatured && (
                        <Badge className="bg-amber-500 text-xs px-1 py-0 h-5">
                          <Star className="h-3 w-3 mr-1" />
                          <span className="sr-only">Destacado</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">${product.price.toFixed(2)}</p>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                      {getCategoryName(product.categoryId)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
