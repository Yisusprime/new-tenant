"use client"

import { useState, useEffect } from "react"
import { useOrderContext } from "./order-context"
import type { OrderStatus } from "@/lib/types/orders"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { OrderCard } from "./order-card"

export const OrderList = () => {
  const { orders, loading, error, fetchOrders } = useOrderContext()
  const [activeTab, setActiveTab] = useState<OrderStatus>("pending")
  const [orderCounts, setOrderCounts] = useState<Record<OrderStatus, number>>({
    pending: 0,
    preparing: 0,
    ready: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
  })

  // Calcular el número de pedidos en cada estado
  useEffect(() => {
    const counts: Record<OrderStatus, number> = {
      pending: 0,
      preparing: 0,
      ready: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
    }

    orders.forEach((order) => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++
      }
    })

    setOrderCounts(counts)
  }, [orders])

  const filteredOrders = orders.filter((order) => order.status === activeTab)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Cargando pedidos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2 text-destructive">
          <AlertCircle className="h-8 w-8" />
          <p>Error al cargar los pedidos: {error}</p>
          <Button onClick={() => fetchOrders()} variant="outline" size="sm">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  // Definir los estados y sus etiquetas
  const orderStatuses: { status: OrderStatus; label: string; color: string }[] = [
    { status: "pending", label: "Pendientes", color: "bg-yellow-500" },
    { status: "preparing", label: "Preparando", color: "bg-blue-500" },
    { status: "ready", label: "Listos", color: "bg-green-500" },
    { status: "delivered", label: "Entregados", color: "bg-purple-500" },
    { status: "completed", label: "Completados", color: "bg-green-700" },
    { status: "cancelled", label: "Cancelados", color: "bg-red-500" },
  ]

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Gestión de Pedidos</h2>

        {/* Pestañas de estado para pantallas medianas y grandes */}
        <div className="hidden md:flex flex-wrap gap-2">
          {orderStatuses.map(({ status, label, color }) => (
            <Button
              key={status}
              variant={activeTab === status ? "default" : "outline"}
              className={`relative ${activeTab === status ? color + " text-white" : ""}`}
              onClick={() => setActiveTab(status)}
            >
              {label}
              {orderCounts[status] > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {orderCounts[status]}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Pestañas de estado para móviles */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {orderStatuses.map(({ status, label, color }) => (
              <Button
                key={status}
                variant={activeTab === status ? "default" : "outline"}
                className={`relative ${activeTab === status ? color + " text-white" : ""}`}
                onClick={() => setActiveTab(status)}
                size="sm"
              >
                <span className="truncate">{label}</span>
                {orderCounts[status] > 0 && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {orderCounts[status]}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">
              No hay pedidos {orderStatuses.find((s) => s.status === activeTab)?.label.toLowerCase()}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} activeTab={activeTab} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
