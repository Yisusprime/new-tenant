"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useBranch } from "@/lib/context/branch-context"
import {
  getCategory,
  createCategory,
  updateCategory,
  uploadCategoryImage,
  type Category,
} from "@/lib/services/category-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, ArrowLeft, Upload, Trash } from "lucide-react"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import Image from "next/image"

export default function CategoryFormPage({
  params,
}: {
  params: { tenantId: string; categoryId: string }
}) {
  const { tenantId, categoryId } = params
  const isNewCategory = categoryId === "new"
  const { currentBranch } = useBranch()
  const [loading, setLoading] = useState(!isNewCategory)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    description: "",
    imageUrl: "",
    order: 0,
    isActive: true,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function loadCategory() {
      if (isNewCategory || !currentBranch) {
        setLoading(false)
        return
      }

      try {
        const categoryData = await getCategory(tenantId, currentBranch.id, categoryId)
        if (categoryData) {
          setFormData({
            name: categoryData.name,
            description: categoryData.description || "",
            imageUrl: categoryData.imageUrl || "",
            order: categoryData.order,
            isActive: categoryData.isActive,
          })
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
  }, [tenantId, categoryId, isNewCategory, currentBranch, toast])

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

    if (!currentBranch) {
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
        description: "El nombre de la categoría es obligatorio",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      if (isNewCategory) {
        // Crear nueva categoría
        await createCategory(tenantId, currentBranch.id, {
          name: formData.name!,
          description: formData.description,
          imageUrl: formData.imageUrl,
          order: formData.order || 0,
          isActive: formData.isActive !== false,
        })

        toast({
          title: "Categoría creada",
          description: "La categoría se ha creado correctamente",
        })
      } else {
        // Actualizar categoría existente
        await updateCategory(tenantId, currentBranch.id, categoryId, {
          name: formData.name,
          description: formData.description,
          imageUrl: formData.imageUrl,
          order: formData.order,
          isActive: formData.isActive,
        })

        toast({
          title: "Categoría actualizada",
          description: "La categoría se ha actualizado correctamente",
        })
      }

      // Redirigir a la lista de categorías
      router.push("/admin/categories")
    } catch (error) {
      console.error("Error al guardar categoría:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la categoría",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentBranch) return

    const file = e.target.files[0]

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Por favor, selecciona una imagen",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "La imagen no debe superar los 2MB",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingImage(true)

      if (isNewCategory) {
        // Para categorías nuevas, solo guardamos el archivo temporalmente
        // y lo subimos cuando se guarde la categoría
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setFormData((prev) => ({ ...prev, imageUrl: event.target!.result as string }))
          }
        }
        reader.readAsDataURL(file)
      } else {
        // Para categorías existentes, subimos la imagen directamente
        const imageUrl = await uploadCategoryImage(tenantId, currentBranch.id, categoryId, file)
        setFormData((prev) => ({ ...prev, imageUrl }))

        toast({
          title: "Imagen actualizada",
          description: "La imagen de la categoría se ha actualizado correctamente",
        })
      }
    } catch (error) {
      console.error("Error al subir imagen:", error)
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
      // Limpiar el input de archivo
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: "" }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{isNewCategory ? "Nueva Categoría" : "Editar Categoría"}</h1>
        <Button variant="outline" onClick={() => router.push("/admin/categories")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>

      <NoBranchSelectedAlert />

      {currentBranch && (
        <Card>
          <CardHeader>
            <CardTitle>{isNewCategory ? "Crear Nueva Categoría" : "Editar Categoría"}</CardTitle>
            <CardDescription>
              {isNewCategory
                ? "Completa el formulario para crear una nueva categoría"
                : "Actualiza la información de la categoría"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="category-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Imagen de la categoría */}
                <div className="flex flex-col items-center mb-6 p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-lg font-medium mb-4">Imagen de la Categoría</h3>
                  <div className="relative mb-4">
                    {formData.imageUrl ? (
                      <div className="relative w-40 h-40 rounded-lg overflow-hidden border">
                        <Image
                          src={formData.imageUrl || "/placeholder.svg"}
                          alt="Imagen de categoría"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">Sin imagen</span>
                      </div>
                    )}

                    {uploadingImage ? (
                      <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-0 right-0 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                        type="button"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </div>

                  {formData.imageUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      onClick={handleRemoveImage}
                      disabled={uploadingImage}
                      type="button"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Eliminar imagen
                    </Button>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Recomendado: Imagen cuadrada de al menos 200x200 píxeles. Máximo 2MB.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Categoría *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    placeholder="Ej: Hamburguesas, Pizzas, etc."
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
                    placeholder="Descripción breve de la categoría"
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
                  <p className="text-xs text-gray-500">Las categorías se mostrarán ordenadas de menor a mayor.</p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="isActive" checked={formData.isActive !== false} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="isActive">Categoría Activa</Label>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" form="category-form" disabled={saving || uploadingImage}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isNewCategory ? "Crear Categoría" : "Guardar Cambios"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
