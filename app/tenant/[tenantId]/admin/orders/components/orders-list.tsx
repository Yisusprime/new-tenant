"use client"

import { useState } from "react"
import type { Order, OrderStatus } from "@/lib/types/order"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Clock, Eye, User, MapPin, CreditCard, Timer } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { updateOrderStatus } from "@/lib/services/order-service"
import { OrderDetailsDialog } from "./order-details-dialog"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { OrderTimer } from "./order-timer"

interface OrdersListProps {
  orders: Order[]
  tenantId: string
  branchId: string
  onStatusChange: () => void
}

export function OrdersList({ orders, tenantId, branchId, onStatusChange }: OrdersListProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(tenantId, branchId, orderId, status)
      onStatusChange()
    } catch (error) {
      console.error("Error al actualizar estado:", error)
    }
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
      preparing: { label: "En preparación", className: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
      ready: { label: "Listo", className: "bg-green-100 text-green-800 hover:bg-green-200" },
      delivered: { label: "Entregado", className: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
      cancelled: { label: "Cancelado", className: "bg-red-100 text-red-800 hover:bg-red-200" },
    }

    const config = statusConfig[status]
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getOrderTypeBadge = (type: string) => {
    const typeConfig = {
      local: { label: "Local", className: "bg-purple-100 text-purple-800" },
      takeaway: { label: "Para llevar", className: "bg-indigo-100 text-indigo-800" },
      table: { label: "Mesa", className: "bg-blue-100 text-blue-800" },
      delivery: { label: "Delivery", className: "bg-green-100 text-green-800" },
    }

    const config = typeConfig[type as keyof typeof typeConfig]
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: es })
    } catch (error) {
      return dateString
    }
  }

  // Determinar qué fecha usar para el temporizador según el estado
  const getTimerStartTime = (order: Order) => {
    // Si está en preparación, usar la fecha de actualización (cuando cambió a preparación)
    if (order.status === "preparing") {
      return order.updatedAt
    }
    // Para otros estados, usar la fecha de creación
    return order.createdAt
  }

  if (orders.length === 0) {
    return <div className="text-center py-8 text-gray-500">No hay pedidos disponibles</div>
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Pedido #{order.orderNumber}</CardTitle>
                {getOrderTypeBadge(order.type)}
              </div>
              <div className="flex justify-between items-center mt-1">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDate(order.createdAt)}
                </div>
                <div className="flex items-center">
                  <Timer className="h-4 w-4 mr-1" />
                  <OrderTimer startTime={getTimerStartTime(order)} status={order.status} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {order.customerName || (order.type === "table" ? `Mesa ${order.tableNumber}` : "Cliente")}
                    </p>
                    {order.customerPhone && <p className="text-xs text-muted-foreground">{order.customerPhone}</p>}
                  </div>
                </div>

                {order.type === "delivery" && order.deliveryAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">
                        {order.deliveryAddress.street} {order.deliveryAddress.number}, {order.deliveryAddress.city}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.paymentMethod || "Método no especificado"} · {order.items.length} artículos
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    {getStatusBadge(order.status)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleStatusChange(order.id, "pending")}>Pendiente</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(order.id, "preparing")}>
                    En preparación
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(order.id, "ready")}>Listo</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(order.id, "delivered")}>
                    Entregado
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(order.id, "cancelled")}>
                    Cancelado
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" onClick={() => handleViewDetails(order)}>
                <Eye className="h-4 w-4 mr-2" />
                Detalles
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          tenantId={tenantId}
          branchId={branchId}
          onStatusChange={onStatusChange}
        />
      )}
    </div>
  )
}
