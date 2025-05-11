"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { openCashRegister } from "@/lib/services/cash-register-service"
import { useAuth } from "@/lib/context/auth-context"
import { useCashRegister } from "@/lib/context/cash-register-context"
import { formatCurrency } from "@/lib/utils"

export function OpenCashRegisterDialog({
  tenantId,
  branchId,
  open,
  onOpenChange,
}: {
  tenantId: string
  branchId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { user } = useAuth()
  const { refreshCashRegister } = useCashRegister()
  const [initialAmount, setInitialAmount] = useState<string>("0")
  const [notes, setNotes] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const handleOpenCashRegister = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para abrir una caja",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const amount = Number.parseFloat(initialAmount)
      if (isNaN(amount) || amount < 0) {
        toast({
          title: "Error",
          description: "El monto inicial debe ser un número válido",
          variant: "destructive",
        })
        return
      }

      await openCashRegister(tenantId, branchId, {
        initialAmount: amount,
        openedBy: user.email || "Usuario desconocido",
        notes,
      })

      toast({
        title: "Caja abierta",
        description: `Caja abierta con un monto inicial de ${formatCurrency(amount)}`,
      })

      // Actualizar el estado de la caja
      await refreshCashRegister()

      // Cerrar el diálogo
      onOpenChange(false)
    } catch (error) {
      console.error("Error al abrir la caja:", error)
      toast({
        title: "Error",
        description: "No se pudo abrir la caja",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Abrir Caja</DialogTitle>
          <DialogDescription>Ingresa el monto inicial con el que comienzas el día.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="initialAmount" className="text-right">
              Monto Inicial
            </Label>
            <div className="col-span-3">
              <Input
                id="initialAmount"
                type="number"
                min="0"
                step="0.01"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notas
            </Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales sobre la apertura de caja"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleOpenCashRegister} disabled={loading}>
            {loading ? "Abriendo..." : "Abrir Caja"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
