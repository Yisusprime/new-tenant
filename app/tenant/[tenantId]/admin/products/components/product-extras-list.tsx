"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, MoreVertical, Trash2, Eye, EyeOff } from "lucide-react"
import {
  type ProductExtra,
  getProductExtras,
  deleteProductExtra,
  updateProductExtra,
} from "@/lib/services/product-service"
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

interface ProductExtrasListProps {
  tenantId: string
  branchId: string
}

export function ProductExtrasList({ tenantId, branchId }: ProductExtrasListProps) {
  const [extras, setExtras] = useState<ProductExtra[]>([])
  const [loading, setLoading] = useState(true)
  const [extraToDelete, setExtraToDelete] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Cargar extras
  useEffect(() => {
    const loadExtras = async () => {
      try {
        setLoading(true)
        const data = await getProductExtras(tenantId, branchId)
        setExtras(data)
      } catch (error) {
        console.error("Error al cargar extras:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los extras",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (branchId) {
      loadExtras()
    }
  }, [tenantId, branchId, toast])

  // Editar extra
  const handleEdit = (extraId: string) => {
    router.push(`/tenant/${tenantId}/admin/products/extras/${extraId}`)
  }

  // Eliminar extra
  const handleDelete = async () => {
    if (!extraToDelete) return

    try {
      await deleteProductExtra(tenantId, branchId, extraToDelete)
      setExtras(extras.filter((e) => e.id !== extraToDelete))
      toast({
        title: "Extra eliminado",
        description: "El extra ha sido eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar extra:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el extra",
        variant: "destructive",
      })
    } finally {
      setExtraToDelete(null)
    }
  }

  // Cambiar estado activo/inactivo
  const toggleActive = async (extra: ProductExtra) => {
    try {
      const updatedExtra = await updateProductExtra(tenantId, branchId, extra.id, { isActive: !extra.isActive })

      setExtras(extras.map((e) => (e.id === extra.id ? updatedExtra : e)))

      toast({
        title: updatedExtra.isActive ? "Extra activado" : "Extra desactivado",
        description: `El extra ha sido ${updatedExtra.isActive ? "activado" : "desactivado"} correctamente`,
      })
    } catch (error) {
      console.error("Error al actualizar extra:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del extra",
        variant: "destructive",
      })
    }
  }

  // Renderizar esqueleto de carga
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Si no hay extras
  if (extras.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No hay extras disponibles. Crea tu primer extra global.</p>
      </div>
    )
  }

  // Renderizar tabla de extras
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {extras.map((extra) => (
            <TableRow key={extra.id}>
              <TableCell className="font-medium">{extra.name}</TableCell>
              <TableCell>${extra.price.toFixed(2)}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {extra.description || <span className="text-muted-foreground text-sm">Sin descripción</span>}
              </TableCell>
              <TableCell>
                <Badge variant={extra.isActive ? "default" : "secondary"}>
                  {extra.isActive ? "Activo" : "Inactivo"}
                </Badge>
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
                    <DropdownMenuItem onClick={() => handleEdit(extra.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleActive(extra)}>
                      {extra.isActive ? (
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
                      onClick={() => setExtraToDelete(extra.id)}
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

      <AlertDialog open={!!extraToDelete} onOpenChange={(open) => !open && setExtraToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El extra será eliminado permanentemente.
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
