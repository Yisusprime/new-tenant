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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Search, MoreVertical, Edit, Trash2, Star, StarOff, Eye, EyeOff, Filter } from "lucide-react"
import Image from "next/image"
import { type Product, deleteProduct, updateProduct, getProducts } from "@/lib/services/product-service"
import { type Category, getCategories } from "@/lib/services/category-service"

interface ProductsListProps {
  tenantId: string
  branchId: string
}

export function ProductsList({ tenantId, branchId }: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Record<string, Category>>({})
  const [loading, setLoading] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Cargar productos
  useEffect(() => {
    const loadProducts = async () => {
      if (!branchId) return

      try {
        setLoading(true)
        const data = await getProducts(tenantId, branchId)
        setProducts(data || [])
        setFilteredProducts(data || [])
      } catch (error) {
        console.error("Error al cargar productos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos",
          variant: "destructive",
        })
        // Asegurar que products y filteredProducts sean arrays vacíos en caso de error
        setProducts([])
        setFilteredProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [tenantId, branchId, toast])

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      if (!branchId) return

      try {
        setLoadingCategories(true)
        const categoriesData = await getCategories(tenantId, branchId)

        // Convertir el array de categorías a un objeto para facilitar la búsqueda
        const categoriesMap: Record<string, Category> = {}
        if (Array.isArray(categoriesData)) {
          categoriesData.forEach((category) => {
            if (category && category.id) {
              categoriesMap[category.id] = category
            }
          })
        }

        setCategories(categoriesMap)
      } catch (error) {
        console.error("Error al cargar categorías:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las categorías",
          variant: "destructive",
        })
        // Asegurar que categories sea un objeto vacío en caso de error
        setCategories({})
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [tenantId, branchId, toast])

  // Filtrar productos cuando cambia el término de búsqueda o los productos
  useEffect(() => {
    if (!searchTerm.trim() || !Array.isArray(products)) {
      setFilteredProducts(products || [])
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

  // Refrescar productos
  const refreshProducts = async () => {
    if (!branchId) return

    try {
      setLoading(true)
      const data = await getProducts(tenantId, branchId)
      setProducts(data || [])
      setFilteredProducts(data || [])
    } catch (error) {
      console.error("Error al refrescar productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron refrescar los productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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
      refreshProducts()
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
      refreshProducts()
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
      refreshProducts()
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
    if (!categoryId) return "Sin categoría"
    return categories[categoryId]?.name || "Sin categoría"
  }

  // Renderizar esqueletos de carga
  const renderSkeletons = () => {
    return Array.from({ length: 12 }).map((_, index) => (
      <Card key={index} className="overflow-hidden">
        <div className="h-32 relative bg-muted">
          <Skeleton className="h-full w-full" />
        </div>
        <CardContent className="p-3">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
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

      {searchTerm && Array.isArray(filteredProducts) && (
        <p className="text-sm text-muted-foreground">
          {filteredProducts.length} resultado(s) encontrado(s) para "{searchTerm}"
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {loading || loadingCategories ? (
          renderSkeletons()
        ) : !Array.isArray(filteredProducts) || filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">
              {searchTerm
                ? "No se encontraron productos que coincidan con la búsqueda."
                : "No hay productos disponibles."}
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden group h-full">
              <div className="h-32 relative bg-muted">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <span className="text-xs text-muted-foreground">Sin imagen</span>
                  </div>
                )}
                <div className="absolute top-1 right-1 flex gap-0.5">
                  {!product.isActive && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1 py-0 h-4 bg-background/90 backdrop-blur-sm border-red-200 text-red-600"
                    >
                      Inactivo
                    </Badge>
                  )}
                  {product.isFeatured && (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] px-1 py-0 h-4">
                      <Star className="h-2.5 w-2.5 mr-0.5" />
                      Destacado
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-6 w-6 bg-background/80 backdrop-blur-sm">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm leading-tight line-clamp-1" title={product.name}>
                    {product.name}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <p className="text-sm font-medium">${product.price.toFixed(2)}</p>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5 w-fit">
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
