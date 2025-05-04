"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import { useOrderContext } from "./order-context"
import { useShiftContext } from "@/components/shifts/shift-context"
import { toast } from "sonner"

interface EndShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
  tenantId: string
}

export function EndShiftDialog({ open, onOpenChange, onComplete, tenantId }: EndShiftDialogProps) {
  const { orders, updateOrderStatus, refreshOrders } = useOrderContext()
  const { currentShift, endShift, refreshShifts, summary } = useShiftContext()
  const router = useRouter()

  const [isChecking, setIsChecking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeOrders, setActiveOrders] = useState<{
    pending: number
    preparing: number
    ready: number
    delivered: number
  }>({ pending: 0, preparing: 0, ready: 0, delivered: 0 })

  // Mejorar el manejo del cierre de turno para asegurar que se cierre correctamente

  // Añadir un estado para controlar si el turno se ha cerrado exitosamente
  const [shiftClosed, setShiftClosed] = useState(false)

  // Verificar pedidos activos cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      checkActiveOrders()
    }
  }, [open])

  const checkActiveOrders = async () => {
    setIsChecking(true)

    try {
      // Solo refrescar órdenes una vez al abrir
      await refreshOrders()

      // Contar pedidos por estado
      const counts = {
        pending: 0,
        preparing: 0,
        ready: 0,
        delivered: 0,
      }

      orders.forEach((order) => {
        if (order.status === "pending") counts.pending++
        if (order.status === "preparing") counts.preparing++
        if (order.status === "ready") counts.ready++
        if (order.status === "delivered") counts.delivered++
      })

      setActiveOrders(counts)
    } catch (error) {
      console.error("Error al verificar pedidos activos:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const hasActiveOrders = () => {
    return activeOrders.pending > 0 || activeOrders.preparing > 0 || activeOrders.ready > 0
  }

  // Modificar la función handleEndShift
  const handleEndShift = async () => {
    if (!currentShift) {
      toast({
        title: "Error",
        description: "No hay un turno activo para finalizar",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // 1. Completar pedidos entregados pendientes de completar
      const deliveredOrders = orders.filter((order) => order.status === "delivered")

      if (deliveredOrders.length > 0) {
        console.log(`Completando ${deliveredOrders.length} pedidos entregados`)

        // Procesar los pedidos uno por uno para evitar problemas
        for (const order of deliveredOrders) {
          try {
            await updateOrderStatus(order.id, "completed")
            console.log(`Pedido ${order.id} completado correctamente`)
          } catch (err) {
            console.error(`Error al completar pedido ${order.id}:`, err)
            // Continuamos con el siguiente pedido
          }
        }
      }

      // Cerrar el turno
      await endShift(currentShift.id, {
        totalOrders: summary.totalOrders,
        totalSales: summary.totalSales,
        cashSales: summary.cashSales,
        cardSales: summary.cardSales,
        otherSales: summary.otherSales,
      })

      // Marcar que el turno se ha cerrado exitosamente
      setShiftClosed(true)

      toast({
        title: "Turno finalizado",
        description: "El turno ha sido finalizado correctamente",
      })

      // Cerrar el diálogo y ejecutar la función onComplete
      onOpenChange(false)
      if (onComplete) {
        onComplete()
      }

      // 5. Redirigir a la página de cierre de caja
      router.push(`/admin/cashier?action=close`)
    } catch (error) {
      console.error("Error al finalizar el turno:", error)
      toast({
        title: "Error",
        description: `No se pudo finalizar el turno: ${error.message}`,
        variant: "destructive",
      })
      // No cerramos el diálogo para que el usuario pueda ver el error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Añadir un efecto para verificar si el turno sigue activo después de intentar cerrarlo
  useEffect(() => {
    if (shiftClosed && currentShift) {
      console.error("El turno sigue apareciendo como activo después de cerrarlo")
      // Forzar una actualización del estado
      refreshShifts()
    }
  }, [shiftClosed, currentShift, refreshShifts])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar Turno</DialogTitle>
          <DialogDescription>
            Verifica que todos los pedidos estén completados antes de finalizar el turno.
          </DialogDescription>
        </DialogHeader>

        {isChecking ? (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Verificando pedidos activos...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {hasActiveOrders() ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No se puede finalizar el turno</AlertTitle>
                <AlertDescription>
                  Tienes pedidos activos que necesitan ser completados:
                  <ul className="mt-2 list-disc pl-5">
                    {activeOrders.pending > 0 && <li>{activeOrders.pending} pedido(s) pendiente(s)</li>}
                    {activeOrders.preparing > 0 && <li>{activeOrders.preparing} pedido(s) en preparación</li>}
                    {activeOrders.ready > 0 && <li>{activeOrders.ready} pedido(s) listo(s) para entrega</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : activeOrders.delivered > 0 ? (
              <Alert className="border-yellow-500 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle>Pedidos entregados pendientes</AlertTitle>
                <AlertDescription>
                  Hay {activeOrders.delivered} pedido(s) entregado(s) que serán marcados como completados.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Listo para finalizar</AlertTitle>
                <AlertDescription>No hay pedidos activos. Puedes finalizar el turno.</AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-muted-foreground">
              <p>Al finalizar el turno:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Los pedidos entregados serán marcados como completados</li>
                <li>Serás redirigido a la página de cierre de caja</li>
                <li>Los pedidos completados y cancelados seguirán disponibles en el historial</li>
              </ul>
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleEndShift}
            disabled={isSubmitting || isChecking || hasActiveOrders()}
            className={isSubmitting ? "opacity-80" : ""}
          >
            {isSubmitting ? "Procesando..." : "Finalizar Turno"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
