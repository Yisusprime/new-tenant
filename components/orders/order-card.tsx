"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Order, OrderStatus } from "@/lib/types/order"
import { OrderStatusBadge } from "./order-status-badge"
import { OrderTypeBadge } from "./order-type-badge"
import { updateOrderStatus } from "@/lib/services/order-service"
import { toast } from "@/hooks/use-toast"
import { Loader2, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface OrderCardProps {
  order: Order
  tenantId: string
  branchId: string
  onStatusUpdate: () => void
}

export function OrderCard({ order, tenantId, branchId, onStatusUpdate }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      setIsUpdating(true)
      await updateOrderStatus(tenantId, branchId, order.id, newStatus)
      toast({
        title: "Estado actualizado",
        description: `El pedido #${order.orderNumber} ha sido actualizado a ${getStatusLabel(newStatus)}`,
      })
      onStatusUpdate()
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

  const getStatusLabel = (status: OrderStatus): string => {
    const statusMap: Record<OrderStatus, string> = {
      new: "Nuevo",
      received: "Recibido",
      preparing: "En preparación",
      ready: "Listo",
      in_transit: "En camino",
      delivered: "Entregado",
      completed: "Completado",
      cancelled: "Cancelado",
    }
    return statusMap[status] || status
  }

  const getNextStatuses = (): OrderStatus[] => {
    switch (order.status) {
      case "new":
        return ["received", "cancelled"]
      case "received":
        return ["preparing", "cancelled"]
      case "preparing":
        return ["ready", "cancelled"]
      case "ready":
        return order.type === "delivery" ? ["in_transit", "cancelled"] : ["completed", "cancelled"]
      case "in_transit":
        return ["delivered", "cancelled"]
      case "delivered":
        return ["completed"]
      case "completed":
        return []
      case "cancelled":
        return []
      default:
        return []
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const nextStatuses = getNextStatuses()

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold">Pedido #{order.orderNumber}</h3>
              <OrderTypeBadge type={order.type} />
            </div>
            <div className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          {order.customer && (
            <div className="text-sm">
              <div className="font-medium">Cliente:</div>
              <div>{order.customer.name}</div>
              {order.customer.phone && <div>Tel: {order.customer.phone}</div>}
              {order.type === "delivery" && order.customer.address && (
                <div className="mt-1">
                  <div className="font-medium">Dirección:</div>
                  <div>{order.customer.address}</div>
                </div>
              )}
            </div>
          )}

          {order.type === "dine_in" && order.tableNumber && (
            <div className="text-sm">
              <span className="font-medium">Mesa:</span> {order.tableNumber}
            </div>
          )}

          <div>
            <div className="font-medium mb-1">Productos:</div>
            <ul className="space-y-1 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.productName}
                    {item.notes && <span className="text-xs text-muted-foreground block">{item.notes}</span>}
                  </span>
                  <span>${item.subtotal.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Impuestos:</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            {order.deliveryFee !== undefined && (
              <div className="flex justify-between text-sm">
                <span>Envío:</span>
                <span>${order.deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold mt-1">
              <span>Total:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="text-sm">
              <div className="font-medium">Notas:</div>
              <div className="text-muted-foreground">{order.notes}</div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="font-medium">Pago:</span>{" "}
              {order.paymentMethod === "cash"
                ? "Efectivo"
                : order.paymentMethod === "card"
                  ? "Tarjeta"
                  : "Transferencia"}
            </div>
            <div className="text-sm">
              <span className="font-medium">Estado:</span> {order.paymentStatus === "paid" ? "Pagado" : "Pendiente"}
            </div>
          </div>

          {nextStatuses.length > 0 && (
            <div className="flex justify-between gap-2">
              {nextStatuses.length <= 2 ? (
                nextStatuses.map((status) => (
                  <Button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={isUpdating}
                    variant={status === "cancelled" ? "destructive" : "default"}
                    className="flex-1"
                  >
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {getStatusLabel(status)}
                  </Button>
                ))
              ) : (
                <>
                  <Button onClick={() => handleStatusUpdate(nextStatuses[0])} disabled={isUpdating} className="flex-1">
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {getStatusLabel(nextStatuses[0])}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {nextStatuses.slice(1).map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => handleStatusUpdate(status)}
                          className={status === "cancelled" ? "text-destructive" : ""}
                        >
                          {getStatusLabel(status)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
