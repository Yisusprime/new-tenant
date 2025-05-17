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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { createCashRegister } from "@/lib/services/cash-register-service"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/components/ui/use-toast"

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
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { user } = useAuth()

  const handleSubmit = async () => {
    // Validar campos
    const newErrors: Record<string, string> = {}
    if (!name.trim()) {
      newErrors.name = "El nombre de la caja es obligatorio"
    }

    const balance = Number.parseFloat(initialBalance)
    if (isNaN(balance) || balance < 0) {
      newErrors.initialBalance = "El saldo inicial debe ser un número válido mayor o igual a cero"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (!user) {
      toast({
        title: "Error",
        description: "Debe iniciar sesión para crear una caja",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await createCashRegister(tenantId, branchId, user.uid, {
        name,
        initialBalance: balance,
        isActive: true,
      })

      toast({
        title: "Caja abierta",
        description: "La caja se ha abierto correctamente",
        variant: "default",
      })

      resetForm()
      onCashRegisterCreated()
    } catch (error) {
      console.error("Error al crear caja:", error)
      toast({
        title: "Error",
        description: "No se pudo abrir la caja. Inténtelo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName("Caja Principal")
    setInitialBalance("0")
    setErrors({})
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm()
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Abrir Caja</DialogTitle>
          <DialogDescription>
            Complete la información para abrir una nueva caja y comenzar a recibir pedidos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Nombre de la caja"
            />
            {errors.name && <p className="text-red-500 text-sm col-span-3 col-start-2">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="initialBalance" className="text-right">
              Saldo Inicial
            </Label>
            <Input
              id="initialBalance"
              type="number"
              min="0"
              step="0.01"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="col-span-3"
              placeholder="0.00"
            />
            {errors.initialBalance && (
              <p className="text-red-500 text-sm col-span-3 col-start-2">{errors.initialBalance}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
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
      </DialogContent>
    </Dialog>
  )
}
