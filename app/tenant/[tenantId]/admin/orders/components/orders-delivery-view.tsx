"use client"

import { useState } from "react"
import type { Order, OrderStatus } from "@/lib/types/order"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import OrderDetailsModal from "./order-details-modal"
import { MapPin, Phone } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface OrdersDeliveryViewProps {
  orders: Order[]
  onStatusChange: (orderId: string, status: OrderStatus) => void
  loading?: boolean
}

export default function OrdersDeliveryView({ orders, onStatusChange, loading = false }: OrdersDeliveryViewProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Group orders by status
  const pendingOrders = orders.filter((order) => order.status === "pending" || order.status === "received")
  const preparingOrders = orders.filter((order) => order.status === "preparing")
  const readyOrders = orders.filter((order) => order.status === "ready")
  const onTheWayOrders = orders.filter((order) => order.status === "on_the_way")
  const deliveredOrders = orders.filter((order) => order.status === "delivered" || order.status === "completed")

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "default"
      case "received":
        return "secondary"
      case "preparing":
        return "warning"
      case "ready":
        return "success"
      case "on_the_way":
        return "info"
      case "delivered":
        return "success"
      case "completed":
        return "success"
      case "cancelled":
        return "destructive"
      default:
        return "default"
    }
  }

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "received":
        return "Recibido"
      case "preparing":
        return "En preparación"
      case "ready":
        return "Listo"
      case "on_the_way":
        return "En camino"
      case "delivered":
        return "Entregado"
      case "completed":
        return "Completado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  const renderOrderCard = (order: Order) => (
    <Card key={order.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">Pedido #{order.orderNumber}</CardTitle>
          <Badge variant={getStatusBadgeVariant(order.status)}>{getStatusLabel(order.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="font-medium">{order.customerName}</div>
          {order.customerPhone && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{order.customerPhone}</span>
            </div>
          )}
          {order.deliveryAddress && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>
                {order.deliveryAddress.street} {order.deliveryAddress.number}, {order.deliveryAddress.city}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          {order.items.slice(0, 2).map((item) => (
            <div key={item.id} className="text-sm flex justify-between">
              <span>
                {item.quantity}x {item.productName}
              </span>
              <span>{formatCurrency(item.totalPrice)}</span>
            </div>
          ))}
          {order.items.length > 2 && (
            <div className="text-xs text-muted-foreground">Y {order.items.length - 2} productos más...</div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="font-medium">Total: {formatCurrency(order.total)}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleViewDetails(order)}>
              Detalles
            </Button>
            {order.status === "pending" && (
              <Button size="sm" onClick={() => onStatusChange(order.id, "received")}>
                Recibir
              </Button>
            )}
            {order.status === "received" && (
              <Button size="sm" onClick={() => onStatusChange(order.id, "preparing")}>
                Preparar
              </Button>
            )}
            {order.status === "preparing" && (
              <Button size="sm" onClick={() => onStatusChange(order.id, "ready")}>
                Listo
              </Button>
            )}
            {order.status === "ready" && (
              <Button size="sm" onClick={() => onStatusChange(order.id, "on_the_way")}>
                En camino
              </Button>
            )}
            {order.status === "on_the_way" && (
              <Button size="sm" onClick={() => onStatusChange(order.id, "delivered")}>
                Entregado
              </Button>
            )}
            {order.status === "delivered" && (
              <Button size="sm" onClick={() => onStatusChange(order.id, "completed")}>
                Completar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg">
        <p className="text-muted-foreground">No hay pedidos de delivery activos</p>
      </div>
    )
  }

  return (
    <>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="pending">Pendientes ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="preparing">Preparando ({preparingOrders.length})</TabsTrigger>
          <TabsTrigger value="ready">Listos ({readyOrders.length})</TabsTrigger>
          <TabsTrigger value="on_the_way">En camino ({onTheWayOrders.length})</TabsTrigger>
          <TabsTrigger value="delivered">Entregados ({deliveredOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingOrders.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground">No hay pedidos pendientes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingOrders.map(renderOrderCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preparing">
          {preparingOrders.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground">No hay pedidos en preparación</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {preparingOrders.map(renderOrderCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ready">
          {readyOrders.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground">No hay pedidos listos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readyOrders.map(renderOrderCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="on_the_way">
          {onTheWayOrders.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground">No hay pedidos en camino</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {onTheWayOrders.map(renderOrderCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="delivered">
          {deliveredOrders.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground">No hay pedidos entregados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliveredOrders.map(renderOrderCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          onStatusChange={onStatusChange}
        />
      )}
    </>
  )
}
