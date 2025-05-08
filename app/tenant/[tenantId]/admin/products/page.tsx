"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus } from "lucide-react"

export default function ProductsPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productsQuery = query(collection(db, `tenants/${tenantId}/products`), orderBy("name"))
        const snapshot = await getDocs(productsQuery)

        const productsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setProducts(productsList)
      } catch (error) {
        console.error("Error al cargar productos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [tenantId])

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await deleteDoc(doc(db, `tenants/${tenantId}/products`, productId))
        setProducts(products.filter((product) => product.id !== productId))
      } catch (error) {
        console.error("Error al eliminar producto:", error)
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button asChild>
          <a href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>Gestiona los productos de tu menú</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Cargando productos...</p>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No hay productos disponibles</p>
              <Button asChild>
                <a href="/admin/products/new">Añadir Primer Producto</a>
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
                          <a href={`/admin/products/${product.id}`}>
                            <Pencil className="h-4 w-4" />
                          </a>
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
