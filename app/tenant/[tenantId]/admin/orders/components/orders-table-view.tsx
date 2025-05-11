"use client"

import { useState } from "react"
import type { Order, OrderStatus } from "@/lib/types/order"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import OrderDetailsModal from "./order-details-modal"
import { Skeleton } from "@/components/ui/skeleton"

interface OrdersTableViewProps {
  orders: Order[]
  onStatusChange: (orderId: string, status: OrderStatus) => void
  loading?: boolean
}

export default function OrdersTableView({ orders, onStatusChange, loading = false }: OrdersTableViewProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Group orders by table
  const ordersByTable: Record<string, Order[]> = {}

  orders.forEach((order) => {
    const tableNumber = order.tableNumber || "Sin mesa"
    if (!ordersByTable[tableNumber]) {
      ordersByTable[tableNumber] = []
    }
    ordersByTable[tableNumber].push(order)
  })

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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (Object.keys(ordersByTable).length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg">
        <p className="text-muted-foreground">No hay pedidos de mesa activos</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(ordersByTable).map(([tableNumber, tableOrders]) => (
          <Card key={tableNumber} className="overflow-hidden">
            <CardHeader className="bg-muted pb-2">
              <CardTitle className="text-lg">Mesa {tableNumber}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {tableOrders.map((order) => (
                  <div key={order.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">Pedido #{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">{order.customerName}</div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(order.status)}>{getStatusLabel(order.status)}</Badge>
                    </div>

                    <div className="space-y-1 mb-3">
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

                    <div className="flex justify-between items-center">
                      <div className="font-medium">Total: {formatCurrency(order.total)}</div>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(order)}>
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
