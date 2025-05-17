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
import { createCashRegister } from "@/lib/services/cash-register-service"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface OpenCashRegisterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  branchId: string
  onCashRegisterCreated: () => void
}

export function OpenCashRegisterDialog({
  open,
  onOpenChange,
  tenantId,
  branchId,
  onCashRegisterCreated,
}: OpenCashRegisterDialogProps) {
  const [name, setName] = useState("Caja Principal")
  const [initialBalance, setInitialBalance] = useState("0")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "Debe iniciar sesión para abrir una caja",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      await createCashRegister(tenantId, branchId, user.uid, {
        name,
        initialBalance: Number.parseFloat(initialBalance) || 0,
        notes,
        isActive: true,
      })

      toast({
        title: "Caja abierta",
        description: "La caja se ha abierto correctamente",
      })

      onCashRegisterCreated()
    } catch (error) {
      console.error("Error al abrir caja:", error)
      toast({
        title: "Error",
        description: "No se pudo abrir la caja",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir Caja</DialogTitle>
          <DialogDescription>
            Complete la información para abrir una nueva caja y comenzar a recibir pedidos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Caja</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialBalance">Saldo Inicial</Label>
            <Input
              id="initialBalance"
              type="number"
              min="0"
              step="0.01"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales sobre la apertura de caja"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Abriendo...
                </>
              ) : (
                "Abrir Caja"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
