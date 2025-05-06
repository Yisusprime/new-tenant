"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useIngredients } from "./ingredient-context"
import { type Ingredient, INGREDIENT_CATEGORIES, MEASUREMENT_UNITS } from "@/lib/types/inventory"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BlobImageUploader } from "@/components/blob-image-uploader"

// Esquema de validación para el formulario
const ingredientSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Selecciona una categoría" }),
  unit: z.string().min(1, { message: "Selecciona una unidad de medida" }),
  stock: z.coerce.number().min(0, { message: "El stock no puede ser negativo" }),
  minStock: z.coerce.number().min(0, { message: "El stock mínimo no puede ser negativo" }),
  cost: z.coerce.number().min(0, { message: "El costo no puede ser negativo" }),
  barcode: z.string().optional(),
  location: z.string().optional(),
})

type IngredientFormValues = z.infer<typeof ingredientSchema>

interface IngredientFormProps {
  ingredient: Ingredient | null
  onSuccess: () => void
}

export function IngredientForm({ ingredient, onSuccess }: IngredientFormProps) {
  const { addIngredient, updateIngredient } = useIngredients()
  const [imageUrl, setImageUrl] = useState<string | undefined>(ingredient?.imageUrl)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Inicializar el formulario con los valores del ingrediente si existe
  const form = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: ingredient?.name || "",
      description: ingredient?.description || "",
      category: ingredient?.category || "",
      unit: ingredient?.unit || "",
      stock: ingredient?.stock || 0,
      minStock: ingredient?.minStock || 0,
      cost: ingredient?.cost || 0,
      barcode: ingredient?.barcode || "",
      location: ingredient?.location || "",
    },
  })

  const onSubmit = async (data: IngredientFormValues) => {
    setIsSubmitting(true)
    try {
      if (ingredient) {
        // Actualizar ingrediente existente
        await updateIngredient(ingredient.id, {
          ...data,
          imageUrl,
        })
      } else {
        // Añadir nuevo ingrediente
        await addIngredient({
          ...data,
          imageUrl,
          isActive: true,
        })
      }
      onSuccess()
    } catch (error) {
      console.error("Error al guardar ingrediente:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUploaded = (url: string) => {
    setImageUrl(url)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del ingrediente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripción del ingrediente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INGREDIENT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar unidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MEASUREMENT_UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Actual</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Mínimo</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo por unidad</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ubicación en almacén/cocina" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de barras</FormLabel>
                  <FormControl>
                    <Input placeholder="Código de barras (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <FormLabel>Imagen</FormLabel>
          <BlobImageUploader onImageUploaded={handleImageUploaded} initialImageUrl={imageUrl} folder="ingredients" />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : ingredient ? "Actualizar" : "Añadir"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
