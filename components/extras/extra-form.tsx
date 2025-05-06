"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "../categories/image-upload"
import { useExtras } from "./extra-context"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"

interface ExtraFormProps {
  extraId: string | null
  onCancel: () => void
}

export function ExtraForm({ extraId, onCancel }: ExtraFormProps) {
  const { extras, addExtra, updateExtra, tenantId } = useExtras()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [available, setAvailable] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (extraId) {
      const extra = extras.find((e) => e.id === extraId)
      if (extra) {
        setName(extra.name)
        setDescription(extra.description || "")
        setPrice(extra.price.toString())
        setImageUrl(extra.imageUrl || "")
        setAvailable(extra.available)
      }
    } else {
      // Reset form for new extra
      setName("")
      setDescription("")
      setPrice("")
      setImageUrl("")
      setAvailable(true)
    }
  }, [extraId, extras])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const extraData = {
        name,
        description,
        price: Number.parseFloat(price) || 0,
        imageUrl,
        available,
      }

      if (extraId) {
        await updateExtra(extraId, extraData)
        toast({
          title: "Extra actualizado",
          description: `El extra "${name}" ha sido actualizado correctamente.`,
        })
      } else {
        await addExtra(extraData)
        toast({
          title: "Extra añadido",
          description: `El extra "${name}" ha sido añadido correctamente.`,
        })
      }
      onCancel()
    } catch (error) {
      console.error("Error al guardar extra:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el extra. Por favor, inténtalo de nuevo.",
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
    <Card>
      <CardHeader>
        <CardTitle>{extraId ? "Editar Extra" : "Añadir Extra"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del extra"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción breve del extra"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio base</Label>
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

          <div className="space-y-2">
            <Label>Imagen (opcional)</Label>
            <ImageUpload
              currentImageUrl={imageUrl}
              onImageUploaded={handleImageUploaded}
              folder="extras"
              tenantId={tenantId}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="available" checked={available} onCheckedChange={setAvailable} />
            <Label htmlFor="available">Disponible</Label>
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
              ) : extraId ? (
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
