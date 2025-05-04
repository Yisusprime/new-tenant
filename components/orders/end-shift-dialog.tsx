"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useShift } from "@/components/orders/shift-provider"
import { useToast } from "@/components/ui/use-toast"

interface EndShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
  tenantId: string
}

export function EndShiftDialog({ open, onOpenChange, onComplete, tenantId }: EndShiftDialogProps) {
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { currentShift, endShift } = useShift()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentShift) {
      toast({
        title: "Error",
        description: "No hay un turno activo para finalizar.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      await endShift(currentShift.id, {
        totalOrders: 0, // Estos valores deberían calcularse o recibirse como props
        totalSales: 0,
        cashSales: 0,
        cardSales: 0,
        otherSales: 0,
      })

      toast({
        title: "Turno finalizado",
        description: "El turno se ha finalizado correctamente.",
      })

      onOpenChange(false)

      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error("Error al finalizar turno:", error)
      toast({
        title: "Error",
        description: "No se pudo finalizar el turno. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar Turno</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">
              Notas de cierre (opcional)
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Añade notas sobre el cierre de este turno..."
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Finalizando..." : "Finalizar Turno"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
