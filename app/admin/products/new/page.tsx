"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useBranch } from "@/lib/context/branch-context"
import { createProduct } from "@/lib/services/product-service"
import { getCategories, getAllSubcategories, type Category, type Subcategory } from "@/lib/services/category-service"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Upload, X } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewProductPage() {
  const router = useRouter()
  const { currentBranch } = useBranch()

  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Campos del formulario
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [discountPrice, setDiscountPrice] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [subcategoryId, setSubcategoryId] = useState("")
  const [featured, setFeatured] = useState(false)
  const [available, setAvailable] = useState(true)
  const [order, setOrder] = useState("0")

  useEffect(() => {
    if (currentBranch) {
      loadCategories()
    }
  }, [currentBranch])

  useEffect(() => {
    if (categoryId) {
      loadSubcategories()
    } else {
      setSubcategories([])
      setSubcategoryId("")
    }
  }, [categoryId])

  const loadCategories = async () => {
    if (!currentBranch) return

    try {
      const categoriesData = await getCategories(currentBranch.tenantId, currentBranch.id)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error al cargar categorías:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      })
    }
  }

  const loadSubcategories = async () => {
    if (!currentBranch || !categoryId) return

    try {
      const subcategoriesData = await getAllSubcategories(currentBranch.tenantId, currentBranch.id, categoryId)
      setSubcategories(subcategoriesData)
    } catch (error) {
      console.error("Error al cargar subcategorías:", error)
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

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!currentBranch) {
      toast({
        title: "Error",
        description: "Debes seleccionar una sucursal",
        variant: "destructive",
      })
      return
    }

    if (!name || !price || !categoryId) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const productData = {
        name,
        description,
        price: Number.parseFloat(price),
        discountPrice: discountPrice ? Number.parseFloat(discountPrice) : undefined,
        categoryId,
        subcategoryId: subcategoryId || undefined,
        featured,
        available,
        order: Number.parseInt(order) || 0,
      }

      await createProduct(currentBranch.tenantId, currentBranch.id, productData, imageFile || undefined)
      toast({
        title: "Producto creado",
        description: "El producto ha sido creado correctamente",
      })

      router.push(`/admin/products`)
    } catch (error) {
      console.error("Error al guardar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el producto",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Nuevo Producto</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crear Producto</CardTitle>
          <CardDescription>Completa la información del producto</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Producto *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Hamburguesa Clásica"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe el producto..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Precio *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discountPrice">Precio con Descuento</Label>
                  <Input
                    id="discountPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategoría</Label>
                  <Select
                    value={subcategoryId}
                    onValueChange={setSubcategoryId}
                    disabled={!categoryId || subcategories.length === 0}
                  >
                    <SelectTrigger id="subcategory">
                      <SelectValue placeholder="Selecciona una subcategoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  min="0"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  placeholder="0"
                />
                <p className="text-sm text-gray-500 mt-1">Los productos se mostrarán ordenados de menor a mayor</p>
              </div>

              <div className="flex flex-col space-y-4">
                <Label>Imagen del Producto</Label>
                {imagePreview ? (
                  <div className="relative w-40 h-40">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Vista previa"
                      fill
                      className="object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-40 w-40">
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center cursor-pointer p-4"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Subir imagen</span>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured" className="cursor-pointer">
                    Producto Destacado
                  </Label>
                  <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="available" className="cursor-pointer">
                    Disponible para Venta
                  </Label>
                  <Switch id="available" checked={available} onCheckedChange={setAvailable} />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Crear Producto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
