"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBranch } from "@/lib/context/branch-context"
import { getCategories, deleteCategory, type Category } from "@/lib/services/category-service"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Edit, Trash, FolderOpen, ImageIcon, Search, Layers } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PageContainer } from "@/components/page-container"

export default function CategoriesPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const { currentBranch } = useBranch()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function loadCategories() {
      if (!currentBranch) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
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

  // Filtrar categorías por término de búsqueda
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Función para contar subcategorías
  const countSubcategories = (category: Category): number => {
    if (!category.subcategories) return 0
    return Object.keys(category.subcategories).length
  }

  return (
    <PageContainer variant="wide">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
          <Button onClick={() => router.push(`/admin/categories/new`)}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
          </Button>
        </div>

        <NoBranchSelectedAlert />

        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar categorías..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-40 bg-muted">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardHeader className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardFooter className="p-4 flex justify-between">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-9" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : currentBranch ? (
          filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCategories.map((category) => {
                const subcategoriesCount = countSubcategories(category)
                return (
                  <Card key={category.id} className="overflow-hidden flex flex-col">
                    <div className="h-40 bg-muted relative">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl || "/placeholder.svg"}
                          alt={category.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {subcategoriesCount > 0 && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full px-2 py-1 text-xs font-medium flex items-center">
                          <Layers className="h-3 w-3 mr-1" />
                          {subcategoriesCount}
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <Badge variant={category.isActive ? "default" : "outline"}>
                          {category.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {category.description || "Sin descripción"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 pt-0 pb-2 flex-grow">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Layers className="h-4 w-4 mr-1" />
                        {subcategoriesCount === 0
                          ? "Sin subcategorías"
                          : subcategoriesCount === 1
                            ? "1 subcategoría"
                            : `${subcategoriesCount} subcategorías`}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-2 flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto justify-center text-xs sm:text-sm"
                        onClick={() => router.push(`/admin/categories/${category.id}/subcategories`)}
                      >
                        <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
                        <span className="whitespace-nowrap">Subcategorías</span>
                      </Button>
                      <div className="flex space-x-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                        <Button
                          variant="outline"
                          size="icon"
                          className="flex-none justify-center"
                          onClick={() => router.push(`/admin/categories/${category.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="flex-none justify-center text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminarán la categoría, todas sus subcategorías y
                                la imagen asociada.
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
                )
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? "No se encontraron categorías que coincidan con la búsqueda."
                  : "No hay categorías creadas aún."}
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push(`/admin/categories/new`)}>
                  <Plus className="mr-2 h-4 w-4" /> Crear primera categoría
                </Button>
              )}
            </div>
          )
        ) : null}
      </div>
    </PageContainer>
  )
}
