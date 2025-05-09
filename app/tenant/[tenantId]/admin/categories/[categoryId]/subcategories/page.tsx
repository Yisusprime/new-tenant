"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useBranch } from "@/lib/context/branch-context"
import {
  getCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  uploadImageToBlob,
  deleteImageFromBlob,
  type Category,
  type Subcategory,
} from "@/lib/services/category-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { Loader2, Plus, Pencil, Trash, ArrowLeft, Save, Eye, EyeOff, ImageIcon, X } from "lucide-react"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"

export default function SubcategoriesPage({
  params,
}: {
  params: { tenantId: string; categoryId: string }
}) {
  const { tenantId, categoryId } = params
  const { currentBranch } = useBranch()
  const [category, setCategory] = useState<Category | null>(null)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [formData, setFormData] = useState<Partial<Subcategory>>({
    name: "",
    description: "",
    order: 0,
    isActive: true,
    imageUrl: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function loadCategory() {
      if (!currentBranch) {
        setCategory(null)
        setSubcategories([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const categoryData = await getCategory(tenantId, currentBranch.id, categoryId)

        if (categoryData) {
          setCategory(categoryData)

          // Convertir subcategorías de objeto a array si existen
          if (categoryData.subcategories) {
            const subcategoriesArray = Array.isArray(categoryData.subcategories)
              ? categoryData.subcategories
              : Object.values(categoryData.subcategories)

            setSubcategories(subcategoriesArray)
          } else {
            setSubcategories([])
          }
        } else {
          toast({
            title: "Error",
            description: "No se encontró la categoría",
            variant: "destructive",
          })
          router.push(`/tenant/${tenantId}/admin/categories`)
        }
      } catch (error) {
        console.error("Error al cargar categoría:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la categoría",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadCategory()
  }, [tenantId, categoryId, currentBranch, toast, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) || 0 }))
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

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleOpenDialog = (subcategory?: Subcategory) => {
    if (subcategory) {
      setEditingSubcategory(subcategory)
      setFormData({
        name: subcategory.name,
        description: subcategory.description || "",
        order: subcategory.order,
        isActive: subcategory.isActive,
        imageUrl: subcategory.imageUrl || "",
      })
      setImagePreview(subcategory.imageUrl || null)
    } else {
      setEditingSubcategory(null)
      setFormData({
        name: "",
        description: "",
        order: subcategories.length,
        isActive: true,
        imageUrl: "",
      })
      setImagePreview(null)
    }
    setImageFile(null)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingSubcategory(null)
    setFormData({
      name: "",
      description: "",
      order: 0,
      isActive: true,
      imageUrl: "",
    })
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentBranch || !category) {
      toast({
        title: "Error",
        description: "Debes seleccionar una sucursal primero",
        variant: "destructive",
      })
      return
    }

    if (!formData.name) {
      toast({
        title: "Error",
        description: "El nombre de la subcategoría es obligatorio",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      let imageUrl = formData.imageUrl || ""

      // Si hay un nuevo archivo de imagen, subirlo
      if (imageFile) {
        const blobPath = `tenants/${tenantId}/branches/${currentBranch.id}/categories/${categoryId}/subcategories/${
          editingSubcategory?.id || "new"
        }-${Date.now()}.${imageFile.name.split(".").pop()}`

        imageUrl = await uploadImageToBlob(imageFile, blobPath)
      }

      if (editingSubcategory) {
        // Si estamos editando y hay una nueva imagen, eliminar la anterior
        if (imageFile && editingSubcategory.imageUrl) {
          try {
            await deleteImageFromBlob(editingSubcategory.imageUrl)
          } catch (error) {
            console.error("Error al eliminar imagen anterior:", error)
            // Continuar aunque falle la eliminación
          }
        }

        // Actualizar subcategoría existente
        const updatedSubcategory = await updateSubcategory(
          tenantId,
          currentBranch.id,
          categoryId,
          editingSubcategory.id,
          {
            name: formData.name,
            description: formData.description,
            order: formData.order,
            isActive: formData.isActive,
            imageUrl: imageUrl,
          },
        )

        // Actualizar la lista de subcategorías
        setSubcategories(subcategories.map((sub) => (sub.id === updatedSubcategory.id ? updatedSubcategory : sub)))

        toast({
          title: "Subcategoría actualizada",
          description: "La subcategoría se ha actualizado correctamente",
        })
      } else {
        // Crear nueva subcategoría
        const newSubcategory = await createSubcategory(tenantId, currentBranch.id, categoryId, {
          name: formData.name!,
          description: formData.description,
          order: formData.order || 0,
          isActive: formData.isActive !== false,
          imageUrl: imageUrl,
        })

        // Añadir a la lista de subcategorías
        setSubcategories([...subcategories, newSubcategory])

        toast({
          title: "Subcategoría creada",
          description: "La subcategoría se ha creado correctamente",
        })
      }

      handleCloseDialog()
    } catch (error) {
      console.error("Error al guardar subcategoría:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la subcategoría",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const confirmDeleteSubcategory = (subcategory: Subcategory) => {
    setSubcategoryToDelete(subcategory)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSubcategory = async () => {
    if (!currentBranch || !subcategoryToDelete) return

    try {
      // Si la subcategoría tiene imagen, eliminarla
      if (subcategoryToDelete.imageUrl) {
        try {
          await deleteImageFromBlob(subcategoryToDelete.imageUrl)
        } catch (error) {
          console.error("Error al eliminar imagen:", error)
          // Continuar aunque falle la eliminación de la imagen
        }
      }

      await deleteSubcategory(tenantId, currentBranch.id, categoryId, subcategoryToDelete.id)

      // Actualizar la lista de subcategorías
      setSubcategories(subcategories.filter((sub) => sub.id !== subcategoryToDelete.id))

      toast({
        title: "Subcategoría eliminada",
        description: "La subcategoría se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar subcategoría:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la subcategoría",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setSubcategoryToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Subcategorías</h1>
          {category && <p className="text-gray-500">Categoría: {category.name}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/tenant/${tenantId}/admin/categories`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Categorías
          </Button>
          <Button onClick={() => handleOpenDialog()} disabled={!currentBranch || !category}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Subcategoría
          </Button>
        </div>
      </div>

      <NoBranchSelectedAlert />

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Subcategorías</CardTitle>
          <CardDescription>
            Administra las subcategorías para {category ? `"${category.name}"` : "esta categoría"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : subcategories.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No hay subcategorías configuradas</p>
              <Button onClick={() => handleOpenDialog()} disabled={!currentBranch || !category}>
                Crear Primera Subcategoría
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subcategories.map((subcategory) => (
                  <TableRow key={subcategory.id}>
                    <TableCell>
                      {subcategory.imageUrl ? (
                        <div className="relative h-10 w-10 rounded overflow-hidden">
                          <img
                            src={subcategory.imageUrl || "/placeholder.svg"}
                            alt={subcategory.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 flex items-center justify-center rounded">
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{subcategory.name}</TableCell>
                    <TableCell>{subcategory.description || "-"}</TableCell>
                    <TableCell>
                      {subcategory.isActive ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          <Eye className="h-3 w-3 mr-1" /> Activa
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          <EyeOff className="h-3 w-3 mr-1" /> Inactiva
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{subcategory.order}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleOpenDialog(subcategory)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => confirmDeleteSubcategory(subcategory)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para crear/editar subcategoría */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSubcategory ? "Editar Subcategoría" : "Nueva Subcategoría"}</DialogTitle>
            <DialogDescription>
              {editingSubcategory
                ? "Actualiza la información de la subcategoría"
                : "Completa el formulario para crear una nueva subcategoría"}
            </DialogDescription>
          </DialogHeader>
          <form id="subcategory-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Subcategoría *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="Ej: Con queso, Vegetarianas, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Descripción breve de la subcategoría"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Imagen</Label>
              <div className="mt-1 flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative h-24 w-24 rounded-md overflow-hidden border border-gray-200">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Vista previa"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="image"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    {imagePreview ? "Cambiar imagen" : "Subir imagen"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">Formatos recomendados: JPG, PNG. Máximo 2MB.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                name="order"
                type="number"
                min="0"
                value={formData.order || 0}
                onChange={handleNumberChange}
              />
              <p className="text-xs text-gray-500">Las subcategorías se mostrarán ordenadas de menor a mayor.</p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch id="isActive" checked={formData.isActive !== false} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="isActive">Subcategoría Activa</Label>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button type="submit" form="subcategory-form" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editingSubcategory ? "Guardar Cambios" : "Crear Subcategoría"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la subcategoría "{subcategoryToDelete?.name}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubcategory} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
