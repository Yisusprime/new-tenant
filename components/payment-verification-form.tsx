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
import { verifyPayment } from "@/lib/services/cash-register-service"
import type { CashMovement, PaymentVerificationStatus } from "@/lib/types/cash-register"

// Esquema de validación
const paymentVerificationSchema = z.object({
  status: z.enum(["verified", "rejected", "pending"], {
    required_error: "El estado de verificación es obligatorio",
  }),
  notes: z.string().optional(),
  transactionId: z.string().optional(),
})

type PaymentVerificationFormValues = z.infer<typeof paymentVerificationSchema>

interface PaymentVerificationFormProps {
  tenantId: string
  branchId: string
  userId: string
  movement: CashMovement
  onSuccess: (updatedMovement: CashMovement) => void
  onCancel: () => void
}

export function PaymentVerificationForm({
  tenantId,
  branchId,
  userId,
  movement,
  onSuccess,
  onCancel,
}: PaymentVerificationFormProps) {
  const [loading, setLoading] = useState(false)

  // Valores por defecto
  const defaultValues: Partial<PaymentVerificationFormValues> = {
    status: movement.verificationStatus || "pending",
    notes: movement.verificationNotes || "",
    transactionId: movement.transactionId || "",
  }

  const form = useForm<PaymentVerificationFormValues>({
    resolver: zodResolver(paymentVerificationSchema),
    defaultValues,
  })

  const onSubmit = async (data: PaymentVerificationFormValues) => {
    try {
      setLoading(true)

      const result = await verifyPayment(tenantId, branchId, userId, movement.id, {
        status: data.status,
        notes: data.notes,
        transactionId: data.transactionId,
      })

      onSuccess(result)
    } catch (error) {
      console.error("Error al verificar pago:", error)
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setLoading(false)
    }
  }

  // Opciones para los estados de verificación
  const verificationStatuses: { value: PaymentVerificationStatus; label: string }[] = [
    { value: "verified", label: "Verificado" },
    { value: "rejected", label: "Rechazado" },
    { value: "pending", label: "Pendiente" },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <h3 className="font-medium mb-2">Información del pago</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Método:</span>
              <span className="ml-2 font-medium">
                {movement.paymentMethod === "transfer"
                  ? "Transferencia"
                  : movement.paymentMethod === "card"
                    ? "Tarjeta"
                    : movement.paymentMethod}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Monto:</span>
              <span className="ml-2 font-medium">${movement.amount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Referencia:</span>
              <span className="ml-2 font-medium">{movement.reference || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-500">Fecha:</span>
              <span className="ml-2 font-medium">{new Date(movement.createdAt).toLocaleString()}</span>
            </div>
            {movement.orderNumber && (
              <div className="col-span-2">
                <span className="text-gray-500">Orden:</span>
                <span className="ml-2 font-medium">{movement.orderNumber}</span>
              </div>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado de Verificación</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {verificationStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Estado actual de verificación del pago</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transactionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID de Transacción</FormLabel>
              <FormControl>
                <Input placeholder="Número de transacción o comprobante" {...field} />
              </FormControl>
              <FormDescription>Identificador único de la transacción (opcional)</FormDescription>
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
                <Textarea placeholder="Observaciones sobre la verificación" {...field} />
              </FormControl>
              <FormDescription>Información adicional sobre la verificación</FormDescription>
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
            Guardar Verificación
          </Button>
        </div>
      </form>
    </Form>
  )
}
