"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react"
import { useCashier } from "./cashier-context"
import { formatCurrency } from "@/lib/utils"
import { OrderSummaryByPayment } from "./order-summary-by-payment"
import { ref, get } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"
import { useShift } from "../orders/shift-provider"

export function CloseSessionForm() {
  const { currentSession, closeSession } = useCashier()
  const { tenantId } = useAuth()
  const { shifts } = useShift()
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromOrders = searchParams.get("action") === "close"

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [orderSummary, setOrderSummary] = useState<{
    cashTotal: number
    cardTotal: number
    transferTotal: number
    otherTotal: number
  }>({
    cashTotal: 0,
    cardTotal: 0,
    transferTotal: 0,
    otherTotal: 0,
  })

  const [formData, setFormData] = useState({
    cashAmount: 0,
    cardAmount: 0,
    transferAmount: 0,
    otherAmount: 0,
    notes: "",
  })

  // Cargar resumen de órdenes cuando se monta el componente
  useEffect(() => {
    const loadOrderSummary = async () => {
      if (!currentSession || !tenantId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log("Loading orders for session:", currentSession.id)

        // Buscar el turno más reciente que se cerró (debería ser el que acabamos de cerrar)
        const recentClosedShift = shifts
          .filter((shift) => shift.status === "closed")
          .sort((a, b) => (b.endTime || 0) - (a.endTime || 0))[0]

        console.log("Recent closed shift:", recentClosedShift)

        let cashTotal = 0
        let cardTotal = 0
        let transferTotal = 0
        let otherTotal = 0

        // Si encontramos un turno cerrado reciente, usar su resumen
        if (recentClosedShift && recentClosedShift.summary) {
          console.log("Using summary from recent closed shift:", recentClosedShift.summary)

          cashTotal = recentClosedShift.summary.cashSales || 0
          cardTotal = recentClosedShift.summary.cardSales || 0
          otherTotal = recentClosedShift.summary.otherSales || 0
        } else {
          // Si no hay resumen en el turno, buscar órdenes manualmente
          console.log("No summary found in shift, fetching orders manually")

          // Obtener los pedidos del tenant
          const ordersRef = ref(rtdb, `tenants/${tenantId}/orders`)
          const ordersSnapshot = await get(ordersRef)

          if (!ordersSnapshot.exists()) {
            console.log("No orders found in database")
            setOrderSummary({
              cashTotal: 0,
              cardTotal: 0,
              transferTotal: 0,
              otherTotal: 0,
            })
            setIsLoading(false)
            return
          }

          const ordersData = ordersSnapshot.val()
          console.log(`Found ${Object.keys(ordersData).length} orders total in database`)

          // Filtrar los pedidos completados
          const sessionOrders = Object.entries(ordersData)
            .map(([id, order]) => ({ id, ...(order as any) }))
            .filter((order: any) => {
              // Solo incluir pedidos completados
              if (order.status !== "completed") {
                return false
              }

              // Convertir timestamp si es necesario
              const orderTime =
                typeof order.createdAt === "object" && order.createdAt.toDate
                  ? order.createdAt.toDate().getTime()
                  : Number(order.createdAt)

              // Verificar si la orden está dentro del rango de tiempo de la sesión
              const belongsToSession =
                orderTime >= currentSession.startTime &&
                (!currentSession.endTime || orderTime <= currentSession.endTime)

              return belongsToSession
            })

          console.log(`Found ${sessionOrders.length} completed orders for this session`)

          // Calcular los totales por método de pago
          sessionOrders.forEach((order: any) => {
            // Asegurarse de que el total sea un número
            const orderTotal = Number.parseFloat(String(order.total)) || 0

            switch (order.paymentMethod) {
              case "cash":
                cashTotal += orderTotal
                break
              case "card":
                cardTotal += orderTotal
                break
              case "transfer":
                transferTotal += orderTotal
                break
              default:
                otherTotal += orderTotal
                break
            }
          })
        }

        const summary = {
          cashTotal,
          cardTotal,
          transferTotal,
          otherTotal,
        }

        console.log("Order summary calculated:", summary)
        setOrderSummary(summary)

        // Pre-llenar los montos con los valores calculados
        setFormData((prev) => ({
          ...prev,
          cashAmount: summary.cashTotal,
          cardAmount: summary.cardTotal,
          transferAmount: summary.transferTotal,
          otherAmount: summary.otherTotal,
        }))
      } catch (error) {
        console.error("Error loading order summary:", error)
        setError("Error al cargar el resumen de órdenes")
        // En caso de error, usar valores por defecto
        setOrderSummary({
          cashTotal: 0,
          cardTotal: 0,
          transferTotal: 0,
          otherTotal: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadOrderSummary()
  }, [currentSession, tenantId, shifts])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "notes") {
      setFormData((prev) => ({ ...prev, [name]: value }))
    } else {
      // Convert to number for amount fields
      const numValue = Number.parseFloat(value) || 0
      setFormData((prev) => ({ ...prev, [name]: numValue }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!currentSession) {
        throw new Error("No hay una sesión activa para cerrar")
      }

      const totalCounted = formData.cashAmount + formData.cardAmount + formData.transferAmount + formData.otherAmount
      const expectedTotal =
        orderSummary.cashTotal + orderSummary.cardTotal + orderSummary.transferTotal + orderSummary.otherTotal

      // Calculate difference between counted and expected
      const difference = totalCounted - expectedTotal

      await closeSession({
        sessionId: currentSession.id,
        endCash: formData.cashAmount,
        endCard: formData.cardAmount,
        endOther: formData.transferAmount + formData.otherAmount,
        difference,
        notes: formData.notes,
      })

      setSuccess(true)

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/admin/dashboard")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cerrar la sesión")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentSession) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No hay una sesión activa para cerrar</AlertDescription>
      </Alert>
    )
  }

  const totalCounted = formData.cashAmount + formData.cardAmount + formData.transferAmount + formData.otherAmount
  const expectedTotal =
    orderSummary.cashTotal + orderSummary.cardTotal + orderSummary.transferTotal + orderSummary.otherTotal
  const difference = totalCounted - expectedTotal

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cerrar Caja</CardTitle>
            <CardDescription>Completa la información para cerrar la sesión de caja actual</CardDescription>
          </div>
          {fromOrders && (
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Pedidos
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando datos de ventas...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Resumen de pedidos por método de pago */}
            <OrderSummaryByPayment
              cashTotal={orderSummary.cashTotal}
              cardTotal={orderSummary.cardTotal}
              transferTotal={orderSummary.transferTotal}
              otherTotal={orderSummary.otherTotal}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cashAmount">Efectivo en caja</Label>
                <Input
                  id="cashAmount"
                  name="cashAmount"
                  type="number"
                  step="0.01"
                  value={formData.cashAmount || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardAmount">Total en tarjetas</Label>
                <Input
                  id="cardAmount"
                  name="cardAmount"
                  type="number"
                  step="0.01"
                  value={formData.cardAmount || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transferAmount">Total en transferencias</Label>
                <Input
                  id="transferAmount"
                  name="transferAmount"
                  type="number"
                  step="0.01"
                  value={formData.transferAmount || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherAmount">Otros métodos de pago</Label>
                <Input
                  id="otherAmount"
                  name="otherAmount"
                  type="number"
                  step="0.01"
                  value={formData.otherAmount || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Observaciones, incidencias, etc."
                rows={3}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <h3 className="font-medium text-sm">Cuadre de caja</h3>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total contado:</div>
                <div className="text-right font-medium">{formatCurrency(totalCounted)}</div>

                <div>Total esperado:</div>
                <div className="text-right font-medium">{formatCurrency(expectedTotal)}</div>

                <div>Diferencia:</div>
                <div
                  className={`text-right font-medium ${difference < 0 ? "text-red-600" : difference > 0 ? "text-green-600" : ""}`}
                >
                  {formatCurrency(difference)}
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>Sesión cerrada correctamente. Redirigiendo...</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting || success}>
              {isSubmitting ? "Cerrando caja..." : "Cerrar caja"}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div>Sesión iniciada: {new Date(currentSession.startTime).toLocaleString()}</div>
        <div>Por: {currentSession.openedBy}</div>
      </CardFooter>
    </Card>
  )
}
