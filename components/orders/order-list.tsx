"use client"

import { useState } from "react"
import { useOrderContext } from "./order-context"
import type { OrderStatus } from "@/lib/types/orders"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle } from "lucide-react"
import { OrderCard } from "./order-card"

export const OrderList = () => {
  const { orders, loading, error, fetchOrders } = useOrderContext()
  const [activeTab, setActiveTab] = useState<OrderStatus>("pending")

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

  return (
    <div className="space-y-4">
      <Tabs defaultValue="pending" value={activeTab} onValueChange={(value) => setActiveTab(value as OrderStatus)}>
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="preparing">Preparando</TabsTrigger>
          <TabsTrigger value="ready">Listos</TabsTrigger>
          <TabsTrigger value="delivered">Entregados</TabsTrigger>
          <TabsTrigger value="completed">Completados</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hay pedidos {activeTab.toLowerCase()}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} activeTab={activeTab} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
