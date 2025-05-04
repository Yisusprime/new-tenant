"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useSuppliers } from "./supplier-context"
import { type Supplier, INGREDIENT_CATEGORIES } from "@/lib/types/inventory"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

// Esquema de validación para el formulario
const supplierSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  contactName: z.string().optional(),
  email: z.string().email({ message: "Ingresa un email válido" }).optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  categories: z.array(z.string()),
  paymentTerms: z.string().optional(),
  isActive: z.boolean().default(true),
})

type SupplierFormValues = z.infer<typeof supplierSchema>

interface SupplierFormProps {
  supplier: Supplier | null
  onSuccess: () => void
}

export function SupplierForm({ supplier, onSuccess }: SupplierFormProps) {
  const { addSupplier, updateSupplier } = useSuppliers()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Inicializar el formulario con los valores del proveedor si existe
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name || "",
      contactName: supplier?.contactName || "",
      email: supplier?.email || "",
      phone: supplier?.phone || "",
      address: supplier?.address || "",
      notes: supplier?.notes || "",
      categories: supplier?.categories || [],
      paymentTerms: supplier?.paymentTerms || "",
      isActive: supplier?.isActive ?? true,
    },
  })

  const onSubmit = async (data: SupplierFormValues) => {
    setIsSubmitting(true)
    try {
      if (supplier) {
        // Actualizar proveedor existente
        await updateSupplier(supplier.id, data)
      } else {
        // Añadir nuevo proveedor
        await addSupplier(data)
      }
      onSuccess()
    } catch (error) {
      console.error("Error al guardar proveedor:", error)
    } finally {
      setIsSubmitting(false)
    }
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
                  <FormLabel>Nombre de la empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del proveedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Persona de contacto</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del contacto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email de contacto" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="Teléfono de contacto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Dirección del proveedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condiciones de pago</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 30 días, contado, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notas adicionales" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Activo</FormLabel>
                    <FormDescription>
                      Marcar como activo para mostrar en listas de proveedores disponibles
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <FormLabel>Categorías de productos</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {INGREDIENT_CATEGORIES.map((category) => (
              <FormField
                key={category}
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem key={category} className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(category)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...field.value, category])
                            : field.onChange(field.value?.filter((value) => value !== category))
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{category}</FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : supplier ? "Actualizar" : "Añadir"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
