"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { createCashMovement } from "@/lib/services/cash-register-service"
import type { CashMovement, CashMovementType, PaymentMethod } from "@/lib/types/cash-register"

// Esquema de validación
const cashMovementSchema = z.object({
  type: z.enum(["income", "expense", "withdrawal", "deposit", "adjustment"], {
    required_error: "El tipo de movimiento es obligatorio",
  }),
  amount: z.coerce.number().positive("El monto debe ser mayor que cero"),
  description: z.string().min(1, "La descripción es obligatoria"),
  paymentMethod: z.enum(["cash", "card", "transfer", "app", "other"], {
    required_error: "El método de pago es obligatorio",
  }),
  reference: z.string().optional(),
})

type CashMovementFormValues = z.infer<typeof cashMovementSchema>

interface CashMovementFormProps {
  tenantId: string
  branchId: string
  userId: string
  registerId: string
  onSuccess: (movement: CashMovement) => void
  onCancel: () => void
}

export function CashMovementForm({
  tenantId,
  branchId,
  userId,
  registerId,
  onSuccess,
  onCancel,
}: CashMovementFormProps) {
  const [loading, setLoading] = useState(false)

  // Valores por defecto
  const defaultValues: Partial<CashMovementFormValues> = {
    type: "income",
    amount: undefined,
    description: "",
    paymentMethod: "cash",
    reference: "",
  }

  const form = useForm<CashMovementFormValues>({
    resolver: zodResolver(cashMovementSchema),
    defaultValues,
  })

  const onSubmit = async (data: CashMovementFormValues) => {
    try {
      setLoading(true)

      const result = await createCashMovement(tenantId, branchId, userId, {
        ...data,
        registerId,
      })

      onSuccess(result)
    } catch (error) {
      console.error("Error al guardar movimiento:", error)
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setLoading(false)
    }
  }

  // Opciones para los tipos de movimiento
  const movementTypes: { value: CashMovementType; label: string }[] = [
    { value: "income", label: "Ingreso" },
    { value: "expense", label: "Gasto" },
    { value: "withdrawal", label: "Retiro" },
    { value: "deposit", label: "Depósito" },
    { value: "adjustment", label: "Ajuste" },
  ]

  // Opciones para los métodos de pago
  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: "cash", label: "Efectivo" },
    { value: "card", label: "Tarjeta" },
    { value: "transfer", label: "Transferencia" },
    { value: "app", label: "App de Pago" },
    { value: "other", label: "Otro" },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Movimiento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {movementTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Tipo de operación a realizar</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="1" placeholder="0" {...field} />
              </FormControl>
              <FormDescription>Cantidad de dinero del movimiento</FormDescription>
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
                <Textarea placeholder="Descripción del movimiento" {...field} />
              </FormControl>
              <FormDescription>Detalle del motivo del movimiento</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pago</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Método utilizado para el movimiento</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referencia (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Número de factura, recibo, etc." {...field} />
              </FormControl>
              <FormDescription>Referencia externa del movimiento</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar Movimiento
          </Button>
        </div>
      </form>
    </Form>
  )
}
