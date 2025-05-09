"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useBranch } from "@/lib/context/branch-context"
import { getProduct, getProductExtras, deleteProductExtra, type ProductExtra } from "@/lib/services/product-service"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Plus, Edit, Trash2, Check, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductExtrasPage({
  params,
}: {
  params: { tenantId: string; productId: string }
}) {
  const router = useRouter()
  const { currentBranch } = useBranch()

  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<any>(null)
  const [extras, setExtras] = useState<ProductExtra[]>([])
  const [extraToDelete, setExtraToDelete] = useState<ProductExtra | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (currentBranch) {
      loadData()
    }
  }, [currentBranch])

  const loadData = async () => {
    if (!currentBranch) return

    setLoading(true)
    try {
      const [productData, extrasData] = await Promise.all([
        getProduct(params.tenantId, currentBranch.id, params.productId),
        getProductExtras(params.tenantId, currentBranch.id, params.productId),
      ])

      if (productData) {
        setProduct(productData)
        setExtras(extrasData)
      } else {
        toast({
          title: "Error",
          description: "Producto no encontrado",
          variant: "destructive",
        })
        router.push(`/tenant/${params.tenantId}/admin/products`)
      }
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExtra = async () => {
    if (!extraToDelete || !currentBranch) return

    setIsDeleting(true)
    try {
      await deleteProductExtra(params.tenantId, currentBranch.id, params.productId, extraToDelete.id)
      setExtras(extras.filter((e) => e.id !== extraToDelete.id))
      toast({
        title: "Extra eliminado",
        description: "El extra ha sido eliminado correctamente",
      })
      setExtraToDelete(null)
    } catch (error) {
      console.error("Error al eliminar extra:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el extra",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const navigateToExtraForm = (extraId?: string) => {
    if (extraId) {
      router.push(`/tenant/${params.tenantId}/admin/products/${params.productId}/extras/${extraId}`)
    } else {
      router.push(`/tenant/${params.tenantId}/admin/products/${params.productId}/extras/new`)
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/tenant/${params.tenantId}/admin/products`)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Productos
        </Button>
        <h1 className="text-2xl font-bold">Extras del Producto</h1>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{product?.name}</CardTitle>
              <CardDescription>{product?.description || "Sin descripción"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">${product?.price.toFixed(2)}</p>
                  {product?.discountPrice && (
                    <p className="text-sm text-gray-500 line-through">${product?.discountPrice.toFixed(2)}</p>
                  )}
                </div>
                <Button onClick={() => navigateToExtraForm()} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Extra
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Extras y Opciones</CardTitle>
              <CardDescription>Gestiona los extras y opciones adicionales para este producto</CardDescription>
            </CardHeader>
            <CardContent>
              {extras.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No hay extras registrados para este producto</p>
                  <Button onClick={() => navigateToExtraForm()}>Crear Primer Extra</Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Opciones</TableHead>
                      <TableHead>Requerido</TableHead>
                      <TableHead>Múltiple</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extras.map((extra) => (
                      <TableRow key={extra.id}>
                        <TableCell className="font-medium">
                          {extra.name}
                          {extra.description && <p className="text-sm text-gray-500">{extra.description}</p>}
                        </TableCell>
                        <TableCell>
                          <Badge>{extra.options.length} opciones</Badge>
                        </TableCell>
                        <TableCell>
                          {extra.isRequired ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          {extra.multipleSelection ? (
                            <div className="flex items-center">
                              <Check className="h-5 w-5 text-green-500 mr-1" />
                              {extra.maxSelections ? (
                                <span className="text-sm text-gray-500">(máx. {extra.maxSelections})</span>
                              ) : null}
                            </div>
                          ) : (
                            <X className="h-5 w-5 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={extra.active ? "default" : "secondary"}>
                            {extra.active ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="icon" onClick={() => navigateToExtraForm(extra.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setExtraToDelete(extra)}
                              className="text-red-500 hover:text-red-700"
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
        </>
      )}

      {/* Diálogo de confirmación para eliminar extra */}
      <Dialog open={!!extraToDelete} onOpenChange={(open) => !open && setExtraToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el extra "{extraToDelete?.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtraToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteExtra} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
