"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { createCashRegister, updateCashRegister } from "@/lib/services/cash-register-service"
import type { CashRegister } from "@/lib/types/cash-register"

// Esquema de validación
const cashRegisterSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  initialBalance: z.coerce.number().min(0, "El balance inicial debe ser mayor o igual a cero"),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
})

type CashRegisterFormValues = z.infer<typeof cashRegisterSchema>

interface CashRegisterFormProps {
  tenantId: string
  branchId: string
  userId: string
  register?: CashRegister
  onSuccess: (register: CashRegister) => void
  onCancel: () => void
}

export function CashRegisterForm({ tenantId, branchId, userId, register, onSuccess, onCancel }: CashRegisterFormProps) {
  const [loading, setLoading] = useState(false)

  // Valores por defecto
  const defaultValues: Partial<CashRegisterFormValues> = {
    name: register?.name || "",
    description: register?.description || "",
    initialBalance: register?.initialBalance || 0,
    notes: register?.notes || "",
    isActive: register?.isActive !== undefined ? register.isActive : true,
  }

  const form = useForm<CashRegisterFormValues>({
    resolver: zodResolver(cashRegisterSchema),
    defaultValues,
  })

  const onSubmit = async (data: CashRegisterFormValues) => {
    try {
      setLoading(true)

      let result: CashRegister

      if (register) {
        // Actualizar caja existente
        result = await updateCashRegister(tenantId, branchId, register.id, data)
      } else {
        // Crear nueva caja
        result = await createCashRegister(tenantId, branchId, userId, data)
      }

      onSuccess(result)
    } catch (error) {
      console.error("Error al guardar caja:", error)
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Caja</FormLabel>
              <FormControl>
                <Input placeholder="Caja Principal" {...field} />
              </FormControl>
              <FormDescription>Nombre identificativo de la caja</FormDescription>
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
                <Textarea placeholder="Descripción opcional de la caja" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="initialBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Balance Inicial</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="1" {...field} disabled={!!register} />
              </FormControl>
              <FormDescription>
                {register
                  ? "El balance inicial no se puede modificar una vez creada la caja"
                  : "Monto con el que inicia la caja"}
              </FormDescription>
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
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Activa</FormLabel>
                <FormDescription>Determina si la caja está activa y disponible para su uso</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {register ? "Actualizar" : "Crear"} Caja
          </Button>
        </div>
      </form>
    </Form>
  )
}
