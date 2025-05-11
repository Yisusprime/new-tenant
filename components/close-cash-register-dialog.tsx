"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { closeCashRegister } from "@/lib/services/cash-register-service"
import { getOrdersByCashRegister } from "@/lib/services/order-service"
import { useAuth } from "@/lib/context/auth-context"
import { useCashRegister } from "@/lib/context/cash-register-context"
import { formatCurrency } from "@/lib/utils"

export function CloseCashRegisterDialog({
  tenantId,
  branchId,
  open,
  onOpenChange,
}: {
  tenantId: string
  branchId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { user } = useAuth()
  const { currentCashRegister, refreshCashRegister } = useCashRegister()
  const [finalAmount, setFinalAmount] = useState<string>("0")
  const [expectedAmount, setExpectedAmount] = useState<number>(0)
  const [difference, setDifference] = useState<number>(0)
  const [notes, setNotes] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  // Calcular el monto esperado cuando se abre el diálogo
  useEffect(() => {
    const calculateExpectedAmount = async () => {
      if (!currentCashRegister) return

      try {
        // Obtener todos los pedidos asociados a esta caja
        const orders = await getOrdersByCashRegister(tenantId, branchId, currentCashRegister.id)

        // Calcular el total de pagos en efectivo
        const cashPayments = orders
          .filter((order) => order.paymentMethod === "cash")
          .reduce((sum, order) => sum + (order.total || 0), 0)

        // El monto esperado es el monto inicial más los pagos en efectivo
        const expected = (currentCashRegister.initialAmount || 0) + cashPayments
        setExpectedAmount(expected)
        setFinalAmount(expected.toString())
      } catch (error) {
        console.error("Error al calcular el monto esperado:", error)
      }
    }

    if (open) {
      calculateExpectedAmount()
    }
  }, [open, currentCashRegister, tenantId, branchId])

  // Calcular la diferencia cuando cambia el monto final
  useEffect(() => {
    const final = Number.parseFloat(finalAmount)
    if (!isNaN(final)) {
      setDifference(final - expectedAmount)
    } else {
      setDifference(0)
    }
  }, [finalAmount, expectedAmount])

  const handleCloseCashRegister = async () => {
    if (!user || !currentCashRegister) {
      toast({
        title: "Error",
        description: "No se puede cerrar la caja",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const amount = Number.parseFloat(finalAmount)
      if (isNaN(amount) || amount < 0) {
        toast({
          title: "Error",
          description: "El monto final debe ser un número válido",
          variant: "destructive",
        })
        return
      }

      await closeCashRegister(tenantId, branchId, currentCashRegister.id, {
        finalAmount: amount,
        expectedAmount,
        closedBy: user.email || "Usuario desconocido",
        notes,
      })

      toast({
        title: "Caja cerrada",
        description: `Caja cerrada con un monto final de ${formatCurrency(amount)}`,
      })

      // Actualizar el estado de la caja
      await refreshCashRegister()

      // Cerrar el diálogo
      onOpenChange(false)
    } catch (error) {
      console.error("Error al cerrar la caja:", error)
      toast({
        title: "Error",
        description: "No se pudo cerrar la caja",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cerrar Caja</DialogTitle>
          <DialogDescription>Ingresa el monto final con el que cierras el día.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expectedAmount" className="text-right">
              Monto Esperado
            </Label>
            <div className="col-span-3">
              <Input
                id="expectedAmount"
                type="text"
                value={formatCurrency(expectedAmount)}
                disabled
                className="col-span-3 bg-gray-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="finalAmount" className="text-right">
              Monto Final
            </Label>
            <div className="col-span-3">
              <Input
                id="finalAmount"
                type="number"
                min="0"
                step="0.01"
                value={finalAmount}
                onChange={(e) => setFinalAmount(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="difference" className="text-right">
              Diferencia
            </Label>
            <div className="col-span-3">
              <Input
                id="difference"
                type="text"
                value={formatCurrency(difference)}
                disabled
                className={`col-span-3 ${
                  difference < 0
                    ? "bg-red-100 text-red-800"
                    : difference > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100"
                }`}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notas
            </Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales sobre el cierre de caja"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCloseCashRegister} disabled={loading}>
            {loading ? "Cerrando..." : "Cerrar Caja"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
