"use client"

import { useState } from "react"
import Image from "next/image"
import { type Category, deleteCategory } from "@/lib/services/category-service"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Trash, Plus, Tag, Eye, EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CategoryListProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (categoryId: string, parentId?: string) => void
  onAddSubcategory?: (parentId: string) => void
  showSubcategoryButton: boolean
}

export function CategoryList({
  categories,
  onEdit,
  onDelete,
  onAddSubcategory,
  showSubcategoryButton,
}: CategoryListProps) {
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return

    try {
      setIsDeleting(true)
      await deleteCategory(deletingCategory.tenantId, deletingCategory.branchId, deletingCategory.id)

      onDelete(deletingCategory.id, deletingCategory.parentId)

      toast({
        title: "Categoría eliminada",
        description: `La categoría "${deletingCategory.name}" ha sido eliminada correctamente.`,
      })
    } catch (error: any) {
      toast({
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar la categoría.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setDeletingCategory(null)
    }
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay categorías disponibles</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="w-[100px]">Orden</TableHead>
            <TableHead className="w-[100px]">Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <div className="relative h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                  {category.image ? (
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full text-gray-400">
                      <Tag className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell className="max-w-[200px] truncate">{category.description || "—"}</TableCell>
              <TableCell>{category.order}</TableCell>
              <TableCell>
                {category.isActive ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Eye className="mr-1 h-3 w-3" /> Activa
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    <EyeOff className="mr-1 h-3 w-3" /> Inactiva
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="icon" onClick={() => onEdit(category)}>
                    <Pencil className="h-4 w-4" />
                  </Button>

                  {showSubcategoryButton && onAddSubcategory && (
                    <Button variant="outline" size="icon" onClick={() => onAddSubcategory(category.id)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteClick(category)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingCategory?.parentId
                ? `Esta acción eliminará la subcategoría "${deletingCategory?.name}".`
                : `Esta acción eliminará la categoría "${deletingCategory?.name}" y todas sus subcategorías asociadas.`}
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
