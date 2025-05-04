"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, ChevronRight, ImageIcon, Loader2 } from "lucide-react"
import { useCategories } from "./category-context"
import { CategoryForm } from "./category-form"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import { SubcategoryList } from "./subcategory-list"
import Image from "next/image"

export function CategoryList() {
  const { categories, loading, deleteCategory, setSelectedCategory } = useCategories()
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [imageError, setImageError] = useState<Record<string, boolean>>({})

  const handleAddCategory = () => {
    setIsAddingCategory(true)
    setEditingCategory(null)
  }

  const handleEditCategory = (categoryId: string) => {
    setEditingCategory(categoryId)
    setIsAddingCategory(false)
  }

  const handleDeleteCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteCategory = async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete)
      setCategoryToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const toggleExpandCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null)
    } else {
      setExpandedCategory(categoryId)
      const category = categories.find((c) => c.id === categoryId)
      if (category) {
        setSelectedCategory(category)
      }
    }
  }

  const handleImageError = (categoryId: string) => {
    setImageError((prev) => ({ ...prev, [categoryId]: true }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando categorías...</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Lista de Categorías</h2>
          <Button onClick={handleAddCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Categoría
          </Button>
        </div>

        {categories.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay categorías</h3>
              <p className="text-muted-foreground mb-4">Añade tu primera categoría para organizar tu menú</p>
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Categoría
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <Card key={category.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-muted mr-4 flex-shrink-0">
                      {category.imageUrl && !imageError[category.id] ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={category.imageUrl || "/placeholder.svg"}
                            alt={category.name}
                            fill
                            className="object-cover"
                            onError={() => handleImageError(category.id)}
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-muted">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{category.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCategory(category.id)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpandCategory(category.id)}
                        className="h-8 w-8"
                      >
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            expandedCategory === category.id ? "rotate-90" : ""
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                  {expandedCategory === category.id && (
                    <div className="border-t p-4 bg-muted/30">
                      <SubcategoryList categoryId={category.id} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        {(isAddingCategory || editingCategory) && (
          <CategoryForm
            categoryId={editingCategory}
            onCancel={() => {
              setIsAddingCategory(false)
              setEditingCategory(null)
            }}
          />
        )}
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteCategory}
        title="Eliminar categoría"
        description="¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer y también eliminará todas las subcategorías asociadas."
      />
    </div>
  )
}
