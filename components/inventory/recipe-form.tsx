"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRecipes } from "./recipe-context"
import { useIngredients } from "./ingredient-context"
import type { Recipe, RecipeIngredient } from "@/lib/types/inventory"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"

// Esquema de validación para el formulario
const recipeIngredientSchema = z.object({
  ingredientId: z.string().min(1, { message: "Selecciona un ingrediente" }),
  quantity: z.coerce.number().min(0.01, { message: "La cantidad debe ser mayor a 0" }),
})

const recipeSchema = z.object({
  productId: z.string().min(1, { message: "Selecciona un producto" }),
  productName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  ingredients: z.array(recipeIngredientSchema).min(1, { message: "Añade al menos un ingrediente" }),
  preparationTime: z.coerce.number().min(0).optional(),
  instructions: z.string().optional(),
  yield: z.coerce.number().min(1, { message: "El rendimiento debe ser al menos 1" }),
})

type RecipeFormValues = z.infer<typeof recipeSchema>

interface RecipeFormProps {
  recipe: Recipe | null
  onSuccess: () => void
}

export function RecipeForm({ recipe, onSuccess }: RecipeFormProps) {
  const { addRecipe, updateRecipe } = useRecipes()
  const { ingredients } = useIngredients()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Aquí deberíamos obtener los productos, pero como no tenemos ese contexto,
  // vamos a simular algunos productos para el ejemplo
  const products = [
    { id: "product1", name: "Pizza Margherita" },
    { id: "product2", name: "Hamburguesa Clásica" },
    { id: "product3", name: "Ensalada César" },
    { id: "product4", name: "Pasta Carbonara" },
  ]

  // Inicializar el formulario con los valores de la receta si existe
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      productId: recipe?.productId || "",
      productName: recipe?.productName || "",
      ingredients: recipe?.ingredients.map((ing) => ({
        ingredientId: ing.ingredientId,
        quantity: ing.quantity,
      })) || [{ ingredientId: "", quantity: 1 }],
      preparationTime: recipe?.preparationTime || 0,
      instructions: recipe?.instructions || "",
      yield: recipe?.yield || 1,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  })

  const onSubmit = async (data: RecipeFormValues) => {
    setIsSubmitting(true)
    try {
      const processedIngredients: RecipeIngredient[] = []

      for (const item of data.ingredients) {
        const ingredient = ingredients.find((ing) => ing.id === item.ingredientId)
        if (!ingredient) continue

        processedIngredients.push({
          ingredientId: item.ingredientId,
          ingredientName: ingredient.name,
          quantity: item.quantity,
          unit: ingredient.unit,
        })
      }

      const recipeData = {
        productId: data.productId,
        productName: data.productName,
        ingredients: processedIngredients,
        preparationTime: data.preparationTime,
        instructions: data.instructions,
        yield: data.yield,
      }

      if (recipe) {
        // Actualizar receta existente
        await updateRecipe(recipe.id, recipeData)
      } else {
        // Añadir nueva receta
        await addRecipe(recipeData)
      }
      onSuccess()
    } catch (error) {
      console.error("Error al guardar receta:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addIngredient = () => {
    append({ ingredientId: "", quantity: 1 })
  }

  // Función para actualizar el nombre del producto cuando se selecciona uno
  const updateProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (product) {
      form.setValue("productName", product.name)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Producto</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    updateProductName(value)
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
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
            name="productName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del producto</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="preparationTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiempo de preparación (minutos)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="yield"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rendimiento (porciones)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instrucciones de preparación</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Ingredientes</h3>
            <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
              <Plus className="mr-2 h-4 w-4" /> Añadir ingrediente
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay ingredientes. Añade al menos uno.</p>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Ingrediente {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.ingredientId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ingrediente</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar ingrediente" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ingredients.map((ingredient) => (
                                  <SelectItem key={ingredient.id} value={ingredient.id}>
                                    {ingredient.name} ({ingredient.unit})
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
                        name={`ingredients.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad</FormLabel>
                            <FormControl>
                              <Input type="number" min="0.01" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="py-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : recipe ? "Actualizar" : "Crear Receta"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
