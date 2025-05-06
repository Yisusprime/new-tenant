"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useShift } from "@/components/orders/shift-provider"
import { useToast } from "@/components/ui/use-toast"

interface StartShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
  tenantId: string
}

export function StartShiftDialog({ open, onOpenChange, onComplete, tenantId }: StartShiftDialogProps) {
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { startShift } = useShift()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      await startShift({ notes })

      toast({
        title: "Turno iniciado",
        description: "El turno se ha iniciado correctamente.",
      })

      onOpenChange(false)

      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error("Error al iniciar turno:", error)
      toast({
        title: "Error",
        description: "No se pudo iniciar el turno. Por favor, inténtalo de nuevo.",
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
          <DialogTitle>Iniciar Turno</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">
              Notas (opcional)
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Añade notas sobre este turno..."
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Iniciando..." : "Iniciar Turno"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
