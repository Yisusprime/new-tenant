"use client"

import { useRestaurantStatus } from "@/lib/context/restaurant-status-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugRestaurantStatus() {
  const { isWithinHours, hasCashRegister, canAcceptOrders, statusMessage, debugInfo } = useRestaurantStatus()

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="m-4 border-2 border-blue-500">
      <CardHeader>
        <CardTitle className="text-blue-600">🐛 Debug - Estado del Restaurante</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <strong>Estado actual:</strong> {statusMessage}
        </div>
        <div>
          <strong>Dentro del horario:</strong> {isWithinHours ? "✅ Sí" : "❌ No"}
        </div>
        <div>
          <strong>Caja abierta:</strong> {hasCashRegister ? "✅ Sí" : "❌ No"}
        </div>
        <div>
          <strong>Puede aceptar pedidos:</strong> {canAcceptOrders ? "✅ Sí" : "❌ No"}
        </div>
        {debugInfo && (
          <div className="mt-4 p-2 bg-gray-100 rounded">
            <strong>Debug Info:</strong>
            <pre className="text-xs mt-1 overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
