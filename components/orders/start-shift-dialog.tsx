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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useShiftContext } from "./shift-context"

interface StartShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
  tenantId: string
}

export function StartShiftDialog({ open, onOpenChange, onComplete, tenantId }: StartShiftDialogProps) {
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { startShift } = useShiftContext()
  const { toast } = useToast()

  const handleStartShift = async () => {
    try {
      setIsSubmitting(true)

      // Iniciar turno
      await startShift({
        notes,
      })

      toast({
        title: "Turno iniciado",
        description: "El turno se ha iniciado correctamente.",
      })

      onOpenChange(false)

      // Llamar al callback si existe
      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error("Error al iniciar turno:", error)
      toast({
        title: "Error",
        description: "No se pudo iniciar el turno. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar Turno</DialogTitle>
          <DialogDescription>
            Estás a punto de iniciar un nuevo turno. Después de iniciar el turno, podrás comenzar a recibir pedidos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Notas adicionales (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleStartShift} disabled={isSubmitting}>
            {isSubmitting ? "Iniciando..." : "Iniciar Turno"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
