"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBranch } from "@/lib/context/branch-context"
import {
  getCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  type Category,
  type Subcategory,
} from "@/lib/services/category-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Loader2, Plus, Pencil, Trash, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"

export default function SubcategoriesPage({
  params,
}: {
  params: { tenantId: string; categoryId: string }
}) {
  const { tenantId, categoryId } = params
  const { currentBranch } = useBranch()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null)
  const [formData, setFormData] = useState<Partial<Subcategory>>({
    name: "",
    description: "",
    order: 0,
    isActive: true,
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function loadCategory() {
      if (!currentBranch) {
        setCategory(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const categoryData = await getCategory(tenantId, currentBranch.id, categoryId)
        setCategory(categoryData)
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
  }, [tenantId, categoryId, currentBranch, toast])

  const handleOpenDialog = (subcategory?: Subcategory) => {
    if (subcategory) {
      setEditingSubcategory(subcategory)
      setFormData({
        name: subcategory.name,
        description: subcategory.description || "",
        order: subcategory.order,
        isActive: subcategory.isActive,
      })
    } else {
      setEditingSubcategory(null)
      setFormData({
        name: "",
        description: "",
        order: category?.subcategories?.length || 0,
        isActive: true,
      })
    }
    setDialogOpen(true)
  }

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

      if (editingSubcategory) {
        // Actualizar subcategoría existente
        await updateSubcategory(tenantId, currentBranch.id, categoryId, editingSubcategory.id, {
          name: formData.name,
          description: formData.description,
          order: formData.order,
          isActive: formData.isActive,
        })

        // Actualizar la subcategoría en el estado local
        const updatedSubcategories = category.subcategories?.map((sub) =>
          sub.id === editingSubcategory.id ? { ...sub, ...formData, updatedAt: new Date().toISOString() } : sub,
        )

        setCategory({ ...category, subcategories: updatedSubcategories })

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
        })

        // Añadir la nueva subcategoría al estado local
        const updatedSubcategories = [...(category.subcategories || []), newSubcategory]
        setCategory({ ...category, subcategories: updatedSubcategories })

        toast({
          title: "Subcategoría creada",
          description: "La subcategoría se ha creado correctamente",
        })
      }

      // Cerrar el diálogo y limpiar el formulario
      setDialogOpen(false)
      setEditingSubcategory(null)
      setFormData({
        name: "",
        description: "",
        order: 0,
        isActive: true,
      })
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
    if (!currentBranch || !category || !subcategoryToDelete) return

    try {
      await deleteSubcategory(tenantId, currentBranch.id, categoryId, subcategoryToDelete.id)

      // Actualizar el estado local
      const updatedSubcategories = category.subcategories?.filter((sub) => sub.id !== subcategoryToDelete.id)
      setCategory({ ...category, subcategories: updatedSubcategories })

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Subcategorías</h1>
          <Button variant="outline" onClick={() => router.push("/admin/categories")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Categorías
          </Button>
        </div>

        <NoBranchSelectedAlert />

        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Categoría no encontrada</p>
              <Button variant="outline" onClick={() => router.push("/admin/categories")}>
                Volver a Categorías
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subcategorías de {category.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/categories")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          <Button onClick={() => handleOpenDialog()} disabled={!currentBranch}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Subcategoría
          </Button>
        </div>
      </div>

      <NoBranchSelectedAlert />

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Subcategorías</CardTitle>
          <CardDescription>Administra las subcategorías para {category.name}</CardDescription>
        </CardHeader>
        <CardContent>
          {category.subcategories?.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No hay subcategorías configuradas</p>
              <Button onClick={() => handleOpenDialog()} disabled={!currentBranch}>
                Crear Primera Subcategoría
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {category.subcategories?.map((subcategory) => (
                  <TableRow key={subcategory.id}>
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
        <DialogContent>
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
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" form="subcategory-form" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingSubcategory ? "Guardar Cambios" : "Crear Subcategoría"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar subcategoría */}
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
