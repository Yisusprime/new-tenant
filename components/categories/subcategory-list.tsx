"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, ImageIcon } from "lucide-react"
import { useCategories, type Subcategory } from "./category-context"
import { SubcategoryForm } from "./subcategory-form"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import Image from "next/image"

interface SubcategoryListProps {
  categoryId: string
}

export function SubcategoryList({ categoryId }: SubcategoryListProps) {
  const { categories, deleteSubcategory } = useCategories()
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<string | null>(null)
  const [imageError, setImageError] = useState<Record<string, boolean>>({})

  const category = categories.find((c) => c.id === categoryId)
  const subcategories: Subcategory[] = category?.subcategories
    ? Object.keys(category.subcategories).map((key) => ({
        id: key,
        ...category.subcategories[key],
      }))
    : []

  const handleAddSubcategory = () => {
    setIsAddingSubcategory(true)
    setEditingSubcategory(null)
  }

  const handleEditSubcategory = (subcategoryId: string) => {
    setEditingSubcategory(subcategoryId)
    setIsAddingSubcategory(false)
  }

  const handleDeleteSubcategory = (subcategoryId: string) => {
    setSubcategoryToDelete(subcategoryId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteSubcategory = async () => {
    if (subcategoryToDelete) {
      await deleteSubcategory(categoryId, subcategoryToDelete)
      setSubcategoryToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleImageError = (subcategoryId: string) => {
    setImageError((prev) => ({ ...prev, [subcategoryId]: true }))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Subcategorías</h3>
        <Button size="sm" onClick={handleAddSubcategory}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir Subcategoría
        </Button>
      </div>

      {subcategories.length === 0 ? (
        <div className="text-center p-4 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground">No hay subcategorías</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subcategories.map((subcategory) => (
            <Card key={subcategory.id} className="overflow-hidden">
              <CardContent className="p-3 flex items-center">
                <div className="h-10 w-10 rounded-md overflow-hidden bg-muted mr-3 flex-shrink-0">
                  {subcategory.imageUrl && !imageError[subcategory.id] ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={subcategory.imageUrl || "/placeholder.svg"}
                        alt={subcategory.name}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(subcategory.id)}
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-muted">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{subcategory.name}</h4>
                  {subcategory.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{subcategory.description}</p>
                  )}
                  {subcategory.imageUrl && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      <span className="font-medium">URL:</span> {subcategory.imageUrl}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditSubcategory(subcategory.id)}
                    className="h-7 w-7"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSubcategory(subcategory.id)}
                    className="h-7 w-7 text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(isAddingSubcategory || editingSubcategory) && (
        <div className="mt-4">
          <SubcategoryForm
            categoryId={categoryId}
            subcategoryId={editingSubcategory}
            onCancel={() => {
              setIsAddingSubcategory(false)
              setEditingSubcategory(null)
            }}
          />
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteSubcategory}
        title="Eliminar subcategoría"
        description="¿Estás seguro de que quieres eliminar esta subcategoría? Esta acción no se puede deshacer."
      />
    </div>
  )
}
