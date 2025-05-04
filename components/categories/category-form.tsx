"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "./image-upload"
import { useCategories } from "./category-context"
import { Loader2 } from "lucide-react"

interface CategoryFormProps {
  categoryId: string | null
  onCancel: () => void
}

export function CategoryForm({ categoryId, onCancel }: CategoryFormProps) {
  const { categories, addCategory, updateCategory } = useCategories()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (categoryId) {
      const category = categories.find((c) => c.id === categoryId)
      if (category) {
        setName(category.name)
        setDescription(category.description || "")
        setImageUrl(category.imageUrl || "")
      }
    } else {
      // Reset form for new category
      setName("")
      setDescription("")
      setImageUrl("")
    }
  }, [categoryId, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (categoryId) {
        await updateCategory(categoryId, { name, description, imageUrl })
      } else {
        await addCategory({ name, description, imageUrl })
      }
      onCancel()
    } catch (error) {
      console.error("Error al guardar categoría:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleImageUploaded = (url: string) => {
    setImageUrl(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{categoryId ? "Editar Categoría" : "Añadir Categoría"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la categoría"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción breve de la categoría"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Imagen (opcional)</Label>
            <ImageUpload currentImageUrl={imageUrl} onImageUploaded={handleImageUploaded} folder={`categories`} />
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
              ) : categoryId ? (
                "Actualizar"
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
