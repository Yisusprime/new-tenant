"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCashier } from "./cashier-context"
import { formatCurrency } from "@/lib/utils"
import { ref, get } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"

export function SessionSummary() {
  const { currentSession } = useCashier()
  const [summary, setSummary] = useState<{
    totalSales: number
    cashSales: number
    cardSales: number
    transferSales: number
    otherSales: number
    tips: number
    totalOrders: number
    completedOrders: number
    canceledOrders: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessionSummary = async () => {
      if (!currentSession) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // Obtener todas las órdenes para el tenant actual
        const ordersRef = ref(rtdb, `tenants/${currentSession.tenantId}/orders`)
        const ordersSnapshot = await get(ordersRef)

        if (ordersSnapshot.exists()) {
          const ordersData = ordersSnapshot.val()

          // Filtrar órdenes que pertenecen a la sesión actual
          const sessionOrders = Object.values(ordersData).filter((order: any) => {
            // Incluir órdenes creadas durante esta sesión
            return (
              order.createdAt >= currentSession.startTime &&
              (!currentSession.endTime || order.createdAt <= currentSession.endTime)
            )
          })

          // Calcular totales
          let totalSales = 0
          let cashSales = 0
          let cardSales = 0
          let transferSales = 0
          let otherSales = 0
          let tips = 0
          let completedOrders = 0
          let canceledOrders = 0

          sessionOrders.forEach((order: any) => {
            // Contar órdenes por estado
            if (order.status === "completed") {
              completedOrders++
              // Sumar ventas solo de órdenes completadas
              totalSales += order.total || 0
              tips += order.tip || 0

              // Clasificar por método de pago
              switch (order.paymentMethod) {
                case "cash":
                  cashSales += order.total || 0
                  break
                case "card":
                  cardSales += order.total || 0
                  break
                case "transfer":
                  transferSales += order.total || 0
                  break
                default:
                  otherSales += order.total || 0
                  break
              }
            } else if (order.status === "cancelled") {
              canceledOrders++
            }
          })

          setSummary({
            totalSales,
            cashSales,
            cardSales,
            transferSales,
            otherSales,
            tips,
            totalOrders: sessionOrders.length,
            completedOrders,
            canceledOrders,
          })
        } else {
          // No hay órdenes, establecer valores en cero
          setSummary({
            totalSales: 0,
            cashSales: 0,
            cardSales: 0,
            transferSales: 0,
            otherSales: 0,
            tips: 0,
            totalOrders: 0,
            completedOrders: 0,
            canceledOrders: 0,
          })
        }
      } catch (error) {
        console.error("Error al obtener el resumen de la sesión:", error)
        // En caso de error, establecer valores en cero
        setSummary({
          totalSales: 0,
          cashSales: 0,
          cardSales: 0,
          transferSales: 0,
          otherSales: 0,
          tips: 0,
          totalOrders: 0,
          completedOrders: 0,
          canceledOrders: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSessionSummary()
  }, [currentSession])

  if (!currentSession) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No hay sesión activa</CardTitle>
          <CardDescription>Abre una nueva sesión para comenzar a registrar ventas</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Cargando resumen...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error al cargar el resumen</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const sessionDuration = Date.now() - currentSession.startTime
  const hours = Math.floor(sessionDuration / (1000 * 60 * 60))
  const minutes = Math.floor((sessionDuration % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resumen de Sesión Actual</CardTitle>
        <CardDescription>
          Sesión iniciada: {new Date(currentSession.startTime).toLocaleString()} ({hours}h {minutes}m)
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="text-sm text-blue-600">Ventas Totales</div>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalSales)}</div>
          </div>

          <div className="bg-green-50 p-4 rounded-md">
            <div className="text-sm text-green-600">Efectivo</div>
            <div className="text-2xl font-bold">{formatCurrency(summary.cashSales)}</div>
          </div>

          <div className="bg-orange-50 p-4 rounded-md">
            <div className="text-sm text-orange-600">Tarjeta</div>
            <div className="text-2xl font-bold">{formatCurrency(summary.cardSales)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-600">Órdenes</div>
            <div className="text-xl font-bold">{summary.totalOrders}</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-600">Completadas</div>
            <div className="text-xl font-bold">{summary.completedOrders}</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-600">Canceladas</div>
            <div className="text-xl font-bold">{summary.canceledOrders}</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-600">Propinas</div>
            <div className="text-xl font-bold">{formatCurrency(summary.tips)}</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium mb-2">Detalles de la sesión</h3>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Efectivo inicial:</div>
            <div className="text-right font-medium">{formatCurrency(currentSession.initialCash)}</div>

            <div>Abierto por:</div>
            <div className="text-right font-medium">{currentSession.openedBy}</div>

            <div>Ticket promedio:</div>
            <div className="text-right font-medium">
              {summary.completedOrders > 0
                ? formatCurrency(summary.totalSales / summary.completedOrders)
                : formatCurrency(0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
