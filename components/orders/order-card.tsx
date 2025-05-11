"use client"

import { useState } from "react"
import type { Order, OrderStatus } from "@/lib/types/order"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "./order-status-badge"
import { OrderTypeBadge } from "./order-type-badge"
import { updateOrderStatus, getNextStatus } from "@/lib/services/order-service"
import { Clock, DollarSign, ChevronRight, User, Phone, MapPin, AlertCircle, MoreVertical } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { getOrderStatusOptions } from "@/lib/services/order-service"
import { toast } from "@/hooks/use-toast"

interface OrderCardProps {
  order: Order
  tenantId: string
  onStatusChange: () => void
}

export function OrderCard({ order, tenantId, onStatusChange }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      setIsUpdating(true)
      await updateOrderStatus(tenantId, order.branchId, order.id, newStatus)
      toast({
        title: "Estado actualizado",
        description: `Pedido #${order.orderNumber} actualizado a ${newStatus}`,
      })
      onStatusChange()
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const nextStatus = getNextStatus(order.status, order.type)
  const statusOptions = getOrderStatusOptions(order.type)
  const timeAgo = formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: es })

  return (
    <Card
      className={`w-full transition-all duration-200 ${order.status === "new" ? "border-blue-400 shadow-blue-100 shadow-md" : ""}`}
    >
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <OrderTypeBadge type={order.type} />
            <OrderStatusBadge status={order.status} />
          </div>
          <h3 className="text-lg font-bold">Pedido #{order.orderNumber}</h3>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Clock className="h-3 w-3 mr-1" />
            {timeAgo}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {statusOptions.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={isUpdating || order.status === status}
              >
                Cambiar a: <OrderStatusBadge status={status} />
              </DropdownMenuItem>
            ))}
            <Separator />
            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
            <DropdownMenuItem>Imprimir ticket</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pb-2">
        {order.type === "dine_in" && order.tableNumber && (
          <div className="mb-2 font-medium">Mesa: {order.tableNumber}</div>
        )}

        {order.customer && (
          <div className="mb-3 text-sm">
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              {order.customer.name}
            </div>
            <div className="flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              {order.customer.phone}
            </div>
            {order.type === "delivery" && order.customer.address && (
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {order.customer.address}
              </div>
            )}
          </div>
        )}

        <div className="space-y-1">
          <div className="font-medium">Productos ({order.items.length})</div>
          {isExpanded ? (
            <div className="space-y-2 mt-2">
              {order.items.map((item) => (
                <div key={item.id} className="text-sm">
                  <div className="flex justify-between">
                    <span>
                      {item.quantity}x {item.productName}
                    </span>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                  {item.extras && item.extras.length > 0 && (
                    <div className="ml-4 text-gray-500">
                      {item.extras.map((extra) => (
                        <div key={extra.id} className="flex justify-between">
                          <span>+ {extra.name}</span>
                          <span>${extra.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <div className="ml-4 text-gray-500 flex items-start">
                      <AlertCircle className="h-3 w-3 mr-1 mt-0.5" />
                      {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {order.items.slice(0, 2).map((item, index) => (
                <div key={index}>
                  {item.quantity}x {item.productName}
                </div>
              ))}
              {order.items.length > 2 && <div>+{order.items.length - 2} más...</div>}
            </div>
          )}
          <Button variant="ghost" size="sm" className="text-xs p-0 h-auto" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Ver menos" : "Ver más"}
          </Button>
        </div>

        <div className="flex justify-between items-center mt-3 font-medium">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            Total:
          </div>
          <div>${order.total.toFixed(2)}</div>
        </div>

        {order.notes && (
          <div className="mt-2 text-sm bg-amber-50 p-2 rounded-md flex items-start">
            <AlertCircle className="h-4 w-4 mr-1 text-amber-500 mt-0.5" />
            <span>{order.notes}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        {nextStatus && (
          <Button className="w-full" onClick={() => handleStatusChange(nextStatus)} disabled={isUpdating}>
            {isUpdating
              ? "Actualizando..."
              : `Marcar como ${
                  nextStatus === "received"
                    ? "Recibido"
                    : nextStatus === "preparing"
                      ? "En preparación"
                      : nextStatus === "ready"
                        ? "Listo"
                        : nextStatus === "in_transit"
                          ? "En camino"
                          : nextStatus === "delivered"
                            ? "Entregado"
                            : nextStatus === "completed"
                              ? "Completado"
                              : "Siguiente"
                }`}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
