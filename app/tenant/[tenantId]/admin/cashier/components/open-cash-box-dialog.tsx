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

interface OpenCashBoxDialogProps {
  isOpen: boolean
  onClose: () => void
  cashBox: CashBox
  onSuccess?: () => void
}

export function OpenCashBoxDialog({ isOpen, onClose, cashBox, onSuccess }: OpenCashBoxDialogProps) {
  const [initialAmount, setInitialAmount] = useState<number>(0)
  const [notes, setNotes] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { openCashBox } = useCashBox()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (initialAmount <= 0) {
      toast({
        title: "Error",
        description: "El monto inicial debe ser mayor a cero",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await openCashBox(cashBox.id, initialAmount, notes)
      toast({
        title: "Caja abierta",
        description: "La caja ha sido abierta correctamente",
      })
      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al abrir la caja",
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
          <DialogTitle>Abrir Caja</DialogTitle>
          <DialogDescription>Ingresa el monto inicial con el que abrirás la caja {cashBox.name}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="initialAmount" className="text-right">
                Monto inicial
              </Label>
              <Input
                id="initialAmount"
                type="number"
                step="0.01"
                min="0"
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number.parseFloat(e.target.value) || 0)}
                className="col-span-3"
                required
              />
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
              {isLoading ? "Abriendo..." : "Abrir Caja"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
