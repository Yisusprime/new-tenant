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
import { Textarea } from "@/components/ui/textarea"
import { useShift } from "./shift-provider"
import { useOrderContext } from "./order-context"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ref, get, query, orderByChild, equalTo } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"

interface EndShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EndShiftDialog({ open, onOpenChange }: EndShiftDialogProps) {
  const { currentShift, endShift } = useShift()
  const { orders, refreshOrders } = useOrderContext()
  const { user, tenantId } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verificar que tenantId esté disponible
  useEffect(() => {
    if (open && !tenantId) {
      console.error("No tenantId available in EndShiftDialog")
      toast({
        title: "Error",
        description: "No se pudo identificar el inquilino. Por favor, recarga la página.",
        variant: "destructive",
      })
    }
  }, [open, tenantId, toast])

  const handleEndShift = async () => {
    if (!currentShift) return
    if (!tenantId) {
      setError("No se pudo identificar el inquilino. Por favor, recarga la página.")
      toast({
        title: "Error",
        description: "No se pudo identificar el inquilino. Por favor, recarga la página.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      console.log("Calculando resumen de ventas para el turno antes de cerrarlo...")
      console.log("TenantId disponible:", tenantId)

      // Calcular resumen de ventas
      const summary = await calculateShiftSummary(currentShift.id)
      console.log("Resumen calculado:", summary)

      // Finalizar el turno con el resumen calculado
      await endShift(currentShift.id, summary)

      // Actualizar órdenes
      await refreshOrders()

      // Cerrar el diálogo
      onOpenChange(false)

      // Mostrar mensaje de éxito
      toast({
        title: "Turno finalizado",
        description: "El turno se ha finalizado correctamente.",
      })

      // Redirigir a la página de caja para cerrar la sesión
      router.push("/admin/cashier?action=close")
    } catch (err) {
      console.error("Error al finalizar el turno:", err)
      const errorMessage = err instanceof Error ? err.message : "Error al finalizar el turno"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para calcular el resumen de ventas de un turno
  const calculateShiftSummary = async (shiftId: string) => {
    try {
      console.log(`Calculando resumen para el turno ${shiftId}...`)

      if (!tenantId) {
        console.error("No tenantId provided in calculateShiftSummary")
        throw new Error("No se pudo identificar el inquilino")
      }

      // Obtener todas las órdenes del turno
      const ordersRef = ref(rtdb, `tenants/${tenantId}/orders`)
      const ordersQuery = query(ordersRef, orderByChild("shiftId"), equalTo(shiftId))
      const ordersSnapshot = await get(ordersQuery)

      let totalOrders = 0
      let totalSales = 0
      let cashSales = 0
      let cardSales = 0
      let otherSales = 0

      if (ordersSnapshot.exists()) {
        const ordersData = ordersSnapshot.val()
        console.log(`Encontradas ${Object.keys(ordersData).length} órdenes para el turno ${shiftId}`)

        // Procesar cada orden
        Object.values(ordersData).forEach((order: any) => {
          // Solo contar órdenes completadas
          if (order.status === "completed") {
            totalOrders++

            // Asegurarse de que el total sea un número
            const orderTotal = Number.parseFloat(String(order.total)) || 0
            totalSales += orderTotal

            // Clasificar por método de pago
            switch (order.paymentMethod) {
              case "cash":
                cashSales += orderTotal
                break
              case "card":
                cardSales += orderTotal
                break
              default:
                otherSales += orderTotal
                break
            }
          }
        })
      } else {
        console.log(`No se encontraron órdenes específicas para el turno ${shiftId}`)
      }

      // Si no hay órdenes específicas del turno, buscar todas las órdenes y filtrar por tiempo
      if (totalOrders === 0) {
        console.log("Buscando órdenes por rango de tiempo...")

        // Obtener el turno para conocer su rango de tiempo
        const shiftRef = ref(rtdb, `tenants/${tenantId}/shifts/${shiftId}`)
        const shiftSnapshot = await get(shiftRef)

        if (shiftSnapshot.exists()) {
          const shift = shiftSnapshot.val()
          const startTime = shift.startTime
          const endTime = shift.endTime || Date.now()

          // Obtener todas las órdenes
          const allOrdersRef = ref(rtdb, `tenants/${tenantId}/orders`)
          const allOrdersSnapshot = await get(allOrdersRef)

          if (allOrdersSnapshot.exists()) {
            const allOrdersData = allOrdersSnapshot.val()
            console.log(`Filtrando ${Object.keys(allOrdersData).length} órdenes por rango de tiempo...`)

            // Filtrar órdenes por rango de tiempo
            Object.values(allOrdersData).forEach((order: any) => {
              if (order.status !== "completed") return

              // Convertir timestamp si es necesario
              const orderTime =
                typeof order.createdAt === "object" && order.createdAt.toDate
                  ? order.createdAt.toDate().getTime()
                  : Number(order.createdAt)

              // Verificar si la orden está dentro del rango de tiempo del turno
              if (orderTime >= startTime && orderTime <= endTime) {
                totalOrders++

                // Asegurarse de que el total sea un número
                const orderTotal = Number.parseFloat(String(order.total)) || 0
                totalSales += orderTotal

                // Clasificar por método de pago
                switch (order.paymentMethod) {
                  case "cash":
                    cashSales += orderTotal
                    break
                  case "card":
                    cardSales += orderTotal
                    break
                  default:
                    otherSales += orderTotal
                    break
                }
              }
            })
          }
        }
      }

      // Usar las órdenes en memoria como respaldo
      if (totalOrders === 0 && orders.length > 0) {
        console.log("Usando órdenes en memoria como respaldo...")

        // Filtrar órdenes completadas del turno actual
        const completedOrders = orders.filter((order) => order.status === "completed" && order.shiftId === shiftId)

        totalOrders = completedOrders.length

        completedOrders.forEach((order) => {
          const orderTotal = Number.parseFloat(String(order.total)) || 0
          totalSales += orderTotal

          switch (order.paymentMethod) {
            case "cash":
              cashSales += orderTotal
              break
            case "card":
              cardSales += orderTotal
              break
            default:
              otherSales += orderTotal
              break
          }
        })
      }

      console.log(`Resumen calculado: ${totalOrders} órdenes, ${totalSales} ventas totales`)

      return {
        totalOrders,
        totalSales,
        cashSales,
        cardSales,
        otherSales,
      }
    } catch (error) {
      console.error("Error calculando resumen del turno:", error)
      // Devolver valores por defecto en caso de error
      return {
        totalOrders: 0,
        totalSales: 0,
        cashSales: 0,
        cardSales: 0,
        otherSales: 0,
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar Turno</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas finalizar el turno actual? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notas (opcional)
            </label>
            <Textarea
              id="notes"
              placeholder="Añade notas o comentarios sobre este turno"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleEndShift} disabled={isSubmitting || !tenantId}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finalizando...
              </>
            ) : (
              "Finalizar Turno"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
