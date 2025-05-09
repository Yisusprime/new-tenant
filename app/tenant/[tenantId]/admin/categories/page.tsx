"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBranch } from "@/lib/context/branch-context"
import { getCategories, deleteCategory, type Category } from "@/lib/services/category-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Edit, Trash, Folder, ImageIcon } from "lucide-react"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function CategoriesPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const { currentBranch } = useBranch()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function loadCategories() {
      if (!currentBranch) {
        setLoading(false)
        return
      }

      try {
        const categoriesData = await getCategories(tenantId, currentBranch.id)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error al cargar categorías:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las categorías",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [tenantId, currentBranch, toast])

  const handleDeleteCategory = async (categoryId: string) => {
    if (!currentBranch) return

    try {
      setDeleting(categoryId)
      await deleteCategory(tenantId, currentBranch.id, categoryId)

      // Actualizar la lista de categorías
      setCategories((prev) => prev.filter((category) => category.id !== categoryId))

      toast({
        title: "Categoría eliminada",
        description: "La categoría se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar categoría:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={() => router.push(`/admin/categories/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
        </Button>
      </div>

      <NoBranchSelectedAlert />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : currentBranch ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length === 0 ? (
            <div className="col-span-full py-8 text-center">
              <p className="text-gray-500">No hay categorías creadas aún.</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push(`/admin/categories/new`)}>
                <Plus className="mr-2 h-4 w-4" /> Crear primera categoría
              </Button>
            </div>
          ) : (
            categories.map((category) => (
              <Card key={category.id} className="overflow-hidden">
                <div className="relative h-40 bg-gray-100">
                  {category.imageUrl ? (
                    <div className="relative w-full h-full">
                      <img
                        src={category.imageUrl || "/placeholder.svg"}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{category.name}</span>
                    {!category.isActive && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Inactiva</span>
                    )}
                  </CardTitle>
                  <CardDescription>{category.description || "Sin descripción"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <span className="font-medium">Orden:</span> {category.order}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-medium">Subcategorías:</span>{" "}
                    {category.subcategories ? Object.keys(category.subcategories).length : 0}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/categories/${category.id}/subcategories`)}
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    Subcategorías
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => router.push(`/admin/categories/${category.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminarán la categoría, todas sus subcategorías y la
                            imagen asociada.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCategory(category.id)}
                            className="bg-red-500 hover:bg-red-600"
                            disabled={deleting === category.id}
                          >
                            {deleting === category.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Eliminando...
                              </>
                            ) : (
                              "Eliminar"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
