"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "../categories/image-upload"
import { useProducts } from "./product-context"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { useCategories } from "../categories/category-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductFormProps {
  productId: string | null
  onCancel: () => void
}

export function ProductForm({ productId, onCancel }: ProductFormProps) {
  const { products, addProduct, updateProduct, tenantId } = useProducts()
  const { categories } = useCategories()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [available, setAvailable] = useState(true)
  const [featured, setFeatured] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (productId) {
      const product = products.find((p) => p.id === productId)
      if (product) {
        setName(product.name)
        setDescription(product.description || "")
        setPrice(product.price.toString())
        setImageUrl(product.imageUrl || "")
        setCategoryId(product.categoryId || "")
        setAvailable(product.available)
        setFeatured(product.featured)
      }
    } else {
      // Reset form for new product
      setName("")
      setDescription("")
      setPrice("")
      setImageUrl("")
      setCategoryId("")
      setAvailable(true)
      setFeatured(false)
    }
  }, [productId, products])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const productData = {
        name,
        description,
        price: Number.parseFloat(price) || 0,
        imageUrl,
        categoryId: categoryId || undefined,
        available,
        featured,
      }

      if (productId) {
        await updateProduct(productId, productData)
        toast({
          title: "Producto actualizado",
          description: `El producto "${name}" ha sido actualizado correctamente.`,
        })
      } else {
        await addProduct(productData)
        toast({
          title: "Producto añadido",
          description: `El producto "${name}" ha sido añadido correctamente.`,
        })
      }
      onCancel()
    } catch (error) {
      console.error("Error al guardar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el producto. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del producto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="pl-7"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción breve del producto"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin categoría</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Imagen (opcional)</Label>
          <ImageUpload
            currentImageUrl={imageUrl}
            onImageUploaded={handleImageUploaded}
            folder="products"
            tenantId={tenantId}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Switch id="available" checked={available} onCheckedChange={setAvailable} />
            <Label htmlFor="available">Disponible</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
            <Label htmlFor="featured">Destacado</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting || !name || !price}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : productId ? (
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
