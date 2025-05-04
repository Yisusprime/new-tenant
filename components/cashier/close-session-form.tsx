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
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"
import { useCashier } from "./cashier-context"
import { formatCurrency } from "@/lib/utils"
import { OrderSummaryByPayment } from "./order-summary-by-payment"

export function CloseSessionForm() {
  const { currentSession, closeSession } = useCashier()
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromOrders = searchParams.get("action") === "close"

  const [isSubmitting, setIsSubmitting] = useState(false)
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
    if (currentSession) {
      // Aquí cargaríamos los datos reales de Firebase
      // Por ahora usamos datos de ejemplo
      const summary = {
        cashTotal: 1250.75,
        cardTotal: 850.5,
        transferTotal: 320.25,
        otherTotal: 75.0,
      }

      setOrderSummary(summary)

      // Pre-llenar los montos con los valores esperados
      setFormData((prev) => ({
        ...prev,
        cashAmount: summary.cashTotal,
        cardAmount: summary.cardTotal,
        transferAmount: summary.transferTotal,
        otherAmount: summary.otherTotal,
      }))
    }
  }, [currentSession])

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
        endTransfer: formData.transferAmount,
        endOther: formData.otherAmount,
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
                required
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
                required
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
                required
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
      </CardContent>

      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div>Sesión iniciada: {new Date(currentSession.startTime).toLocaleString()}</div>
        <div>Por: {currentSession.openedBy}</div>
      </CardFooter>
    </Card>
  )
}
