"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, MoreVertical, Trash2, Star, StarOff, Eye, EyeOff } from "lucide-react"
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

  // Editar producto
  const handleEdit = (productId: string) => {
    router.push(`/tenant/${tenantId}/admin/products/${productId}`)
  }

  // Eliminar producto
  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      await deleteProduct(tenantId, branchId, productToDelete)
      setProducts(products.filter((p) => p.id !== productToDelete))
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

      setProducts(products.map((p) => (p.id === product.id ? updatedProduct : p)))

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

      setProducts(products.map((p) => (p.id === product.id ? updatedProduct : p)))

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
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
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

  // Renderizar tabla de productos
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Destacado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.imageUrl ? (
                  <div className="relative h-10 w-10 rounded-md overflow-hidden">
                    <Image
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Sin img</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                ${product.price.toFixed(2)}
                {product.discountPrice && (
                  <span className="ml-2 line-through text-muted-foreground text-xs">
                    ${product.discountPrice.toFixed(2)}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell>
                {product.isFeatured ? (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Destacado
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">No</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreVertical className="h-4 w-4" />
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
