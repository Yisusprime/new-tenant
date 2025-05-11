"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBranch } from "../../../../lib/context/branch-context"
import { useOrders } from "../../../../lib/hooks/use-orders"

export default function OrdersPage() {
  const { currentBranch } = useBranch()
  const { orders, loading, error } = useOrders()
  const [activeTab, setActiveTab] = useState("all")

  // Si no hay sucursal seleccionada, mostrar mensaje
  if (!currentBranch) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">No hay sucursal seleccionada</p>
          <p>Por favor, selecciona una sucursal para continuar.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
        <Button>Nuevo Pedido</Button>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2 border-b">
          <button
            className={`px-4 py-2 ${activeTab === "all" ? "border-b-2 border-blue-500" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Todos
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "dine_in" ? "border-b-2 border-blue-500" : ""}`}
            onClick={() => setActiveTab("dine_in")}
          >
            Local
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "takeout" ? "border-b-2 border-blue-500" : ""}`}
            onClick={() => setActiveTab("takeout")}
          >
            Para Llevar
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "delivery" ? "border-b-2 border-blue-500" : ""}`}
            onClick={() => setActiveTab("delivery")}
          >
            Delivery
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "all"
              ? "Todos los Pedidos"
              : activeTab === "dine_in"
                ? "Pedidos para Consumo en Local"
                : activeTab === "takeout"
                  ? "Pedidos para Llevar"
                  : "Pedidos para Delivery"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Cargando pedidos...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-4">No hay pedidos disponibles</div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-medium">{order.orderNumber}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>
                    <Button variant="outline" size="sm">
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
