"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCashBox } from "@/lib/hooks/use-cash-box"
import { toast } from "@/components/ui/use-toast"
import type { CashBox } from "@/lib/types/cashier"
import { formatCurrency } from "@/lib/utils"

interface OpenCashBoxDialogProps {
  isOpen: boolean
  onClose: () => void
  cashBox: CashBox
  onSuccess?: () => void
}

export function OpenCashBoxDialog({ isOpen, onClose, cashBox, onSuccess }: OpenCashBoxDialogProps) {
  const [initialAmount, setInitialAmount] = useState(0)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { openCashBox } = useCashBox()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await openCashBox(cashBox.id, initialAmount, notes)

      toast({
        title: "Caja abierta",
        description: `La caja "${cashBox.name}" ha sido abierta con un monto inicial de ${formatCurrency(initialAmount)}.`,
      })

      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo abrir la caja. Inténtalo de nuevo.",
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
          <DialogTitle>Abrir caja: {cashBox.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="initialAmount">Monto inicial</Label>
              <Input
                id="initialAmount"
                type="number"
                min="0"
                step="0.01"
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number(e.target.value))}
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Añade notas o comentarios sobre la apertura de caja"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Abriendo..." : "Abrir caja"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
