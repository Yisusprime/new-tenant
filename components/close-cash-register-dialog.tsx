"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { closeCashRegister } from "@/lib/services/cash-register-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/context/auth-context"
import { useCashRegister } from "@/lib/context/cash-register-context"
import { formatCurrency } from "@/lib/utils"
import type { CashRegister } from "@/lib/types/cash-register"

const formSchema = z.object({
  finalAmount: z.coerce.number().min(0, "El monto final no puede ser negativo"),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface CloseCashRegisterDialogProps {
  tenantId: string
  branchId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (cashRegister: CashRegister) => void
}

export function CloseCashRegisterDialog({
  tenantId,
  branchId,
  open,
  onOpenChange,
  onSuccess,
}: CloseCashRegisterDialogProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const { currentCashRegister, refreshCashRegister } = useCashRegister()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      finalAmount: currentCashRegister?.initialAmount || 0,
      notes: "",
    },
  })

  // Actualizar el valor inicial cuando cambia el currentCashRegister
  useState(() => {
    if (currentCashRegister) {
      form.setValue("finalAmount", currentCashRegister.initialAmount)
    }
  })

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para realizar esta acción",
        variant: "destructive",
      })
      return
    }

    if (!currentCashRegister) {
      toast({
        title: "Error",
        description: "No hay una caja abierta para cerrar",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const closedCashRegister = await closeCashRegister(tenantId, branchId, currentCashRegister.id, user.uid, {
        finalAmount: data.finalAmount,
        notes: data.notes,
      })

      toast({
        title: "Caja cerrada",
        description: "La caja ha sido cerrada correctamente",
      })

      // Actualizar el contexto de la caja
      await refreshCashRegister()

      // Llamar al callback de éxito si existe
      if (onSuccess) {
        onSuccess(closedCashRegister)
      }

      // Cerrar el diálogo
      onOpenChange(false)
    } catch (error) {
      console.error("Error al cerrar la caja:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cerrar la caja",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cerrar Caja</DialogTitle>
          <DialogDescription>Ingresa el monto final con el que se cierra la caja.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {currentCashRegister && (
              <div className="grid grid-cols-2 gap-4 py-2">
                <div>
                  <p className="text-sm font-medium">Monto Inicial:</p>
                  <p className="text-lg font-semibold">{formatCurrency(currentCashRegister.initialAmount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Ventas en Efectivo:</p>
                  <p className="text-lg font-semibold">{formatCurrency(currentCashRegister.summary?.totalCash || 0)}</p>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="finalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto Final en Caja</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? 0 : Number.parseFloat(value))
                      }}
                    />
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
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notas adicionales sobre el cierre de caja" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Cerrando..." : "Cerrar Caja"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
