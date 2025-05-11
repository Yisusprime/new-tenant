"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCashBox } from "@/lib/hooks/use-cash-box"
import { toast } from "@/components/ui/use-toast"
import type { CashBox } from "@/lib/types/cashier"
import { formatCurrency } from "@/lib/utils"

interface CloseCashBoxDialogProps {
  isOpen: boolean
  onClose: () => void
  cashBox: CashBox
  onSuccess?: () => void
}

export function CloseCashBoxDialog({ isOpen, onClose, cashBox, onSuccess }: CloseCashBoxDialogProps) {
  const [finalAmount, setFinalAmount] = useState(cashBox.expectedAmount)
  const [difference, setDifference] = useState(0)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { closeCashBox } = useCashBox()

  useEffect(() => {
    setDifference(finalAmount - cashBox.expectedAmount)
  }, [finalAmount, cashBox.expectedAmount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await closeCashBox(cashBox.id, finalAmount, notes)

      toast({
        title: "Caja cerrada",
        description: `La caja "${cashBox.name}" ha sido cerrada con un monto final de ${formatCurrency(finalAmount)}.`,
      })

      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo cerrar la caja. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cerrar caja: {cashBox.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Monto esperado</Label>
              <div className="p-2 bg-muted rounded-md text-center font-medium">
                {formatCurrency(cashBox.expectedAmount)}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="finalAmount">Monto final (real en caja)</Label>
              <Input
                id="finalAmount"
                type="number"
                min="0"
                step="0.01"
                value={finalAmount}
                onChange={(e) => setFinalAmount(Number(e.target.value))}
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Diferencia</Label>
              <div
                className={`p-2 rounded-md text-center font-medium ${
                  difference < 0
                    ? "bg-red-100 text-red-700"
                    : difference > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-muted"
                }`}
              >
                {formatCurrency(difference)}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Añade notas o comentarios sobre el cierre de caja"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Cerrando..." : "Cerrar caja"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
