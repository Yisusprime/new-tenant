"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useInventoryMovements } from "./inventory-movement-context"
import { useIngredients } from "./ingredient-context"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

// Esquema de validación para el formulario
const movementSchema = z.object({
  ingredientId: z.string().min(1, { message: "Selecciona un ingrediente" }),
  quantity: z.coerce.number().min(0.01, { message: "La cantidad debe ser mayor a 0" }),
  reason: z.string().min(1, { message: "Ingresa un motivo" }).optional(),
  notes: z.string().optional(),
})

type MovementFormValues = z.infer<typeof movementSchema>

interface InventoryMovementFormProps {
  type: "consumption" | "waste" | "adjustment"
  onSuccess: () => void
}

export function InventoryMovementForm({ type, onSuccess }: InventoryMovementFormProps) {
  const { registerConsumption, registerWaste, registerAdjustment } = useInventoryMovements()
  const { ingredients } = useIngredients()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null)

  // Inicializar el formulario
  const form = useForm<MovementFormValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      ingredientId: "",
      quantity: 1,
      reason: "",
      notes: "",
    },
  })

  const onSubmit = async (data: MovementFormValues) => {
    setIsSubmitting(true)
    try {
      switch (type) {
        case "consumption":
          await registerConsumption(data.ingredientId, data.quantity, data.notes)
          break
        case "waste":
          await registerWaste(data.ingredientId, data.quantity, data.reason || "No especificado")
          break
        case "adjustment":
          await registerAdjustment(data.ingredientId, data.quantity, data.notes || "Ajuste manual")
          break
      }
      onSuccess()
    } catch (error) {
      console.error(`Error al registrar ${type}:`, error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Obtener el ingrediente seleccionado
  const getSelectedIngredientUnit = () => {
    if (!selectedIngredient) return ""
    const ingredient = ingredients.find((i) => i.id === selectedIngredient)
    return ingredient ? ingredient.unit : ""
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="ingredientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ingrediente</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  setSelectedIngredient(value)
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar ingrediente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ingredients.map((ingredient) => (
                    <SelectItem key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} (Stock: {ingredient.stock} {ingredient.unit})
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
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {type === "adjustment" ? "Cantidad (positiva para añadir, negativa para restar)" : "Cantidad"}
              </FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input type="number" step="0.01" min={type === "adjustment" ? undefined : "0.01"} {...field} />
                </FormControl>
                <span className="text-muted-foreground">{getSelectedIngredientUnit()}</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {type === "waste" && (
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo del desperdicio</FormLabel>
                <FormControl>
                  <Textarea placeholder="Ej: Caducado, dañado, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas adicionales</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas adicionales (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando..."
            : `Registrar ${type === "consumption" ? "consumo" : type === "waste" ? "desperdicio" : "ajuste"}`}
        </Button>
      </form>
    </Form>
  )
}
