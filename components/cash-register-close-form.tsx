"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { closeCashRegister, getCashRegisterSummary } from "@/lib/services/cash-register-service"
import { formatCurrency } from "@/lib/utils"
import type { CashRegister, CashRegisterSummary } from "@/lib/types/cash-register"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

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
  const [error, setError] = useState<string | null>(null)
  const [localSummary, setLocalSummary] = useState<CashRegisterSummary | null>(summary)

  // Cargar el resumen si no se proporciona
  useEffect(() => {
    const loadSummary = async () => {
      if (!summary && register) {
        try {
          const data = await getCashRegisterSummary(tenantId, branchId, register.id)
          setLocalSummary(data)
        } catch (err) {
          console.error("Error al cargar resumen:", err)
          setError("No se pudo cargar el resumen de caja. Por favor, intente nuevamente.")
        }
      }
    }

    loadSummary()
  }, [tenantId, branchId, register, summary])

  // Valores por defecto
  const defaultValues: Partial<CashRegisterCloseFormValues> = {
    actualBalance: localSummary?.expectedBalance || register?.currentBalance || 0,
    notes: "",
  }

  const form = useForm<CashRegisterCloseFormValues>({
    resolver: zodResolver(cashRegisterCloseSchema),
    defaultValues,
  })

  // Actualizar los valores por defecto cuando cambia el resumen
  useEffect(() => {
    if (localSummary) {
      form.setValue("actualBalance", localSummary.expectedBalance)
    }
  }, [localSummary, form])

  const watchActualBalance = form.watch("actualBalance")
  const difference = (watchActualBalance || 0) - (localSummary?.expectedBalance || 0)

  const onSubmit = async (data: CashRegisterCloseFormValues) => {
    try {
      setLoading(true)
      setError(null)

      if (!register || !userId) {
        throw new Error("Faltan datos necesarios para cerrar la caja")
      }

      const result = await closeCashRegister(tenantId, branchId, register.id, userId, {
        actualBalance: data.actualBalance,
        notes: data.notes,
      })

      onSuccess(result)
    } catch (err) {
      console.error("Error al cerrar caja:", err)
      setError(err instanceof Error ? err.message : "Error desconocido al cerrar la caja")
    } finally {
      setLoading(false)
    }
  }

  // Si no tenemos los datos necesarios, mostrar un mensaje de error
  if (!register || (!summary && !localSummary)) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No se pudieron cargar los datos necesarios para cerrar la caja. Por favor, intente nuevamente.
        </AlertDescription>
      </Alert>
    )
  }

  const summaryData = localSummary || summary

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-sm text-gray-500">Balance Inicial</h3>
            <p className="text-lg font-semibold">{formatCurrency(register.initialBalance)}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Balance Esperado</h3>
            <p className="text-lg font-semibold">{formatCurrency(summaryData.expectedBalance)}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Total Ingresos</h3>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(summaryData.totalIncome + summaryData.totalSales + summaryData.totalDeposits)}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Total Egresos</h3>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(summaryData.totalExpense + summaryData.totalRefunds + summaryData.totalWithdrawals)}
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
                <Input type="number" min="0" step="0.01" {...field} />
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
