"use client"

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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useShiftContext } from "./shift-context"
import { useToast } from "@/components/ui/use-toast"

interface StartShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
  tenantId: string
}

export function StartShiftDialog({ open, onOpenChange, onComplete, tenantId }: StartShiftDialogProps) {
  const { startShift, loading } = useShiftContext()
  const { toast } = useToast()
  const [notes, setNotes] = useState("")

  const handleStartShift = async () => {
    try {
      if (!tenantId) {
        throw new Error("ID de inquilino no válido")
      }

      await startShift({
        notes,
        startTime: Date.now(),
      })

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
        variant: "destructive",
        title: "Error",
        description: "No se pudo iniciar el turno. Por favor, inténtalo de nuevo.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Iniciar Turno</DialogTitle>
          <DialogDescription>
            Inicia un nuevo turno para comenzar a recibir pedidos. Después de iniciar el turno, se te pedirá abrir caja.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Añade notas sobre este turno..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleStartShift} disabled={loading}>
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                Iniciando...
              </>
            ) : (
              "Iniciar Turno"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
