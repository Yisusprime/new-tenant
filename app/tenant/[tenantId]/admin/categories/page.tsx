"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Pencil, Trash2, FolderOpen, ImageIcon, Search } from "lucide-react"
import { getAllCategories, deleteCategory, type Category } from "@/lib/services/category-service"
import { useBranch } from "@/lib/hooks/use-branch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

export default function CategoriesPage() {
  const router = useRouter()
  const { tenantId } = useParams()
  const { selectedBranch } = useBranch()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (selectedBranch) {
      loadCategories()
    }
  }, [selectedBranch])

  const loadCategories = async () => {
    if (!selectedBranch) return

    setLoading(true)
    try {
      const categoriesData = await getAllCategories(tenantId as string, selectedBranch.id)
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

  const handleDeleteCategory = async (categoryId: string) => {
    if (!selectedBranch) return

    if (confirm("¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.")) {
      try {
        await deleteCategory(tenantId as string, selectedBranch.id, categoryId)
        toast({
          title: "Categoría eliminada",
          description: "La categoría ha sido eliminada correctamente",
        })
        loadCategories()
      } catch (error) {
        console.error("Error al eliminar categoría:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar la categoría",
          variant: "destructive",
        })
      }
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
        <Button onClick={() => router.push(`/admin/categories/new`)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nueva Categoría
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar categorías..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[4/3] bg-muted">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader className="p-4">
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <div className="aspect-[4/3] relative bg-muted">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl || "/placeholder.svg"}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardHeader className="p-4 pb-0">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <Badge variant={category.active ? "default" : "outline"}>
                    {category.active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description || "Sin descripción"}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/admin/categories/${category.id}`)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/categories/${category.id}/subcategories`)}
                  >
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No se encontraron categorías que coincidan con la búsqueda."
              : "No hay categorías creadas. Crea tu primera categoría haciendo clic en 'Nueva Categoría'."}
          </p>
        </div>
      )}
    </div>
  )
}
