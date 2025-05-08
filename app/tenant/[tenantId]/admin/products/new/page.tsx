"use client"

import type React from "react"

import { useState } from "react"
import { collection, addDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NewProductPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    available: true,
    image: null as File | null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData({ ...formData, available: checked })
  }

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, category: value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validar datos
      if (!formData.name || !formData.price) {
        throw new Error("El nombre y el precio son obligatorios")
      }

      const price = Number.parseFloat(formData.price)
      if (isNaN(price) || price <= 0) {
        throw new Error("El precio debe ser un número positivo")
      }

      // Crear objeto del producto
      const productData: any = {
        name: formData.name,
        description: formData.description,
        price: price,
        category: formData.category,
        available: formData.available,
        createdAt: new Date().toISOString(),
      }

      // Subir imagen si existe
      if (formData.image) {
        const storageRef = ref(storage, `tenants/${tenantId}/products/${Date.now()}_${formData.image.name}`)
        const snapshot = await uploadBytes(storageRef, formData.image)
        const imageUrl = await getDownloadURL(snapshot.ref)
        productData.imageUrl = imageUrl
      }

      // Guardar producto en Firestore
      await addDoc(collection(db, `tenants/${tenantId}/products`), productData)

      // Mostrar mensaje de éxito
      setSuccess("Producto creado correctamente")

      // Limpiar formulario
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        available: true,
        image: null,
      })

      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = "/admin/products"
      }, 2000)
    } catch (err: any) {
      console.error("Error al crear producto:", err)
      setError(err.message || "Error al crear el producto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nuevo Producto</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información del Producto</CardTitle>
            <CardDescription>Añade un nuevo producto a tu menú</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-500 text-green-700">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={formData.category} onValueChange={handleSelectChange}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entradas">Entradas</SelectItem>
                    <SelectItem value="platos-principales">Platos Principales</SelectItem>
                    <SelectItem value="postres">Postres</SelectItem>
                    <SelectItem value="bebidas">Bebidas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Imagen del Producto</Label>
              <Input id="image" name="image" type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="available" checked={formData.available} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="available">Disponible</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => window.history.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Producto"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
