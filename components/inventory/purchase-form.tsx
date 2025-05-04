"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { usePurchases } from "./purchase-context"
import { useSuppliers } from "./supplier-context"
import { useIngredients } from "./ingredient-context"
import type { Purchase, PurchaseItem } from "@/lib/types/inventory"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"
import { format } from "date-fns"

// Esquema de validación para el formulario
const purchaseItemSchema = z.object({
  ingredientId: z.string().min(1, { message: "Selecciona un ingrediente" }),
  quantity: z.coerce.number().min(0.01, { message: "La cantidad debe ser mayor a 0" }),
  unitCost: z.coerce.number().min(0, { message: "El costo no puede ser negativo" }),
})

const purchaseSchema = z.object({
  supplierId: z.string().min(1, { message: "Selecciona un proveedor" }),
  orderDate: z.string().min(1, { message: "Selecciona una fecha" }),
  items: z.array(purchaseItemSchema).min(1, { message: "Añade al menos un ítem" }),
  paymentStatus: z.string().min(1, { message: "Selecciona un estado de pago" }),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
})

type PurchaseFormValues = z.infer<typeof purchaseSchema>

interface PurchaseFormProps {
  purchase: Purchase | null
  onSuccess: () => void
}

export function PurchaseForm({ purchase, onSuccess }: PurchaseFormProps) {
  const { addPurchase, updatePurchase } = usePurchases()
  const { suppliers } = useSuppliers()
  const { ingredients } = useIngredients()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)

  // Inicializar el formulario con los valores de la compra si existe
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplierId: purchase?.supplierId || "",
      orderDate: purchase ? format(purchase.orderDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      items: purchase?.items.map((item) => ({
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        unitCost: item.unitCost,
      })) || [{ ingredientId: "", quantity: 1, unitCost: 0 }],
      paymentStatus: purchase?.paymentStatus || "pending",
      paymentMethod: purchase?.paymentMethod || "",
      notes: purchase?.notes || "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  // Calcular el total de la compra
  useEffect(() => {
    const values = form.getValues()
    let total = 0
    values.items.forEach((item) => {
      total += item.quantity * item.unitCost
    })
    setTotalAmount(total)
  }, [form.watch("items")])

  const onSubmit = async (data: PurchaseFormValues) => {
    setIsSubmitting(true)
    try {
      // Calcular el total
      let total = 0
      const processedItems: PurchaseItem[] = []

      for (const item of data.items) {
        const ingredient = ingredients.find((ing) => ing.id === item.ingredientId)
        if (!ingredient) continue

        const totalCost = item.quantity * item.unitCost
        total += totalCost

        processedItems.push({
          ingredientId: item.ingredientId,
          ingredientName: ingredient.name,
          quantity: item.quantity,
          unit: ingredient.unit,
          unitCost: item.unitCost,
          totalCost: totalCost,
        })
      }

      const supplier = suppliers.find((s) => s.id === data.supplierId)
      if (!supplier) throw new Error("Proveedor no encontrado")

      const purchaseData = {
        supplierId: data.supplierId,
        supplierName: supplier.name,
        orderDate: new Date(data.orderDate),
        status: "pending" as const,
        items: processedItems,
        totalAmount: total,
        paymentStatus: data.paymentStatus as "pending" | "paid" | "partial",
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      }

      if (purchase) {
        // Actualizar compra existente
        await updatePurchase(purchase.id, purchaseData)
      } else {
        // Añadir nueva compra
        await addPurchase(purchaseData)
      }
      onSuccess()
    } catch (error) {
      console.error("Error al guardar compra:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addItem = () => {
    append({ ingredientId: "", quantity: 1, unitCost: 0 })
  }

  // Función para actualizar el costo unitario cuando se selecciona un ingrediente
  const updateUnitCost = (index: number, ingredientId: string) => {
    const ingredient = ingredients.find((ing) => ing.id === ingredientId)
    if (ingredient) {
      const items = form.getValues("items")
      items[index].unitCost = ingredient.cost
      form.setValue(`items.${index}.unitCost`, ingredient.cost)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proveedor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers
                      .filter((supplier) => supplier.isActive)
                      .map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
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
            name="orderDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de pedido</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Ítems</h3>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" /> Añadir ítem
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay ítems. Añade al menos uno.</p>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Ítem {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.ingredientId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ingrediente</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value)
                                updateUnitCost(index, value)
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
                        name={`items.${index}.quantity`}
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

                      <FormField
                        control={form.control}
                        name={`items.${index}.unitCost`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Costo unitario</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.01" {...field} />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="paymentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado de pago</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="partial">Parcial</SelectItem>
                    <SelectItem value="paid">Pagado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de pago</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Efectivo, Transferencia, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas adicionales sobre la compra" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center">
          <div className="text-lg font-medium">
            Total: <span className="font-bold">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : purchase ? "Actualizar" : "Crear Compra"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
