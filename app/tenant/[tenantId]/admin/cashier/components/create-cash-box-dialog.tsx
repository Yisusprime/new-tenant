"use client"

import type React from "react"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCashBox } from "@/lib/hooks/use-cash-box"
import { toast } from "@/components/ui/use-toast"
import { useBranch } from "@/lib/context/branch-context"

interface CreateCashBoxDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateCashBoxDialog({ isOpen, onClose, onSuccess }: CreateCashBoxDialogProps) {
  const params = useParams<{ tenantId: string }>()
  const urlTenantId = params?.tenantId
  const { currentBranch } = useBranch()
  const { createCashBox, tenantId: contextTenantId } = useCashBox()

  // Usar el tenantId de la URL si está disponible, de lo contrario usar el del contexto
  const tenantId = urlTenantId || contextTenantId

  const [name, setName] = useState("Caja Principal")
  const [initialAmount, setInitialAmount] = useState(0)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!currentBranch) {
      setError("No hay sucursal seleccionada")
      setIsLoading(false)
      return
    }

    if (!tenantId) {
      setError("No se pudo identificar el tenant")
      console.error("No hay tenantId disponible", { urlTenantId, contextTenantId })
      setIsLoading(false)
      return
    }

    try {
      console.log("Intentando crear caja con datos:", {
        name,
        initialAmount,
        notes,
        tenantId,
        branchId: currentBranch.id,
      })

      await createCashBox({
        name,
        initialAmount,
        notes,
      })

      toast({
        title: "Caja creada",
        description: `La caja "${name}" ha sido creada exitosamente.`,
      })

      onSuccess?.()
      onClose()
    } catch (err: any) {
      console.error("Error al crear caja:", err)
      setError(err.message || "No se pudo crear la caja. Inténtalo de nuevo.")
      toast({
        title: "Error",
        description: err.message || "No se pudo crear la caja. Inténtalo de nuevo.",
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
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales sobre esta caja"
                rows={3}
              />
            </div>

            {error && <div className="text-sm text-red-500 mt-2">{error}</div>}

            {/* Información de depuración - solo visible en desarrollo */}
            {process.env.NODE_ENV !== "production" && (
              <div className="text-xs bg-yellow-50 p-2 rounded">
                <p>Depuración:</p>
                <p>tenantId: {tenantId || "no disponible"}</p>
                <p>urlTenantId: {urlTenantId || "no disponible"}</p>
                <p>contextTenantId: {contextTenantId || "no disponible"}</p>
                <p>branchId: {currentBranch?.id || "no disponible"}</p>
              </div>
            )}
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
