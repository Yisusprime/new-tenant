"use client"

import type React from "react"

import { useState } from "react"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CashBox } from "@/lib/types/cashier"
import { useCashBox } from "@/lib/hooks/use-cash-box"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"

interface CloseCashBoxDialogProps {
  isOpen: boolean
  onClose: () => void
  cashBox: CashBox
  onSuccess?: () => void
}

export function CloseCashBoxDialog({ isOpen, onClose, cashBox, onSuccess }: CloseCashBoxDialogProps) {
  const [finalAmount, setFinalAmount] = useState<number>(cashBox.expectedAmount || 0)
  const [notes, setNotes] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { closeCashBox } = useCashBox()

  const difference = finalAmount - (cashBox.expectedAmount || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (finalAmount < 0) {
      toast({
        title: "Error",
        description: "El monto final no puede ser negativo",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await closeCashBox(cashBox.id, finalAmount, notes)
      toast({
        title: "Caja cerrada",
        description: "La caja ha sido cerrada correctamente",
      })
      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al cerrar la caja",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cerrar Caja</DialogTitle>
          <DialogDescription>Ingresa el monto final con el que cerrarás la caja {cashBox.name}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expectedAmount" className="text-right">
                Monto esperado
              </Label>
              <div className="col-span-3">
                <Input
                  id="expectedAmount"
                  type="text"
                  value={formatCurrency(cashBox.expectedAmount || 0)}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="finalAmount" className="text-right">
                Monto final
              </Label>
              <Input
                id="finalAmount"
                type="number"
                step="0.01"
                min="0"
                value={finalAmount}
                onChange={(e) => setFinalAmount(Number.parseFloat(e.target.value) || 0)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="difference" className="text-right">
                Diferencia
              </Label>
              <div className="col-span-3">
                <Input
                  id="difference"
                  type="text"
                  value={formatCurrency(difference)}
                  disabled
                  className={`bg-muted ${difference < 0 ? "text-red-500" : difference > 0 ? "text-green-500" : ""}`}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notas
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder="Notas adicionales (opcional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Cerrando..." : "Cerrar Caja"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
