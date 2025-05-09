"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreVertical, Trash2, Eye, EyeOff, Search, Filter } from "lucide-react"
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
import Image from "next/image"

interface ProductExtrasListProps {
  tenantId: string
  branchId: string
}

export function ProductExtrasList({ tenantId, branchId }: ProductExtrasListProps) {
  const [extras, setExtras] = useState<ProductExtra[]>([])
  const [filteredExtras, setFilteredExtras] = useState<ProductExtra[]>([])
  const [searchQuery, setSearchQuery] = useState("")
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
        setFilteredExtras(data)
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

  // Filtrar extras cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredExtras(extras)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = extras.filter(
        (extra) => extra.name.toLowerCase().includes(query) || extra.description?.toLowerCase().includes(query),
      )
      setFilteredExtras(filtered)
    }
  }, [searchQuery, extras])

  // Editar extra
  const handleEdit = (extraId: string) => {
    router.push(`/admin/products/extras/${extraId}`)
  }

  // Eliminar extra
  const handleDelete = async () => {
    if (!extraToDelete) return

    try {
      await deleteProductExtra(tenantId, branchId, extraToDelete)
      setExtras(extras.filter((e) => e.id !== extraToDelete))
      setFilteredExtras(filteredExtras.filter((e) => e.id !== extraToDelete))
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
      const updatedExtra = await updateProductExtra(tenantId, branchId, extra.id, {
        isActive: !extra.isActive,
      })

      const updatedExtras = extras.map((e) => (e.id === extra.id ? updatedExtra : e))
      setExtras(updatedExtras)
      setFilteredExtras(filteredExtras.map((e) => (e.id === extra.id ? updatedExtra : e)))

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
        <div className="flex items-center space-x-2 mb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-lg" />
          ))}
        </div>
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

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar extras..."
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
          {filteredExtras.length === 0
            ? "No se encontraron extras"
            : `Mostrando ${filteredExtras.length} de ${extras.length} extras`}
        </div>
      )}

      {/* Lista de extras */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filteredExtras.map((extra) => (
          <Card key={extra.id} className="overflow-hidden h-full">
            <div className="relative aspect-square bg-muted">
              {extra.imageUrl ? (
                <Image
                  src={extra.imageUrl || "/placeholder.svg"}
                  alt={extra.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-muted-foreground text-xs">Sin imagen</span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant={extra.isActive ? "default" : "secondary"} className="text-xs">
                  {extra.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
            <CardContent className="p-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate" title={extra.name}>
                    {extra.name}
                  </h3>
                  <p className="text-sm font-semibold">${extra.price.toFixed(2)}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Acciones</span>
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diálogo de confirmación para eliminar */}
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
