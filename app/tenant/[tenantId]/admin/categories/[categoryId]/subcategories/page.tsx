"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Pencil, Trash2, ArrowLeft, ImageIcon, Search } from "lucide-react"
import {
  getCategory,
  getAllSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  type Category,
  type Subcategory,
  uploadImageToBlob,
  deleteImageFromBlob,
} from "@/lib/services/category-service"
import { useBranch } from "@/lib/hooks/use-branch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export default function SubcategoriesPage() {
  const router = useRouter()
  const { tenantId, categoryId } = useParams()
  const { selectedBranch } = useBranch()
  const [category, setCategory] = useState<Category | null>(null)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Estado para el formulario de subcategoría
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    order: 0,
    active: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (selectedBranch && categoryId) {
      loadCategory()
      loadSubcategories()
    }
  }, [selectedBranch, categoryId])

  const loadCategory = async () => {
    if (!selectedBranch) return

    try {
      const categoryData = await getCategory(tenantId as string, selectedBranch.id, categoryId as string)
      setCategory(categoryData)
    } catch (error) {
      console.error("Error al cargar categoría:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la categoría",
        variant: "destructive",
      })
    }
  }

  const loadSubcategories = async () => {
    if (!selectedBranch) return

    setLoading(true)
    try {
      const subcategoriesData = await getAllSubcategories(tenantId as string, selectedBranch.id, categoryId as string)
      setSubcategories(subcategoriesData)
    } catch (error) {
      console.error("Error al cargar subcategorías:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las subcategorías",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      order: 0,
      active: true,
    })
    setImageFile(null)
    setImagePreview(null)
    setEditingSubcategory(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory)
    setFormData({
      name: subcategory.name,
      description: subcategory.description || "",
      order: subcategory.order || 0,
      active: subcategory.active,
    })
    if (subcategory.imageUrl) {
      setImagePreview(subcategory.imageUrl)
    }
    setIsDialogOpen(true)
  }

  const handleSaveSubcategory = async () => {
    if (!selectedBranch) return

    setIsSaving(true)
    try {
      let imageUrl = editingSubcategory?.imageUrl || null

      // Si hay un nuevo archivo de imagen, súbelo
      if (imageFile) {
        // Si ya había una imagen, elimínala primero
        if (editingSubcategory?.imageUrl) {
          await deleteImageFromBlob(editingSubcategory.imageUrl)
        }

        // Sube la nueva imagen
        const path = `tenants/${tenantId}/branches/${selectedBranch.id}/subcategories/`
        imageUrl = await uploadImageToBlob(imageFile, path)
      }

      const subcategoryData = {
        ...formData,
        imageUrl,
      }

      if (editingSubcategory) {
        // Actualizar subcategoría existente
        await updateSubcategory(
          tenantId as string,
          selectedBranch.id,
          categoryId as string,
          editingSubcategory.id,
          subcategoryData,
        )
        toast({
          title: "Subcategoría actualizada",
          description: "La subcategoría ha sido actualizada correctamente",
        })
      } else {
        // Crear nueva subcategoría
        await createSubcategory(tenantId as string, selectedBranch.id, categoryId as string, subcategoryData)
        toast({
          title: "Subcategoría creada",
          description: "La subcategoría ha sido creada correctamente",
        })
      }

      setIsDialogOpen(false)
      resetForm()
      loadSubcategories()
    } catch (error) {
      console.error("Error al guardar subcategoría:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la subcategoría",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSubcategory = async (subcategoryId: string, imageUrl?: string) => {
    if (!selectedBranch) return

    if (confirm("¿Estás seguro de que deseas eliminar esta subcategoría? Esta acción no se puede deshacer.")) {
      try {
        await deleteSubcategory(tenantId as string, selectedBranch.id, categoryId as string, subcategoryId)

        // Si la subcategoría tiene una imagen, elimínala de Blob
        if (imageUrl) {
          await deleteImageFromBlob(imageUrl)
        }

        toast({
          title: "Subcategoría eliminada",
          description: "La subcategoría ha sido eliminada correctamente",
        })
        loadSubcategories()
      } catch (error) {
        console.error("Error al eliminar subcategoría:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar la subcategoría",
          variant: "destructive",
        })
      }
    }
  }

  const filteredSubcategories = subcategories.filter((subcategory) =>
    subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => router.push(`/admin/categories`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Categorías
        </Button>
        <div className="ml-4">
          <h1 className="text-2xl font-bold">Subcategorías de {category?.name || "Categoría"}</h1>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar subcategorías..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={openCreateDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nueva Subcategoría
        </Button>
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
      ) : filteredSubcategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSubcategories.map((subcategory) => (
            <Card key={subcategory.id} className="overflow-hidden">
              <div className="aspect-[4/3] relative bg-muted">
                {subcategory.imageUrl ? (
                  <img
                    src={subcategory.imageUrl || "/placeholder.svg"}
                    alt={subcategory.name}
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
                  <CardTitle className="text-lg">{subcategory.name}</CardTitle>
                  <Badge variant={subcategory.active ? "default" : "outline"}>
                    {subcategory.active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {subcategory.description || "Sin descripción"}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(subcategory)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteSubcategory(subcategory.id, subcategory.imageUrl)}
                >
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
              ? "No se encontraron subcategorías que coincidan con la búsqueda."
              : "No hay subcategorías creadas. Crea tu primera subcategoría haciendo clic en 'Nueva Subcategoría'."}
          </p>
        </div>
      )}

      {/* Diálogo para crear/editar subcategoría */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSubcategory ? "Editar Subcategoría" : "Nueva Subcategoría"}</DialogTitle>
            <DialogDescription>
              {editingSubcategory
                ? "Modifica los detalles de la subcategoría"
                : "Completa los detalles para crear una nueva subcategoría"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la subcategoría"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la subcategoría"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="active">Activo</Label>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Imagen</Label>
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <div className="mt-2 relative aspect-[4/3] bg-muted rounded-md overflow-hidden">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Vista previa"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview(null)
                      setImageFile(null)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSubcategory} disabled={!formData.name || isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
