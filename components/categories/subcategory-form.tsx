"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "./image-upload"
import { useCategories } from "./category-context"
import { Loader2 } from "lucide-react"

interface SubcategoryFormProps {
  categoryId: string
  subcategoryId: string | null
  onCancel: () => void
}

export function SubcategoryForm({ categoryId, subcategoryId, onCancel }: SubcategoryFormProps) {
  const { categories, addSubcategory, updateSubcategory, tenantId } = useCategories()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (subcategoryId) {
      const category = categories.find((c) => c.id === categoryId)
      if (category && category.subcategories && category.subcategories[subcategoryId]) {
        const subcategory = category.subcategories[subcategoryId]
        setName(subcategory.name)
        setDescription(subcategory.description || "")
        setImageUrl(subcategory.imageUrl || "")
      }
    } else {
      // Reset form for new subcategory
      setName("")
      setDescription("")
      setImageUrl("")
    }
  }, [subcategoryId, categoryId, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (subcategoryId) {
        await updateSubcategory(categoryId, subcategoryId, { name, description, imageUrl })
      } else {
        await addSubcategory(categoryId, { name, description, imageUrl })
      }
      onCancel()
    } catch (error) {
      console.error("Error al guardar subcategoría:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleImageUploaded = (url: string) => {
    setImageUrl(url)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la subcategoría"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción breve de la subcategoría"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Imagen (opcional)</Label>
          <ImageUpload
            currentImageUrl={imageUrl}
            onImageUploaded={handleImageUploaded}
            folder="subcategories"
            tenantId={tenantId} // Pasamos el tenantId
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting || !name}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : subcategoryId ? (
              "Actualizar"
            ) : (
              "Guardar"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
