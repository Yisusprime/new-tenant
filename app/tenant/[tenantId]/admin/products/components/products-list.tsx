"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreVertical, Trash2, Star, StarOff, Eye, EyeOff, Search, Filter } from "lucide-react"
import { type Product, getProducts, deleteProduct, updateProduct } from "@/lib/services/product-service"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Image from "next/image"

interface ProductsListProps {
  tenantId: string
  branchId: string
}

export function ProductsList({ tenantId, branchId }: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Cargar productos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const data = await getProducts(tenantId, branchId)
        setProducts(data)
        setFilteredProducts(data)
      } catch (error) {
        console.error("Error al cargar productos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (branchId) {
      loadProducts()
    }
  }, [tenantId, branchId, toast])

  // Filtrar productos cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = products.filter(
        (product) => product.name.toLowerCase().includes(query) || product.description?.toLowerCase().includes(query),
      )
      setFilteredProducts(filtered)
    }
  }, [searchQuery, products])

  // Editar producto
  const handleEdit = (productId: string) => {
    router.push(`/admin/products/${productId}`)
  }

  // Eliminar producto
  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      await deleteProduct(tenantId, branchId, productToDelete)
      setProducts(products.filter((p) => p.id !== productToDelete))
      setFilteredProducts(filteredProducts.filter((p) => p.id !== productToDelete))
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    } finally {
      setProductToDelete(null)
    }
  }

  // Cambiar estado de destacado
  const toggleFeatured = async (product: Product) => {
    try {
      const updatedProduct = await updateProduct(tenantId, branchId, product.id, { isFeatured: !product.isFeatured })

      const updatedProducts = products.map((p) => (p.id === product.id ? updatedProduct : p))
      setProducts(updatedProducts)
      setFilteredProducts(filteredProducts.map((p) => (p.id === product.id ? updatedProduct : p)))

      toast({
        title: updatedProduct.isFeatured ? "Producto destacado" : "Producto no destacado",
        description: `El producto ha sido ${updatedProduct.isFeatured ? "marcado como destacado" : "desmarcado como destacado"} correctamente`,
      })
    } catch (error) {
      console.error("Error al actualizar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del producto",
        variant: "destructive",
      })
    }
  }

  // Cambiar estado activo/inactivo
  const toggleActive = async (product: Product) => {
    try {
      const updatedProduct = await updateProduct(tenantId, branchId, product.id, { isActive: !product.isActive })

      const updatedProducts = products.map((p) => (p.id === product.id ? updatedProduct : p))
      setProducts(updatedProducts)
      setFilteredProducts(filteredProducts.map((p) => (p.id === product.id ? updatedProduct : p)))

      toast({
        title: updatedProduct.isActive ? "Producto activado" : "Producto desactivado",
        description: `El producto ha sido ${updatedProduct.isActive ? "activado" : "desactivado"} correctamente`,
      })
    } catch (error) {
      console.error("Error al actualizar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del producto",
        variant: "destructive",
      })
    }
  }

  // Renderizar esqueleto de carga
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[220px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // Si no hay productos
  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No hay productos disponibles. Crea tu primer producto.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Resultados de búsqueda */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          {filteredProducts.length === 0
            ? "No se encontraron productos"
            : `Mostrando ${filteredProducts.length} de ${products.length} productos`}
        </div>
      )}

      {/* Lista de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="relative h-40 w-full bg-muted">
              {product.imageUrl ? (
                <Image src={product.imageUrl || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-muted-foreground">Sin imagen</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {!product.isActive && (
                  <Badge variant="secondary" className="opacity-90">
                    Inactivo
                  </Badge>
                )}
                {product.isFeatured && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 opacity-90">
                    Destacado
                  </Badge>
                )}
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg truncate">{product.name}</h3>
              <div className="flex justify-between items-center mt-1">
                <div className="font-medium">
                  ${product.price.toFixed(2)}
                  {product.discountPrice && (
                    <span className="ml-2 line-through text-muted-foreground text-xs">
                      ${product.discountPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{product.categoryName || "Sin categoría"}</div>
              </div>
              {product.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
              )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Acciones</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(product.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleFeatured(product)}>
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
                  <DropdownMenuItem onClick={() => toggleActive(product)}>
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
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setProductToDelete(product.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
