"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { getCashMovements } from "@/lib/services/cash-register-service"
import { ref, get } from "firebase/database"
import { realtimeDb } from "@/lib/firebase/client"
import type { CashMovement } from "@/lib/types/cash-register"
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, AlertTriangle } from "lucide-react"
import type { JSX } from "react"

interface CashMovementsListProps {
  tenantId: string
  branchId: string
  registerId: string
}

export function CashMovementsList({ tenantId, branchId, registerId }: CashMovementsListProps) {
  const [movements, setMovements] = useState<(CashMovement & { isCancelled?: boolean })[]>([])
  const [loading, setLoading] = useState(true)

  const loadMovements = async () => {
    try {
      setLoading(true)
      const data = await getCashMovements(tenantId, branchId, registerId)

      // Obtener todos los pedidos para verificar su estado
      const ordersRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/orders`)
      const ordersSnapshot = await get(ordersRef)
      const orders = ordersSnapshot.exists() ? ordersSnapshot.val() : {}

      // Marcar los movimientos de pedidos cancelados
      const enhancedMovements = data.map((movement) => {
        if (movement.orderId && movement.type === "sale") {
          const order = orders[movement.orderId]
          if (order && order.status === "cancelled") {
            return { ...movement, isCancelled: true }
          }
        }
        return { ...movement, isCancelled: false }
      })

      setMovements(enhancedMovements)
    } catch (error) {
      console.error("Error al cargar movimientos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMovements()
  }, [tenantId, branchId, registerId])

  // Función para obtener el color y texto según el tipo de movimiento
  const getMovementTypeInfo = (type: string, isCancelled = false) => {
    const typeMap: Record<string, { color: string; text: string; icon: JSX.Element }> = {
      income: {
        color: "bg-green-100 text-green-800",
        text: "Ingreso",
        icon: <ArrowUpCircle className="h-4 w-4 text-green-600" />,
      },
      expense: {
        color: "bg-red-100 text-red-800",
        text: "Gasto",
        icon: <ArrowDownCircle className="h-4 w-4 text-red-600" />,
      },
      sale: {
        color: isCancelled ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800",
        text: isCancelled ? "Venta Cancelada" : "Venta",
        icon: isCancelled ? (
          <AlertTriangle className="h-4 w-4 text-gray-600" />
        ) : (
          <ArrowUpCircle className="h-4 w-4 text-blue-600" />
        ),
      },
      refund: {
        color: "bg-orange-100 text-orange-800",
        text: "Reembolso",
        icon: <ArrowDownCircle className="h-4 w-4 text-orange-600" />,
      },
      withdrawal: {
        color: "bg-purple-100 text-purple-800",
        text: "Retiro",
        icon: <ArrowDownCircle className="h-4 w-4 text-purple-600" />,
      },
      deposit: {
        color: "bg-indigo-100 text-indigo-800",
        text: "Depósito",
        icon: <ArrowUpCircle className="h-4 w-4 text-indigo-600" />,
      },
      adjustment: {
        color: "bg-gray-100 text-gray-800",
        text: "Ajuste",
        icon: <ArrowUpCircle className="h-4 w-4 text-gray-600" />,
      },
    }

    return typeMap[type] || { color: "bg-gray-100 text-gray-800", text: type, icon: null }
  }

  // Función para obtener el texto del método de pago
  const getPaymentMethodText = (method: string) => {
    const methodMap: Record<string, string> = {
      cash: "Efectivo",
      card: "Tarjeta",
      transfer: "Transferencia",
      app: "App de Pago",
      other: "Otro",
    }

    return methodMap[method] || method
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Movimientos</h3>
          <Skeleton className="h-9 w-24" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Movimientos</h3>
        <Button variant="outline" size="sm" onClick={loadMovements}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {movements.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No hay movimientos registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {movements.map((movement) => {
            const typeInfo = getMovementTypeInfo(movement.type, movement.isCancelled)
            const isNegative = ["expense", "refund", "withdrawal"].includes(movement.type)
            const isCancelled = movement.isCancelled

            return (
              <Card key={movement.id} className={isCancelled ? "border-gray-300 bg-gray-50" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      {typeInfo.icon}
                      <CardTitle className={`text-base ${isCancelled ? "line-through text-gray-500" : ""}`}>
                        {movement.description}
                      </CardTitle>
                    </div>
                    <Badge className={typeInfo.color}>{typeInfo.text}</Badge>
                  </div>
                  <CardDescription>
                    {formatDateTime(movement.createdAt)} • {getPaymentMethodText(movement.paymentMethod)}
                    {movement.reference && ` • Ref: ${movement.reference}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      {movement.orderNumber && (
                        <span className={`text-sm ${isCancelled ? "text-gray-500" : "text-gray-500"}`}>
                          Pedido #{movement.orderNumber}
                          {isCancelled && " (Cancelado)"}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-lg font-bold ${
                        isCancelled ? "text-gray-500" : isNegative ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {isNegative ? "-" : "+"}
                      {formatCurrency(movement.amount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
