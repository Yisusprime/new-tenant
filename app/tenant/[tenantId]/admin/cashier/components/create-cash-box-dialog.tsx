"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCashBox } from "@/lib/hooks/use-cash-box"
import { toast } from "@/components/ui/use-toast"

interface CreateCashBoxDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateCashBoxDialog({ isOpen, onClose, onSuccess }: CreateCashBoxDialogProps) {
  const [name, setName] = useState("Caja Principal")
  const [initialAmount, setInitialAmount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { createCashBox } = useCashBox()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createCashBox({
        name,
        initialAmount,
      })

      toast({
        title: "Caja creada",
        description: `La caja "${name}" ha sido creada exitosamente.`,
      })

      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la caja. Inténtalo de nuevo.",
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
          <DialogTitle>Crear nueva caja</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre de la caja</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Caja Principal"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="initialAmount">Monto inicial (opcional)</Label>
              <Input
                id="initialAmount"
                type="number"
                min="0"
                step="0.01"
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number(e.target.value))}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear caja"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
