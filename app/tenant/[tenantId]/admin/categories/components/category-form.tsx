"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { createCategory, updateCategory, type Category } from "@/lib/services/category-service"
import { uploadImage } from "@/app/api/upload/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Camera, Tag, Upload } from "lucide-react"

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
  parentId: string | null
  tenantId: string
  branchId?: string
  categories: Category[]
  onCategoryCreated: (category: Category) => void
  onCategoryUpdated: (category: Category) => void
}

export function CategoryForm({
  open,
  onOpenChange,
  category,
  parentId,
  tenantId,
  branchId,
  categories,
  onCategoryCreated,
  onCategoryUpdated,
}: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    order: 0,
    isActive: true,
    parentId: parentId || "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const pathname = usePathname()

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (category) {
        // Edit mode
        setFormData({
          name: category.name,
          description: category.description || "",
          order: category.order,
          isActive: category.isActive,
          parentId: category.parentId || "",
        })
        setImagePreview(category.image || "")
      } else {
        // Create mode
        setFormData({
          name: "",
          description: "",
          order: getNextOrder(),
          isActive: true,
          parentId: parentId || "",
        })
        setImagePreview("")
      }
      setImageFile(null)
    }
  }, [open, category, parentId, categories])

  // Get the next order number based on existing categories
  const getNextOrder = () => {
    if (parentId) {
      // For subcategories, find the max order within the parent
      const subcategories = categories.filter((cat) => cat.parentId === parentId)

      if (subcategories.length === 0) return 0

      return Math.max(...subcategories.map((cat) => cat.order)) + 1
    } else {
      // For main categories
      if (categories.length === 0) return 0

      return Math.max(...categories.filter((cat) => !cat.parentId).map((cat) => cat.order)) + 1
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return

    const file = e.target.files[0]

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Por favor, selecciona una imagen",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "La imagen no debe superar los 2MB",
        variant: "destructive",
      })
      return
    }

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Función para subir la imagen usando la Server Action
  const handleImageUpload = async (categoryId: string) => {
    if (!imageFile || !branchId) return null

    setIsUploading(true)
    console.log("Iniciando carga de imagen para categoría:", categoryId)

    try {
      // Crear un FormData para la Server Action
      const formData = new FormData()
      formData.append("file", imageFile)
      formData.append("tenantId", tenantId)
      formData.append("branchId", branchId)
      formData.append("categoryId", categoryId)
      formData.append("path", pathname)

      console.log("FormData creado con:", {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type,
        tenantId,
        branchId,
        categoryId,
        pathname,
      })

      // Llamar a la Server Action directamente
      const result = await uploadImage(null, formData)
      console.log("Resultado de uploadImage:", result)

      if (result.success && result.url) {
        // No usamos la URL temporal del objeto File, sino la URL real devuelta por Vercel Blob
        setImagePreview(result.url)
        toast({
          title: "Imagen subida",
          description: "La imagen se ha subido correctamente.",
        })
        return result.url
      } else {
        toast({
          title: "Error al subir la imagen",
          description: result.error || "No se pudo subir la imagen",
          variant: "destructive",
        })
        return null
      }
    } catch (error: any) {
      console.error("Error al subir imagen:", error)
      toast({
        title: "Error al subir la imagen",
        description: error.message || "No se pudo subir la imagen",
        variant: "destructive",
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!branchId) {
      toast({
        title: "Error",
        description: "Debes seleccionar una sucursal primero",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      console.log("Iniciando guardado de categoría")

      if (category) {
        // Update existing category
        console.log("Actualizando categoría existente:", category.id)
        const updatedCategory = await updateCategory(tenantId, branchId, category.id, {
          name: formData.name,
          description: formData.description,
          order: formData.order,
          isActive: formData.isActive,
          parentId: formData.parentId || undefined,
        })

        // Upload image if changed
        if (imageFile) {
          console.log("Subiendo nueva imagen para categoría existente")
          const imageUrl = await handleImageUpload(category.id)
          if (imageUrl) {
            updatedCategory.image = imageUrl
          }
        }

        onCategoryUpdated(updatedCategory)

        toast({
          title: "Categoría actualizada",
          description: `La categoría "${formData.name}" ha sido actualizada correctamente.`,
        })

        onOpenChange(false)
      } else {
        // Create new category
        console.log("Creando nueva categoría")
        const newCategory = await createCategory(tenantId, branchId, {
          name: formData.name,
          description: formData.description,
          order: formData.order,
          isActive: formData.isActive,
          parentId: formData.parentId || undefined,
        })

        console.log("Nueva categoría creada:", newCategory)

        // Upload image if provided
        if (imageFile) {
          console.log("Subiendo imagen para nueva categoría")
          const imageUrl = await handleImageUpload(newCategory.id)
          if (imageUrl) {
            newCategory.image = imageUrl
            console.log("Imagen subida y asociada a la categoría:", imageUrl)
          }
        }

        onCategoryCreated(newCategory)

        toast({
          title: "Categoría creada",
          description: `La categoría "${formData.name}" ha sido creada correctamente.`,
        })

        onOpenChange(false)
      }
    } catch (error: any) {
      console.error("Error al guardar categoría:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la categoría.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!isSubmitting && !isUploading) {
          onOpenChange(newOpen)
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{category ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
          <DialogDescription>
            {category
              ? "Actualiza la información de la categoría"
              : parentId
                ? "Crea una nueva subcategoría"
                : "Crea una nueva categoría principal"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image upload */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-gray-100 mb-2">
              {imagePreview ? (
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  fill
                  className="object-cover"
                  sizes="96px"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full text-gray-400">
                  <Tag className="h-8 w-8" />
                </div>
              )}

              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute bottom-1 right-1 rounded-full h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </Button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploading}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-3 w-3 mr-1" />
              {imagePreview ? "Cambiar imagen" : "Subir imagen"}
            </Button>

            <p className="text-xs text-gray-500 mt-1">Imagen recomendada: 200x200px (máx. 2MB)</p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Parent category selector (only show when creating/editing a subcategory) */}
            {(parentId || category?.parentId) && (
              <div className="space-y-2">
                <Label htmlFor="parentId">Categoría Principal *</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                  disabled={!!parentId && !category} // Disable when creating a subcategory from a specific parent
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((cat) => !cat.parentId) // Only show parent categories
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive" className="block mb-2">
                  Estado
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    {formData.isActive ? "Activa" : "Inactiva"}
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isUploading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? "Subiendo imagen..." : category ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                <>{category ? "Actualizar" : "Crear"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
