"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { closeCashRegister } from "@/lib/services/cash-register-service"
import { formatCurrency } from "@/lib/utils"
import type { CashRegister, CashRegisterSummary } from "@/lib/types/cash-register"

// Esquema de validación
const cashRegisterCloseSchema = z.object({
  actualBalance: z.coerce.number().min(0, "El balance final debe ser mayor o igual a cero"),
  notes: z.string().optional(),
})

type CashRegisterCloseFormValues = z.infer<typeof cashRegisterCloseSchema>

interface CashRegisterCloseFormProps {
  tenantId: string
  branchId: string
  userId: string
  register: CashRegister
  summary: CashRegisterSummary
  onSuccess: (register: CashRegister) => void
  onCancel: () => void
}

export function CashRegisterCloseForm({
  tenantId,
  branchId,
  userId,
  register,
  summary,
  onSuccess,
  onCancel,
}: CashRegisterCloseFormProps) {
  const [loading, setLoading] = useState(false)

  // Valores por defecto
  const defaultValues: Partial<CashRegisterCloseFormValues> = {
    actualBalance: summary.expectedBalance,
    notes: "",
  }

  const form = useForm<CashRegisterCloseFormValues>({
    resolver: zodResolver(cashRegisterCloseSchema),
    defaultValues,
  })

  const watchActualBalance = form.watch("actualBalance")
  const difference = (watchActualBalance || 0) - summary.expectedBalance

  const onSubmit = async (data: CashRegisterCloseFormValues) => {
    try {
      setLoading(true)

      const result = await closeCashRegister(tenantId, branchId, register.id, userId, {
        actualBalance: data.actualBalance,
        notes: data.notes,
      })

      onSuccess(result)
    } catch (error) {
      console.error("Error al cerrar caja:", error)
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-sm text-gray-500">Balance Inicial</h3>
            <p className="text-lg font-semibold">{formatCurrency(register.initialBalance)}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Balance Esperado</h3>
            <p className="text-lg font-semibold">{formatCurrency(summary.expectedBalance)}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Total Ingresos</h3>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(summary.totalIncome + summary.totalSales + summary.totalDeposits)}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Total Egresos</h3>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(summary.totalExpense + summary.totalRefunds + summary.totalWithdrawals)}
            </p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="actualBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Balance Final Real</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="1" {...field} />
              </FormControl>
              <FormDescription>Ingrese el monto real contado al cierre de caja</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {difference !== 0 && (
          <div className={`p-4 rounded-lg ${difference > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            <p className="font-medium">
              {difference > 0 ? "Sobrante" : "Faltante"}: {formatCurrency(Math.abs(difference))}
            </p>
            <p className="text-sm mt-1">
              {difference > 0
                ? "Hay más dinero del esperado en la caja."
                : "Falta dinero en la caja respecto a lo esperado."}
            </p>
          </div>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas de Cierre</FormLabel>
              <FormControl>
                <Textarea placeholder="Observaciones sobre el cierre de caja" {...field} />
              </FormControl>
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
            Cerrar Caja
          </Button>
        </div>
      </form>
    </Form>
  )
}
