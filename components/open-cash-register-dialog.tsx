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
import { openCashRegister } from "@/lib/services/cash-register-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/context/auth-context"
import { useCashRegister } from "@/lib/context/cash-register-context"

const formSchema = z.object({
  initialAmount: z.coerce.number().min(0, "El monto inicial no puede ser negativo"),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface OpenCashRegisterDialogProps {
  tenantId: string
  branchId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OpenCashRegisterDialog({ tenantId, branchId, open, onOpenChange }: OpenCashRegisterDialogProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const { refreshCashRegister } = useCashRegister()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialAmount: 0,
      notes: "",
    },
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

    try {
      setIsSubmitting(true)
      await openCashRegister(tenantId, branchId, user.uid, {
        initialAmount: data.initialAmount,
        notes: data.notes,
      })

      toast({
        title: "Caja abierta",
        description: "La caja ha sido abierta correctamente",
      })

      // Actualizar el contexto de la caja
      await refreshCashRegister()

      // Cerrar el diálogo
      onOpenChange(false)
    } catch (error) {
      console.error("Error al abrir la caja:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al abrir la caja",
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
          <DialogTitle>Abrir Caja</DialogTitle>
          <DialogDescription>Ingresa el monto inicial con el que se abre la caja.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="initialAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto Inicial</FormLabel>
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
                    <Textarea placeholder="Notas adicionales sobre la apertura de caja" {...field} />
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
                {isSubmitting ? "Abriendo..." : "Abrir Caja"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
