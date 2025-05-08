"use client"

import { useEffect, useState } from "react"
import { useBranch } from "@/lib/context/branch-context"
import { getProducts, deleteProduct } from "@/lib/services/product-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ProductsPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const { currentBranch } = useBranch()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const productsList = await getProducts(tenantId, currentBranch?.id)
        setProducts(productsList)
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

    if (currentBranch) {
      fetchProducts()
    }
  }, [tenantId, currentBranch, toast])

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await deleteProduct(tenantId, productId)
        setProducts(products.filter((product) => product.id !== productId))
        toast({
          title: "Producto eliminado",
          description: "El producto se ha eliminado correctamente",
        })
      } catch (error) {
        console.error("Error al eliminar producto:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
          </Link>
        </Button>
      </div>

      {!currentBranch && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Debes seleccionar una sucursal para gestionar los productos</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>
            {currentBranch
              ? `Productos de la sucursal: ${currentBranch.name}`
              : "Selecciona una sucursal para ver sus productos"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!currentBranch ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Selecciona una sucursal para ver sus productos</p>
            </div>
          ) : loading ? (
            <p className="text-center py-4">Cargando productos...</p>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No hay productos disponibles en esta sucursal</p>
              <Button asChild>
                <Link href="/admin/products/new">Añadir Primer Producto</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Disponible</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>${product.price?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>{product.category || "Sin categoría"}</TableCell>
                    <TableCell>{product.available ? "Sí" : "No"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/admin/products/${product.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
