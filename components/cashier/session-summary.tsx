"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCashier } from "./cashier-context"
import { formatCurrency } from "@/lib/utils"

export function SessionSummary() {
  const { currentSession, getSessionSummary } = useCashier()

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

  const summary = getSessionSummary(currentSession.id)

  if (!summary) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Cargando resumen...</CardTitle>
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
              {summary.totalOrders > 0 ? formatCurrency(summary.totalSales / summary.totalOrders) : formatCurrency(0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
