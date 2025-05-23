"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreVertical, Trash2, Search, Filter, Plus } from "lucide-react"
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
import { ExtraPackages } from "./extra-packages"
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
  const loadExtras = async () => {
    try {
      setLoading(true)
      const data = await getProductExtras(tenantId, branchId)
      setExtras(data || [])
      setFilteredExtras(data || [])
    } catch (error) {
      console.error("Error al cargar extras:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los extras",
        variant: "destructive",
      })
      setExtras([])
      setFilteredExtras([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (branchId) {
      loadExtras()
    }
  }, [tenantId, branchId, toast])

  // Filtrar extras cuando cambia la búsqueda
  useEffect(() => {
    if (!searchQuery.trim() || !Array.isArray(extras)) {
      setFilteredExtras(extras || [])
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = extras.filter(
      (extra) => extra.name.toLowerCase().includes(query) || extra.description?.toLowerCase().includes(query),
    )
    setFilteredExtras(filtered)
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

  // Renderizar esqueletos de carga
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-[140px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // Si no hay extras
  if (!Array.isArray(extras) || extras.length === 0) {
    return (
      <div className="text-center py-10 space-y-4">
        <p className="text-muted-foreground">No hay extras disponibles. Crea tu primer extra global.</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={() => router.push(`/admin/products/extras/create`)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Extra
          </Button>
          <ExtraPackages tenantId={tenantId} branchId={branchId} onComplete={loadExtras} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Buscador y botones */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar extras..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="icon" title="Filtrar">
            <Filter className="h-4 w-4" />
          </Button>
          <ExtraPackages tenantId={tenantId} branchId={branchId} onComplete={loadExtras} />
          <Button onClick={() => router.push(`/admin/products/extras/create`)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Extra
          </Button>
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {searchQuery && Array.isArray(filteredExtras) && (
        <div className="text-sm text-muted-foreground">
          {filteredExtras.length === 0
            ? "No se encontraron extras"
            : `Mostrando ${filteredExtras.length} de ${extras.length} extras`}
        </div>
      )}

      {/* Lista de extras en cuadrícula */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(filteredExtras) &&
          filteredExtras.map((extra) => (
            <Card key={extra.id} className="overflow-hidden h-full">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {extra.imageUrl && (
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <Image
                          src={extra.imageUrl || "/placeholder.svg"}
                          alt={extra.name}
                          fill
                          className="object-contain"
                          sizes="40px"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{extra.name}</h3>
                      {extra.description && <p className="text-sm text-muted-foreground">{extra.description}</p>}
                      <Badge className="mt-2">${extra.price.toFixed(2)}</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/admin/products/extras/${extra.id}`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setExtraToDelete(extra.id)}
                        className="text-destructive focus:text-destructive"
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
